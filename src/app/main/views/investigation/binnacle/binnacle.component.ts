import { Component, OnInit, ViewEncapsulation, NgZone, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CoreCommonModule } from "@core/common.module";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { environment } from "environments/environment";

@Component({
  selector: 'app-binnacle',
  templateUrl: './binnacle.component.html',
  styleUrls: ['./binnacle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: "ecommerce-application" },
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    CoreCommonModule,
    CoreDirectivesModule,
    CorePipesModule,
    ContentHeaderComponent,
  ]
})
export class BinnacleComponent implements OnInit {
  public showHelp = true;
  public contentHeader: object;

  searchTextCtrl = new FormControl('');
  private _searchText = signal<string>('');
  get searchText() { return this._searchText(); }

  private _listarBitacora = signal<any[]>([]);
  get ListarBitacora() { return this._listarBitacora(); }

  private _loadingStreaming = signal<boolean>(false);
  get loadingStreaming() { return this._loadingStreaming(); }

  xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: '',
  };

  public page = 1;
  public pageSize = 12;

  constructor(
    private ruta: Router,
    private apiService: ApiService,
    private zone: NgZone,
  ) { }

  async ngOnInit() {
    this.searchTextCtrl.valueChanges.subscribe((val) => {
      this._searchText.set(val || '');
      this.page = 1;
    });

    await this.CargarBitacora();

    this.contentHeader = {
      headerTitle: 'Investigación',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Principal',
            isLink: true,
            link: '/home',
          },
          {
            name: 'Auditoria',
            isLink: false,
          },
          {
            name: 'Bitacora',
            isLink: false,
          },
        ],
      },
    };
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  clearSearch() {
    this.searchTextCtrl.setValue('');
  }

  irA(base: string, data: any) {
    const datoCodificado = btoa(JSON.stringify(data));
    this.ruta.navigate([base + '/' + datoCodificado]);
  }

  getCardMeta(nombre: string): { icon: string; colorClass: string } {
    const icons = [
      'grid', 'layout', 'terminal', 'cpu', 'database',
      'server', 'cloud', 'shield', 'hard-drive', 'activity',
      'code', 'layers', 'globe', 'box', 'tool'
    ];
    const colors = ['primary', 'success', 'warning', 'info'];
    if (!nombre) return { icon: icons[0], colorClass: colors[0] };
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    return {
      icon: icons[absHash % icons.length],
      colorClass: colors[absHash % colors.length]
    };
  }

  get filteredBitacora(): any[] {
    const term = (this.searchText || '').toLowerCase().trim();
    if (!term) return this.ListarBitacora;
    return this.ListarBitacora.filter(item =>
      (item.nombre || '').toLowerCase().includes(term) ||
      (item.comentario || '').toLowerCase().includes(term) ||
      (item.id || '').toLowerCase().includes(term)
    );
  }

  async CargarBitacora() {
    this._listarBitacora.set([]);
    this._loadingStreaming.set(true);
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_LOGS;
    this.xAPI.parametros = '';

    try {
      await this.apiService.postStream<any>('crudstream', this.xAPI, (row) => {
        const meta = this.getCardMeta(row?.nombre);
        const enrichedRow = { ...row, _icon: meta.icon, _colorClass: meta.colorClass };
        this.zone.run(() => {
          this._listarBitacora.update(curr => [...curr, enrichedRow]);
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.zone.run(() => {
        this._loadingStreaming.set(false);
      });
    }
  }
}
