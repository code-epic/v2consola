import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ColumnMode, DatatableComponent, SelectionType, } from "@swimlane/ngx-datatable";
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { PdfService } from '@services/pdf/pdf.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { env } from 'process';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class UserListComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    relacional: false,
    concurrencia: false,
    protocolo: '',
    ruta: '',
    retorna: false,
    migrar: false,
    modulo: '',
    valores: {},
    coleccion: '',
    http: 0,
    https: 0,
    consumidores: 0,
    puertohttp: 0,
    puertohttps: 0,
    driver: '',
    query: '',
    metodo: '',
    tipo: '',
    prioridad: '',
    entorno: '',
    logs: false
  };

  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;


  public contentHeader: object;
  public count: number = 0;
  public tempData = []
  public rowData = []

   
  public lstPerfil = []; // Asegúrate de cargar esta lista, por ejemplo en ngOnInit
  public selectedProfile: string = ''; // Propiedad para el ngModel del nuevo select


  constructor(
    private router: Router,
    private apiService: ApiService,
    private pdf: PdfService,
  ) { }

  async ngOnInit() {

    this.ListarPerfiles(); 
    await this.listarUsuarios();

    this.contentHeader = {
      headerTitle: "Aplicaciones",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: "Home",
            isLink: true,
            link: "/home",
          },
          {
            name: "Seguridad",
            isLink: false,
          },
          {
            name: "Lista de Usuarios",
            isLink: false,
          },
        ],
      },
    };
  }

   ListarPerfiles() {
    // Asumo que tienes una función similar a la de profile.component.ts
    this.xAPI.funcion = environment.functions.LISTAR_PERFILES_APP // O la función que corresponda
    this.xAPI.parametros = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
        this.lstPerfil = data;
      },
      (error) => {
        console.error('Error al cargar perfiles', error);
      }
    );
  }

  // Nueva función para filtrar por el perfil seleccionado
  filterByProfile() {
    const profileId = this.selectedProfile;
    
    // Primero, asegúrate de que la búsqueda por texto esté vacía para no mezclar filtros inicialmente
    // this.searchValue = ''; 

    if (!profileId) {
      // Si se selecciona "Todos", restaura la lista completa
      this.rowData = [...this.tempData];
    } else {
      // Filtra la data original por el ID del perfil
      const filteredData = this.tempData.filter(item => {
        return item.Perfil && item.Perfil.descripcion === profileId;
      });
      this.rowData = filteredData;
    }
  }

  // Modifica tu función de búsqueda para que considere el filtro de perfil
  filterUpdateProfile(event) {
    console.log(event)
    const val = event;
    if (val == ''  || val == null) {
      this.filterByProfile();
      return;
    }
    // Empieza con la data ya filtrada por perfil (o la completa si no hay filtro)
    let dataToFilter = this.tempData;
    if (this.selectedProfile) {
        dataToFilter = this.tempData.filter(item => item.Perfil && item.Perfil.descripcion);
    }

    // Aplica el filtro de búsqueda de texto
    const temp = dataToFilter.filter(function (d) {
      return d.Perfil.descripcion.indexOf(val) !== -1 || !val;
    });

    // Actualiza la tabla
    this.rowData = temp;
    // Vuelve a la primera página
    this.table.offset = 0;
  }



  async listarUsuarios() {
    this.xAPI.funcion = environment.functions.LISTAR_USUARIOS
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowData = data;
        this.tempData = this.rowData;
        this.count = this.rowData.length
        // console.log(data)
      },
      (error) => {
        console.log(error)
      }
    )
  }

  filterUpdate(event: any) {
    const val = event.target.value ? event.target.value.toLowerCase() : '';
    // filter our data
    const temp = this.tempData.filter(function (d) {
      let cadena = `${d.login} ${d.nombre} ${d.cedula} ${d.correo}`
      return cadena.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length;
    // Whenever the filter changes, always go back to the first page
    if (this.table) {
      this.table.offset = 0;
    }
  }

  EditarUser(usuario: any) {
    window.sessionStorage.setItem('validator', JSON.stringify(usuario))
    this.router.navigate(["security/user"])
  }

  EliminarUser(usuario: any) {
    Swal.fire({
      title: 'Eliminar Usuario',
      text: "¿Está seguro que desea borrar el historico de acceso y la información de sesión?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ok(usuario);
      }
    })
  }

  ok(usuario) {
    this.xAPI.funcion = environment.functions.ELIMINAR_USUARIO
    this.xAPI.parametros = `${usuario.cedula},${usuario.login}`
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
       
        console.log(data)
        this.listarUsuarios()
      },
      (error) => {
        console.log(error)
      }
    )
  }


  ListadoUsers() {
    this.pdf.ListadoDeUsers(this.rowData)
  }

}
