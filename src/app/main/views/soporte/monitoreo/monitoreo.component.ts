import { Component, OnInit, ViewEncapsulation, HostListener, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '@services/apicore/api.service';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';
import * as feather from 'feather-icons';

export interface Client {
    id: string;
    name: string;
    mac_address: string;
    remote_addr: string;
    status: 'online' | 'offline';
    type?: 'web' | 'physical'; // Helper for icon selection
    x?: number; // Payload for visual graph (percentage)
    y?: number; // Payload for visual graph (percentage)
    delay?: number;
}

export interface NetworkMessage {
    type: string;
    id: string;
    message: Client[];
    from: string;
}

@Component({
    selector: 'app-monitoreo',
    templateUrl: './monitoreo.component.html',
    styleUrls: ['./monitoreo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ContentHeaderComponent]
})
export class MonitoreoComponent implements OnInit, AfterViewInit {

    public contentHeader: object;

    private _isDetailedView = signal(false);
    get isDetailedView() { return this._isDetailedView(); }

    private _clients = signal<Client[]>([]);
    get clients() { return this._clients(); }

    private _webClients = signal<Client[]>([]);
    get webClients() { return this._webClients(); }

    private _physicalClients = signal<Client[]>([]);
    get physicalClients() { return this._physicalClients(); }

    // Links for SVG rendering (Center to Node)
    private _graphLinks = signal<{ x1: number, y1: number, x2: number, y2: number, status: string, delay: number }[]>([]);
    get graphLinks() { return this._graphLinks(); }

    public selectedClient: Client | null = null;
    public contextMenuVisible = false;
    public contextMenuPosition = { x: 0, y: 0 };
    public messageModalVisible = false;
    messageTextCtrl = new FormControl('');

    // Stats for HUD
    private _stats = signal({
        total: 0,
        web: 0,
        physical: 0,
        online: 0,
        offline: 0
    });
    get stats() { return this._stats(); }

    private _certificates = signal<any[]>([]);
    get certificates() { return this._certificates(); }

    private _loadingCerts = signal(false);
    get loadingCerts() { return this._loadingCerts(); }

    private _selectedFormat = signal<string>('pem');
    get selectedFormat() { return this._selectedFormat(); }
    set selectedFormat(v: string) { this._selectedFormat.set(v); }

    constructor(private apiService: ApiService) { }

    ngOnInit(): void {
        this.contentHeader = {
            headerTitle: 'Monitoreo de Red',
            actionButton: true,
            breadcrumb: {
                type: '',
                links: [
                    { name: 'Principal', isLink: true, link: '/home' },
                    { name: 'Soporte', isLink: false },
                    { name: 'Monitoreo', isLink: false },
                ],
            },
        };

        this.loadMockData();
        this.loadCertificates();
    }

    ngAfterViewInit() {
        // Delay to allow DOM render
        setTimeout(() => feather.replace(), 100);
    }

    loadMockData() {
        this.apiService.GetConnectionsWebSocket().subscribe(
            (data: NetworkMessage) => {
                console.log('API Data:', data);

                if (data && data.message) {
                    // Enrich real data with visual properties
                    data.message.forEach((client, index) => {
                        const isWeb = client.mac_address.includes('WEB'); // 'xterm' case

                        // Random Coordinates Logic
                        let x, y;
                        if (isWeb) {
                            x = 5 + Math.random() * 35;     // Web Zone (Left)
                            y = 10 + Math.random() * 80;
                        } else {
                            x = 60 + Math.random() * 35;    // Physical Zone (Right)
                            y = 10 + Math.random() * 80;
                        }

                        // Assign Visual Props
                        client.x = x;
                        client.y = y;
                        client.delay = Math.random() * 1.5;

                        // Ensure type property is set for icons
                        client.type = isWeb ? 'web' : 'physical';
                    });

                    this.processData(data);
                }
            },
            error => {
                console.error('Error fetching connections:', error);
            }
        );
    }

    processData(data: NetworkMessage) {
        const clients: Client[] = data.message.map(client => ({
            ...client,
            type: (client.mac_address.includes('WEB') || client.type === 'web' ? 'web' : 'physical') as 'web' | 'physical'
        }));

        const webClients = clients.filter(c => c.type === 'web');
        const physicalClients = clients.filter(c => c.type === 'physical');

        // Adaptive View Logic
        const isDetailedView = clients.length < 20;

        // Prepare Graph Links (Center (50,50) to Client(x,y))
        const graphLinks = clients.map(c => ({
            x1: 50, // Center X
            y1: 50, // Center Y
            x2: c.x!,
            y2: c.y!,
            status: c.status,
            delay: c.delay!
        }));

        // Calculate Stats
        const stats = {
            total: clients.length,
            web: webClients.length,
            physical: physicalClients.length,
            online: clients.filter(c => c.status === 'online').length,
            offline: clients.filter(c => c.status === 'offline').length
        };

        this._clients.set(clients);
        this._webClients.set(webClients);
        this._physicalClients.set(physicalClients);
        this._isDetailedView.set(isDetailedView);
        this._graphLinks.set(graphLinks);
        this._stats.set(stats);

        setTimeout(() => feather.replace(), 100);
    }

    selectClient(client: Client) {
        this.selectedClient = client;
    }

    clearSelection() {
        this.selectedClient = null;
    }

    // Close on background click
    @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
        // If clicking outside any node/modal, clear selection
        const target = event.target as HTMLElement;
        if (!target.closest('.graph-node') && !target.closest('.glass-modal') && !target.closest('.node-actions')) {
            this.clearSelection();
        }
    }



    // Actions
    sendMessage() {
        if (this.selectedClient) {
            this.openMessageModal(this.selectedClient);
        }
    }

    openMessageModal(client: Client) {
        this.selectedClient = client;
        this.messageTextCtrl.setValue('');
        this.messageModalVisible = true;
    }

    closeMessageModal() {
        this.messageModalVisible = false;
    }

    sendActualMessage() {
        console.log(`Sending message to ${this.selectedClient?.name}: ${this.messageTextCtrl.value}`);
        // WebSocket logic here
        this.closeMessageModal();
    }

    sendInstruction() {
        console.log('Sending instruction to:', this.selectedClient?.name);
        // Implement Instruction logic here
    }

    viewDetails() {
        console.log('Viewing details for:', this.selectedClient);
    }

    loadCertificates() {
        this._loadingCerts.set(true);
        this.apiService.ListCertificates(false).subscribe({
            next: (data) => {
                this._certificates.set(Array.isArray(data) ? data : []);
                this._loadingCerts.set(false);
                setTimeout(() => feather.replace(), 100);
            },
            error: () => this._loadingCerts.set(false)
        });
    }

    downloadCertificate(cert: any) {
        const fmt = this._selectedFormat();
        this.apiService.DownloadCertificate(cert.path, fmt).subscribe({
            next: (blob: Blob) => {
                const ext = fmt === 'p12' || fmt === 'pfx' || fmt === 'pkcs12' ? 'p12'
                    : fmt === 'p7b' || fmt === 'pkcs7' ? 'p7b' : fmt;
                const filename = cert.name.replace(/\.[^.]+$/, '') + '.' + ext;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            },
            error: (err) => console.error('Error descargando certificado:', err)
        });
    }

    formatSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}
