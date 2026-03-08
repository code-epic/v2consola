import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ApiService } from '@services/apicore/api.service';
import { LoginService } from '@services/seguridad/login.service';

interface Message {
    id: string;
    sender: string;
    text: string;
    timestamp: Date;
    type: 'sent' | 'received';
    isTyping?: boolean;
    status?: string;
    attachments?: any[];
    fileInfo?: {
        name: string;
        size: string;
        extension: string;
        icon: string;
    };
}

interface User {
    id: string;
    name: string;
    mac_address: string;
    remote_addr: string;
    status: 'online' | 'busy' | 'offline';
    history: Message[];
}

@Component({
    selector: 'app-chatroom',
    templateUrl: './chatroom.component.html',
    styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;
    @ViewChild('fileInput') private fileInput: ElementRef;

    // Variables de configuración
    saveHistory: boolean = true;
    encryptionActive: boolean = true;
    analyzeTraffic: boolean = false;
    showTools: boolean = true;

    // Variables de carga de archivos
    isUploading: boolean = false;
    uploadProgress: number = 0;



    activeUser: User;
    users: User[] = [];

    messages: Message[] = [];
    newMessage: string = '';
    availableCommands: string[] = ['/silenciar', '/limpiar', '/bloquear', '/rastrear', '/capturar'];

    constructor(private apiService: ApiService, private loginService: LoginService) { }

    ngOnInit(): void {
        this.scrollToBottom();
        this.apiService.GetConnectionsWebSocket().subscribe(
            (data: any) => {
                console.log(data);
                this.users = data.message.map(u => ({
                    id: u.id,
                    name: u.name,
                    mac_address: u.mac_address,
                    remote_addr: u.remote_addr,
                    status: u.status,
                    history: [] // Inicializar con historial vacío o cargar de algún lugar
                }));

                if (this.users.length > 0 && !this.activeUser) {
                    this.selectUser(this.users[0]);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    sendMessage() {
        if (this.newMessage.trim() === '') return;

        // Lógica simple para comandos
        if (this.newMessage.startsWith('/')) {
            const command = this.newMessage.split(' ')[0];
            this.executeCommand(command);
            this.newMessage = '';
            return;
        }

        const msgHistory: Message = {
            id: Date.now().toString(),
            sender: 'Admin',
            text: this.newMessage,
            timestamp: new Date(),
            type: 'sent',
            status: 'Cifrado'
        };

        this.messages.push(msgHistory);
        if (this.activeUser) {
            this.activeUser.history.push(msgHistory);
        }

        // Mapeo de Payload para el Backend (Sandra ResponsePayload)
        const payload = {
            type: 'chat',
            clientId: this.activeUser?.id, // UUID del cliente/usuario
            message: this.newMessage,
            from: this.loginService.Usuario?.login || 'sistema', // Usuario desde JWT session
            To: 'sandra-app' // timestamp: new Date().toISOString()
        };

        this.newMessage = '';
        console.log(payload);
        this.apiService.SendMessage(payload).subscribe(
            (data: any) => {
                console.log('Mensaje enviado exitosamente:', data);
            },
            (error: any) => {
                console.error('Error al enviar mensaje:', error);
            }
        );

        // Simulacro de respuesta local (opcional)
        setTimeout(() => {
            this.mockResponse();
        }, 1500);
    }

    mockResponse() {
        const responses = [
            "Recibido. Procesando análisis de paquetes...",
            "Advertencia: Tráfico inusual detectado en el puerto 443.",
            "Acceso concedido. ID de Sesión: " + Math.random().toString(36).substring(7).toUpperCase()
        ];
        const text = responses[Math.floor(Math.random() * responses.length)];

        const msg: Message = {
            id: Date.now().toString(),
            sender: this.activeUser.name,
            text: "> " + text,
            timestamp: new Date(),
            type: 'received'
        };

        this.messages.push(msg);
        this.activeUser.history.push(msg);
    }

    executeCommand(cmd: string) {
        const msg: Message = {
            id: 'c' + Date.now(),
            sender: 'SISTEMA',
            text: `[SISTEMA] Comando ejecutado: ${cmd}`,
            timestamp: new Date(),
            type: 'received'
        };
        this.messages.push(msg);
        this.activeUser.history.push(msg);
    }

    selectUser(user: User) {
        this.activeUser = user;
        this.messages = [...user.history]; // Cargar el historial del usuario seleccionado
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    onAttach() {
        this.fileInput.nativeElement.click();
    }

    handleFileUpload(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        this.isUploading = true;
        this.uploadProgress = 0;

        // Simular progreso de carga
        const interval = setInterval(() => {
            if (this.uploadProgress < 100) {
                this.uploadProgress += 10;
            } else {
                clearInterval(interval);
                this.isUploading = false;

                const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

                const payload = {
                    type: 'chat',
                    id: this.activeUser?.id,
                    message: `Archivo enviado: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
                    from: this.loginService.Usuario?.login || 'sistema',
                    timestamp: new Date().toISOString(),
                    operation: 'file_transfer' // Metadata adicional si fuera necesario
                };

                const msgHistory: Message = {
                    id: Date.now().toString(),
                    sender: 'Admin',
                    text: '',
                    timestamp: new Date(),
                    type: 'sent',
                    status: 'Transferido',
                    fileInfo: {
                        name: file.name,
                        size: (file.size / 1024).toFixed(2) + ' KB',
                        extension: extension,
                        icon: this.getFileIcon(extension)
                    }
                };

                this.messages.push(msgHistory);
                if (this.activeUser) {
                    this.activeUser.history.push(msgHistory);
                }

                this.apiService.SendMessage(payload).subscribe();
                this.uploadProgress = 0;
            }
        }, 200);
    }

    getFileIcon(ext: string): string {
        const icons: any = {
            'PDF': 'file-text',
            'DOC': 'file-text',
            'DOCX': 'file-text',
            'XLS': 'file-text',
            'XLSX': 'file-text',
            'JPG': 'image',
            'PNG': 'image',
            'GIF': 'image',
            'ZIP': 'archive',
            'RAR': 'archive',
            'LOG': 'database',
            'TXT': 'file-text'
        };
        return icons[ext] || 'file';
    }
}