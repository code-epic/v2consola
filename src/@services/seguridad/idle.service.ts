import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import Swal from 'sweetalert2';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import jwt_decode from "jwt-decode";

@Injectable({
    providedIn: 'root'
})
export class IdleService {

    private idleTimer: Subscription;
    private eventSubscription: Subscription;
    private lastActivity: number = Date.now();
    private duration: number = 300; // Default 5 minutes if not found
    private checkInterval: number = 1000; // Check every second
    private isModalOpen: boolean = false;

    constructor(
        private router: Router,
        private loginService: LoginService,
        private ngZone: NgZone
    ) { }

    init() {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        try {
            const decoded: any = jwt_decode(token);
            // User specified firmadigital.duracion is in seconds
            // console.log(decoded.Usuario);
            if (decoded.Usuario.FirmaDigital && decoded.Usuario.FirmaDigital.duracion) {
                this.duration = parseInt(decoded.Usuario.FirmaDigital.duracion);
            } else {
                console.warn('IdleService: No duration found in token, using default 300s');
                this.duration = 300;
            }

            // console.log('IdleService: Duration set to', this.duration, 'seconds');
            this.startWatching();
            this.startTimer();
        } catch (error) {
            console.error('IdleService: Error decoding token', error);
        }
    }

    private startWatching() {
        const events = [
            'mousemove', 'click', 'scroll', 'keypress', 'touchstart'
        ];

        const eventStreams = events.map(ev => fromEvent(document, ev));
        const allEvents = merge(...eventStreams);

        this.eventSubscription = allEvents.pipe(
            throttleTime(1000) // Limit to 1 event per second to reduce overhead
        ).subscribe(() => {
            this.resetTimer();
        });
    }

    private resetTimer() {
        this.lastActivity = Date.now();
    }

    private startTimer() {
        // Run outside Angular to avoid triggering change detection every second
        this.ngZone.runOutsideAngular(() => {
            this.idleTimer = timer(0, this.checkInterval).subscribe(() => {
                this.checkIdle();
            });
        });
    }

    private checkIdle() {
        if (this.isModalOpen) return;

        const now = Date.now();
        const timeInactive = (now - this.lastActivity) / 1000; // Seconds

        // Check if inactivity has exceeded duration
        if (timeInactive >= this.duration) {
            this.ngZone.run(() => {
                this.handleTimeout();
            });
        }
    }

    private handleTimeout() {
        this.isModalOpen = true;

        let timerInterval;

        Swal.fire({
            title: '¡Gracias por su visita!',
            html: '¿Desea continuar disfrutando de nuestros servicios o prefiere cerrar sesión por seguridad?<br><br>Cerrando sesión en <b></b> segundos.',
            icon: 'question',
            showDenyButton: true,
            confirmButtonText: 'Continuar Sesión',
            denyButtonText: 'Cerrar Sesión',
            confirmButtonColor: '#7367f0', // Primary
            denyButtonColor: '#ea5455', // Danger
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 60000, // 60 seconds grace period
            timerProgressBar: true,
            didOpen: () => {
                const b = Swal.getHtmlContainer().querySelector('b');
                timerInterval = setInterval(() => {
                    if (b) {
                        b.textContent = Math.round(Swal.getTimerLeft() / 1000).toString();
                    }
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            this.isModalOpen = false;

            if (result.isConfirmed) {
                // User wants to stay
                this.resetTimer();
                Swal.fire({
                    icon: 'success',
                    title: 'Sesión Extendida',
                    text: 'Puede continuar trabajando.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else if (result.isDenied || result.dismiss === Swal.DismissReason.timer) {
                // User wants to leave or timer expired
                this.logout();
            }
        });
    }

    private logout() {
        // Stop watching
        if (this.eventSubscription) this.eventSubscription.unsubscribe();
        if (this.idleTimer) this.idleTimer.unsubscribe();

        // Perform logout
        this.loginService.logout(); // Navigate to login and clear session
    }

    public stop() {
        if (this.eventSubscription) this.eventSubscription.unsubscribe();
        if (this.idleTimer) this.idleTimer.unsubscribe();
    }
}
