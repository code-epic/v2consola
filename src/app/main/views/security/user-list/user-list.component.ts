import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ColumnMode, DatatableComponent, SelectionType, } from "@swimlane/ngx-datatable";
import { ApiService, IAPICore } from '@services/apicore/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
            name: "Principal",
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
    this.xAPI = {} as IAPICore
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
    if (val == '' || val == null) {
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
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.LISTAR_USUARIOS
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
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
      title: `Eliminar Usuario`,
      text: `¿Está seguro que desea eliminar al usuario ${usuario.nombre}?`,
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
    this.xAPI = {} as IAPICore
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


  exportarUsuariosPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // ==========================================
    // PAGINA 1: PORTADA (Estilo Premium)
    // ==========================================
    doc.setFontSize(26);
    doc.setTextColor(100, 181, 246); // Blue 300 (Pastel)
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE USUARIOS', pageWidth / 2, 80, { align: 'center' });

    // Línea Decorativa Sutil
    doc.setDrawColor(224, 224, 224); // Grey 300
    doc.setLineWidth(0.5);
    doc.line(60, 85, pageWidth - 60, 85);

    // Subtítulo
    doc.setFontSize(18);
    doc.setTextColor(97, 97, 97); // Grey 700
    doc.text('LISTADO GENERAL DE USUARIOS', pageWidth / 2, 100, { align: 'center' });

    // Detalles
    doc.setFontSize(12);
    doc.setTextColor(117, 117, 117); // Grey 600
    doc.text(`Total de Usuarios: ${this.rowData.length}`, pageWidth / 2, 115, { align: 'center' });

    // Pie de página de la portada
    doc.setFontSize(9);
    doc.setTextColor(189, 189, 189); // Grey 400
    doc.text(`Generado el: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

    // ==========================================
    // PAGINA 2: TABLA RESUMEN (Estilo Premium)
    // ==========================================
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(100, 181, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('Listado Resumido de Usuarios', 14, 20);

    const tableData = this.rowData.map((user, i) => {
      const primerPerfil = user.Aplicacion?.length > 0 ? user.Aplicacion[0] : { perfil: 'N/A', nombre: 'N/A', traza: '0' };
      const estatusTexto = user.estatus === 1 ? 'Activo' : 'Inactivo';
      return [
        i + 1,
        user.nombre || 'N/A',
        user.cedula || 'N/A',
        user.correo || 'N/A',
        primerPerfil.perfil || 'Sin Perfil',
        user.estatus // Pasamos el valor numérico para el dibujado personalizado
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [['#', 'Nombre Completo', 'Cédula', 'Correo', 'Perfil Principal', 'Estatus']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        valign: 'middle',
        lineColor: [238, 238, 238],
        lineWidth: 0.1,
        textColor: [97, 97, 97]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 181, 246],
        fontStyle: 'bold',
        halign: 'left',
        lineWidth: 0,
        lineColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' }
      },
      didParseCell: (data) => {
        // Limpiar el texto de la celda de estatus para dibujar el checkbox
        if (data.section === 'body' && data.column.index === 5) {
          data.cell.text = [];
        }
      },
      didDrawCell: (data) => {
        // Dibujar Checkbox personalizado para el estatus
        if (data.section === 'body' && data.column.index === 5) {
          const estatus = data.cell.raw as number;
          const dim = 4;
          const cx = data.cell.x + (data.cell.width / 2) - (dim / 2);
          const cy = data.cell.y + (data.cell.height / 2) - (dim / 2);

          if (estatus === 1) {
            doc.setFillColor(165, 214, 167); // Green 200
            doc.setDrawColor(165, 214, 167);
            doc.roundedRect(cx, cy, dim, dim, 1, 1, 'FD');
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.6);
            doc.line(cx + 1, cy + 2, cx + 1.8, cy + 3);
            doc.line(cx + 1.8, cy + 3, cx + 3.2, cy + 1.2);
          } else {
            doc.setDrawColor(224, 224, 224); // Grey 300
            doc.setFillColor(250, 250, 250); // Almost white
            doc.roundedRect(cx, cy, dim, dim, 1, 1, 'FD');
          }
        }
      }
    });

    // ==========================================
    // PAGINAS DE DETALLE DE USUARIO (Estilo Premium)
    // ==========================================
    this.rowData.forEach(user => {
      doc.addPage();

      // Encabezado de la página de detalle
      doc.setFontSize(16);
      doc.setTextColor(100, 181, 246);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle Individual del Usuario', pageWidth / 2, 20, { align: 'center' });

      // Login del usuario como cabecera principal
      doc.setFontSize(20);
      doc.setTextColor(97, 97, 97);
      doc.text((user.login || 'Sin Login').toUpperCase(), pageWidth / 2, 35, { align: 'center' });

      doc.setDrawColor(224, 224, 224);
      doc.setLineWidth(0.3);
      doc.line(20, 40, pageWidth - 20, 40);

      let y = 50; // Posición Y inicial

      // --- Función auxiliar para dibujar campo-valor ---
      const drawField = (label, value, yPos, isBold = false) => {
        doc.setFontSize(10);
        doc.setTextColor(117, 117, 117);
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos);

        doc.setFontSize(10);
        doc.setTextColor(97, 97, 97);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(value || 'N/A', 60, yPos);
      };

      // --- Detalles del Usuario ---
      drawField('Nombre Completo:', user.nombre, y, true);
      y += 8;
      drawField('Cédula:', user.cedula, y);
      y += 8;
      drawField('Correo:', user.correo, y);
      y += 8;
      drawField('Cargo:', user.cargo, y);
      y += 8;
      drawField('Sucursal:', user.sucursal, y);
      y += 8;
      drawField('Dirección (Regional):', user.direccion, y);
      y += 8;
      drawField('Estatus:', user.estatus === 1 ? 'Activo' : 'Inactivo', y);
      y += 15;

      // --- Aplicaciones y Perfiles ---
      doc.setFontSize(12);
      doc.setTextColor(100, 181, 246);
      doc.setFont('helvetica', 'bold');
      doc.text('Aplicaciones y Perfiles Asignados', 20, y);
      y += 5;

      if (user.Aplicacion && user.Aplicacion.length > 0) {
        const appTableData = user.Aplicacion.map(app => [
          app.nombre || 'N/A',
          app.perfil || 'N/A',
          app.traza || 'N/A'
        ]);

        autoTable(doc, {
          startY: y,
          head: [['Aplicación', 'Perfil Asignado', 'Nivel de Traza']],
          body: appTableData,
          theme: 'striped',
          headStyles: { fillColor: [100, 181, 246], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 2.5 },
          margin: { left: 20, right: 20 }
        });
      } else {
        doc.setFontSize(10);
        doc.setTextColor(158, 158, 158);
        doc.setFont('helvetica', 'italic');
        doc.text('Este usuario no tiene aplicaciones o perfiles asignados.', 20, y);
      }

    });


    // ==========================================
    // PAGINACIÓN FINAL
    // ==========================================
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) { // Corregido: totalPages -> pageCount
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(200);
      doc.text(`${i} / ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }

    const fileName = `Reporte_Usuarios_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }

}
