import { Injectable, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { LoginService } from './login.service'
import Swal from 'sweetalert2'
import { fromEvent, merge, Subscription, timer } from 'rxjs'
import { throttleTime } from 'rxjs/operators'
import jwt_decode from "jwt-decode"

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

    constructor(
        private router: Router,
        private loginService: LoginService,
        private ngZone: NgZone
    ) { }

    init() {
        this.stop()
        this.resetTimer()
        const token = sessionStorage.getItem('token')
        if (!token) return

        try {
            const decoded: any = jwt_decode(token)
            if (decoded.Usuario.FirmaDigital && decoded.Usuario.FirmaDigital.duracion) {
                this.duration = parseInt(decoded.Usuario.FirmaDigital.duracion)
            } else {
                this.duration = 300
            }

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
            throttleTime(1000)
        ).subscribe(() => {
            this.resetTimer()
        })
    }

    private resetTimer() {
        this.lastActivity = Date.now()
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
        const timeInactive = (now - this.lastActivity) / 1000

        if (timeInactive >= this.duration) {
            this.ngZone.run(() => {
                this.handleTimeout()
            })
        }
    }

    private handleTimeout() {
        this.isModalOpen = true

        let timerInterval

        Swal.fire({
            title: '¡Gracias por su visita!',
            html: '¿Desea continuar disfrutando de nuestros servicios o prefiere cerrar sesión por seguridad?<br><br>Cerrando sesión en <b></b> segundos.',
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
                const b = Swal.getHtmlContainer().querySelector('b')
                timerInterval = setInterval(() => {
                    if (b) {
                        b.textContent = Math.round(Swal.getTimerLeft() / 1000).toString()
                    }
                }, 100)
            },
            willClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            this.isModalOpen = false

            if (result.isConfirmed) {
                this.resetTimer()
                Swal.fire({
                    icon: 'success',
                    title: 'Sesión Extendida',
                    text: 'Puede continuar trabajando.',
                    timer: 1500,
                    showConfirmButton: false
                })
            } else if (result.isDenied || result.dismiss === Swal.DismissReason.timer) {
                this.logout()
            }
        })
    }

    private logout() {
        this.stop()
        this.loginService.logout()
    }

    public stop() {
        if (this.eventSubscription) this.eventSubscription.unsubscribe()
        if (this.idleTimer) this.idleTimer.unsubscribe()
        this.isModalOpen = false
    }
}

