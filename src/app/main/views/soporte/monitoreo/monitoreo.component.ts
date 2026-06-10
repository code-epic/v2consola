import { Component, OnInit, ViewEncapsulation, HostListener, AfterViewInit } from '@angular/core';
import { ApiService } from '@services/apicore/api.service';
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
    standalone: false
})
export class MonitoreoComponent implements OnInit, AfterViewInit {

    public contentHeader: object;
    public isDetailedView = false;
    public clients: Client[] = [];
    public webClients: Client[] = [];
    public physicalClients: Client[] = [];

    // Links for SVG rendering (Center to Node)
    public graphLinks: { x1: number, y1: number, x2: number, y2: number, status: string, delay: number }[] = [];

    public selectedClient: Client | null = null;
    public contextMenuVisible = false;
    public contextMenuPosition = { x: 0, y: 0 };
    public messageModalVisible = false;
    public messageText = '';

    // Stats for HUD
    public stats = {
        total: 0,
        web: 0,
        physical: 0,
        online: 0,
        offline: 0
    };

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
        this.clients = data.message.map(client => ({
            ...client,
            type: client.mac_address.includes('WEB') || client.type === 'web' ? 'web' : 'physical'
        }));

        this.webClients = this.clients.filter(c => c.type === 'web');
        this.physicalClients = this.clients.filter(c => c.type === 'physical');

        // Adaptive View Logic
        this.isDetailedView = this.clients.length < 20;

        // Prepare Graph Links (Center (50,50) to Client(x,y))
        this.graphLinks = this.clients.map(c => ({
            x1: 50, // Center X
            y1: 50, // Center Y
            x2: c.x!,
            y2: c.y!,
            status: c.status,
            delay: c.delay!
        }));

        // Calculate Stats
        this.stats = {
            total: this.clients.length,
            web: this.webClients.length,
            physical: this.physicalClients.length,
            online: this.clients.filter(c => c.status === 'online').length,
            offline: this.clients.filter(c => c.status === 'offline').length
        };

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
        this.messageText = '';
        this.messageModalVisible = true;
    }

    closeMessageModal() {
        this.messageModalVisible = false;
    }

    sendActualMessage() {
        console.log(`Sending message to ${this.selectedClient?.name}: ${this.messageText}`);
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
}
