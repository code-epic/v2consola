import { Injectable, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { LoginService } from './login.service'
import Swal from 'sweetalert2'
import { fromEvent, merge, Subscription, timer, BehaviorSubject } from 'rxjs'
import { throttleTime } from 'rxjs/operators'
import jwt_decode from "jwt-decode"

export interface IIdleState {
    isIdle: boolean;
    remainingSeconds: number;
    formattedTime: string;
    totalDuration: number;
    isWarning: boolean;
    isDanger: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class IdleService {

    private idleTimer: Subscription
    private eventSubscription: Subscription
    private lastActivity: number = Date.now()
    private duration: number = 300
    private checkInterval: number = 1000
    private isModalOpen: boolean = false

    public idleState$ = new BehaviorSubject<IIdleState>({
        isIdle: false,
        remainingSeconds: 300,
        formattedTime: '05:00',
        totalDuration: 300,
        isWarning: false,
        isDanger: false
    })

    constructor(
        private router: Router,
        private loginService: LoginService,
        private ngZone: NgZone
    ) { }

    init() {
        this.stop()
        const token = sessionStorage.getItem('token')
        if (!token) return

        try {
            const decoded: any = jwt_decode(token)
            const usuario = decoded?.Usuario || decoded;
            const firma = usuario?.FirmaDigital || usuario?.firmadigital;
            const rawDuracion = firma?.duracion ?? usuario?.duraciontiempo ?? usuario?.duracion;

            if (rawDuracion !== undefined && rawDuracion !== null) {
                const minutos = parseInt(rawDuracion, 10);
                // Si la duración en FirmaDigital viene en minutos (<= 60), convertimos a segundos (ej. 5 min -> 300 s)
                // Si ya viene en segundos (> 60), usamos el valor directamente
                this.duration = (!isNaN(minutos) && minutos > 0) ? (minutos <= 60 ? minutos * 60 : minutos) : 300;
            } else {
                this.duration = 300; // 5 minutos por defecto (en segundos)
            }

            this.resetTimer()
            this.startWatching()
            this.startTimer()
        } catch (error) {
            console.error('IdleService: Error decoding token', error)
        }
    }

    private startWatching() {
        const events = [
            'mousemove', 'click', 'scroll', 'keypress', 'touchstart'
        ]

        const eventStreams = events.map(ev => fromEvent(document, ev))
        const allEvents = merge(...eventStreams)

        this.eventSubscription = allEvents.pipe(
            throttleTime(500)
        ).subscribe(() => {
            this.resetTimer()
        })
    }

    private resetTimer() {
        this.lastActivity = Date.now()
        const minutes = Math.floor(this.duration / 60)
        const seconds = this.duration % 60
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

        this.ngZone.run(() => {
            this.idleState$.next({
                isIdle: false,
                remainingSeconds: this.duration,
                formattedTime,
                totalDuration: this.duration,
                isWarning: false,
                isDanger: false
            })
        })
    }

    public resetSession() {
        this.isModalOpen = false
        this.resetTimer()
    }

    private startTimer() {
        this.ngZone.runOutsideAngular(() => {
            this.idleTimer = timer(0, this.checkInterval).subscribe(() => {
                this.checkIdle()
            })
        })
    }

    private checkIdle() {
        if (this.isModalOpen) return

        if (this.router.url.includes('/login') || !sessionStorage.getItem('token')) {
            this.stop()
            return
        }

        const now = Date.now()
        const secondsInactive = Math.floor((now - this.lastActivity) / 1000)

        // La inactividad inicia cuando el cursor pasa más de 5 segundos en reposo
        const isIdle = secondsInactive >= 5
        const remainingSeconds = isIdle ? Math.max(0, this.duration - secondsInactive) : this.duration

        const minutes = Math.floor(remainingSeconds / 60)
        const seconds = remainingSeconds % 60
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

        this.ngZone.run(() => {
            this.idleState$.next({
                isIdle,
                remainingSeconds,
                formattedTime,
                totalDuration: this.duration,
                isWarning: remainingSeconds <= 60 && remainingSeconds > 20,
                isDanger: remainingSeconds <= 20
            })
        })

        if (secondsInactive >= this.duration) {
            this.ngZone.run(() => {
                this.handleTimeout()
            })
        }
    }

    private handleTimeout() {
        if (this.isModalOpen) return
        this.isModalOpen = true

        let timerInterval: any

        Swal.fire({
            title: '¡Gracias por su visita!',
            html: '¿Desea continuar disfrutando de nuestros servicios o prefiere cerrar sesión por seguridad?<br><br>Cerrando sesión en <b>60</b> segundos.',
            icon: 'question',
            showDenyButton: true,
            confirmButtonText: 'Continuar Sesión',
            denyButtonText: 'Cerrar Sesión',
            confirmButtonColor: '#7367f0',
            denyButtonColor: '#ea5455',
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 60000,
            timerProgressBar: true,
            didOpen: () => {
                const b = Swal.getHtmlContainer()?.querySelector('b')
                if (b) {
                    const timerLeft = Swal.getTimerLeft()
                    if (timerLeft !== undefined) {
                        b.textContent = Math.round(timerLeft / 1000).toString()
                    }
                }
                timerInterval = setInterval(() => {
                    const timerLeft = Swal.getTimerLeft()
                    if (timerLeft !== undefined && b) {
                        b.textContent = Math.max(0, Math.round(timerLeft / 1000)).toString()
                    }
                }, 200)
            },
            willClose: () => {
                if (timerInterval) {
                    clearInterval(timerInterval)
                }
            }
        }).then((result) => {
            if (timerInterval) {
                clearInterval(timerInterval)
            }
            this.isModalOpen = false

            if (result.isConfirmed) {
                // Cerramos inmediatamente cualquier overlay activo para liberar la pantalla
                Swal.close()
                this.resetTimer()

                // Toast discreto y no bloqueante que no interfiere con las operaciones del usuario
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: false
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Sesión Extendida'
                })
            } else if (result.isDenied || result.dismiss === Swal.DismissReason.timer) {
                this.logout()
            }
        }).catch((err) => {
            console.warn('IdleService: Error al procesar modal', err)
            if (timerInterval) {
                clearInterval(timerInterval)
            }
            this.isModalOpen = false
            this.resetTimer()
        })
    }

    private logout() {
        this.stop()
        this.router.navigate(['/miscellaneous/logout']);
    }

    public stop() {
        if (this.eventSubscription) this.eventSubscription.unsubscribe()
        if (this.idleTimer) this.idleTimer.unsubscribe()
        this.isModalOpen = false
    }
}
