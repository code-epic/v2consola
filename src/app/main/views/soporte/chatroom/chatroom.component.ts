import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ApiService } from '@services/apicore/api.service';
import { LoginService } from '@services/seguridad/login.service';
import { WsSandraService } from '@services/seguridad/ws-sandra.service';

declare var feather: any;

interface Message {
    id: string;
    sender: string;
    text: string;
    displayedText?: string; // Para el efecto de escritura
    timestamp: Date;
    type: 'sent' | 'received';
    isTyping?: boolean;
    status?: string;
    isAccepted?: boolean; // Nuevo: Para el check de enviado
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
    styleUrls: ['./chatroom.component.scss'],
    standalone: false
})
export class ChatroomComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;
    @ViewChild('fileInput') private fileInput: ElementRef;

    // Variables de configuración
    saveHistory: boolean = true;
    encryptionActive: boolean = true;
    analyzeTraffic: boolean = false;
    showTools: boolean = false;

    // Variables de carga de archivos
    isUploading: boolean = false;
    uploadProgress: number = 0;



    activeUser: User;
    users: User[] = [];

    messages: Message[] = [];
    newMessage: string = '';
    availableCommands: string[] = ['/silenciar', '/limpiar', '/bloquear', '/rastrear', '/capturar'];
    currentUserName: string = '';
    Token: any;

    constructor(
        private apiService: ApiService,
        private loginService: LoginService,
        private wsSandraService: WsSandraService
    ) {
        this.Token = this.loginService.getUserDecrypt(sessionStorage.getItem('token'));
    }

    ngOnInit(): void {
        this.scrollToBottom();

        // Obtener usuario actual para filtrar y mostrar en cabecera
        console.log(this.Token)
        this.currentUserName = this.Token?.Usuario?.usuario || 'Admin';

        // Cargar conexiones iniciales
        this.apiService.GetConnectionsWebSocket().subscribe(
            (data: any) => {
                if (data && data.message) {
                    this.users = data.message
                        .filter(u => u.name !== this.currentUserName) // Excluir al usuario actual
                        .map(u => ({
                            id: u.id,
                            name: u.name,
                            mac_address: u.mac_address,
                            remote_addr: u.remote_addr,
                            status: u.status,
                            history: []
                        }));

                    this.loadStoredHistory();

                    if (this.users.length > 0 && !this.activeUser) {
                        this.selectUser(this.users[0]);
                    }
                }
            },
            (error: any) => {
                console.error('Error al obtener conexiones:', error);
            }
        );

        // Suscribirse a mensajes entrantes del WebSocket
        this.wsSandraService.chatroomMessages$.subscribe((data: any) => {
            console.log('Mensaje recibido en Chatroom:', data);

            // Buscar si el usuario existe en nuestra lista por su ID (campo 'from')
            const sender = this.users.find(u => u.id === data.from);

            const incomingMsg: Message = {
                id: data.id || Date.now().toString(),
                sender: sender ? sender.name : 'Desconocido',
                text: data.message,
                displayedText: '', // Empezamos vacío para el efecto
                timestamp: data.time ? new Date(data.time) : new Date(),
                type: 'received',
                status: data.status || 'Cifrado'
            };

            if (sender) {
                sender.history.push(incomingMsg);
                if (this.activeUser && this.activeUser.id === sender.id) {
                    this.messages = [...this.activeUser.history];
                    this.typeMessage(incomingMsg);
                }
            } else {
                // Si el usuario no está en la lista (ej. nueva conexión), podríamos recargar la lista o agregarlo
                console.warn('Mensaje de remitente desconocido:', data.from);
            }
        });
    }

    loadStoredHistory() {
        const storedHistory = this.wsSandraService.messages;
        if (!storedHistory || storedHistory.length === 0) return;

        storedHistory.forEach((msg: any) => {
            // Buscar usuario a quien asociar el mensaje
            // Si el mensaje es de 'user', es un mensaje ENVIADO. Necesitamos 'to' para saber a quién.
            // Si el mensaje es de un id de usuario, es un mensaje RECIBIDO.

            if (msg.from === 'user' || msg.from === 'Admin') {
                if (msg.to) {
                    const targetUser = this.users.find(u => u.id === msg.to);
                    if (targetUser) {
                        targetUser.history.push({
                            id: msg.id || Date.now().toString(),
                            sender: 'Admin',
                            text: msg.message,
                            displayedText: msg.message,
                            timestamp: msg.time ? new Date(msg.time) : new Date(),
                            type: 'sent',
                            status: msg.status || 'Cifrado',
                            isAccepted: msg.isAccepted || false
                        });
                    }
                }
            } else {
                const sender = this.users.find(u => u.id === msg.from);
                if (sender) {
                    sender.history.push({
                        id: msg.id || Date.now().toString(),
                        sender: sender.name,
                        text: msg.message,
                        displayedText: msg.message,
                        timestamp: msg.time ? new Date(msg.time) : new Date(),
                        type: 'received',
                        status: msg.status || 'Cifrado'
                    });
                }
            }
        });
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
            displayedText: this.newMessage,
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
            from: this.Token?.Usuario?.usuario || 'sistema', // Usuario desde JWT session
            To: this.activeUser?.name
        };

        // Persistir en el historial local (chat_history)
        this.wsSandraService.saveChatroomMessage({
            from: 'Admin',
            to: this.activeUser?.id,
            message: this.newMessage,
            id: msgHistory.id,
            time: msgHistory.timestamp.toISOString(),
            status: msgHistory.status
        });

        const originalId = msgHistory.id;
        const originalMessage = this.newMessage;
        this.newMessage = '';

        this.apiService.SendMessage(payload).subscribe(
            (data: any) => {
                console.log('Respuesta del servidor:', data);

                // Si el servidor confirma la entrega
                if (data && data.status === 'success' || (data.message && data.message.includes('enviado'))) {
                    // Buscar el mensaje original en la lista actual y en el historial del usuario activo
                    const msgToUpdate = this.messages.find(m => m.id === originalId);
                    if (msgToUpdate) {
                        msgToUpdate.isAccepted = true;
                        msgToUpdate.status = 'Enviado';
                    }

                    if (this.activeUser) {
                        const histMsg = this.activeUser.history.find(m => m.id === originalId);
                        if (histMsg) {
                            histMsg.isAccepted = true;
                            histMsg.status = 'Enviado';
                        }
                    }

                    // Actualizar en el historial persistente (buscando en el array de WsSandraService)
                    const persistentMsg = this.wsSandraService.messages.find(m => m.id === originalId);
                    if (persistentMsg) {
                        persistentMsg.isAccepted = true;
                        persistentMsg.status = 'Enviado';
                        // Forzar guardado en localStorage
                        localStorage.setItem('chat_history', JSON.stringify(this.wsSandraService.messages));
                    }
                }
            },
            (error: any) => {
                console.error('Error al enviar mensaje:', error);
                const msgToUpdate = this.messages.find(m => m.id === originalId);
                if (msgToUpdate) {
                    msgToUpdate.status = 'Error';
                }
            }
        );
    }

    typeMessage(msg: Message) {
        let i = 0;
        const fullText = msg.text;
        msg.displayedText = '';

        const interval = setInterval(() => {
            if (i < fullText.length) {
                msg.displayedText += fullText.charAt(i);
                i++;
                this.scrollToBottom();
            } else {
                clearInterval(interval);
            }
        }, 30);
    }

    executeCommand(cmd: string) {
        const msg: Message = {
            id: 'c' + Date.now(),
            sender: 'SISTEMA',
            text: `[SISTEMA] Comando ejecutado: ${cmd}`,
            displayedText: `[SISTEMA] Comando ejecutado: ${cmd}`,
            timestamp: new Date(),
            type: 'received'
        };
        this.messages.push(msg);
        if (this.activeUser) this.activeUser.history.push(msg);
    }

    selectUser(user: User) {
        this.activeUser = user;
        // Al seleccionar, mostramos el texto completo sin efectos de escritura para historial
        this.messages = user.history.map(m => {
            if (!m.displayedText) m.displayedText = m.text;
            return m;
        });
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

                // Persistir en el historial local (chat_history)
                this.wsSandraService.saveChatroomMessage({
                    from: 'Admin',
                    to: this.activeUser?.id,
                    message: payload.message,
                    id: msgHistory.id,
                    time: msgHistory.timestamp.toISOString(),
                    status: msgHistory.status
                });

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