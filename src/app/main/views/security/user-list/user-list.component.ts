import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ColumnMode, DatatableComponent, SelectionType, } from "@swimlane/ngx-datatable";
import { ApiService, IAPICore } from '@services/apicore/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UtilService } from '@services/util/util.service';
import { Sha256Service } from '@services/util/sha256';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [NgbModalConfig, NgbModal],
    standalone: false
})
export class UserListComponent implements OnInit, OnDestroy {

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


  // Variables para el Modal de Cambio de Clave
  public selectedUser: any;
  public vtopCode: string = '';
  public newPassword: string = '';
  public confirmPassword: string = '';
  public isTotpStep: boolean = false;
  public isSuccess: boolean = false;
  public passwordTextType: boolean = false;
  public confirmpasswordTextType: boolean = false;
  // Password Strength properties
  public passwordStrength: number = 0;
  public passwordStrengthLabel: string = 'Sin seguridad';
  public passwordStrengthColor: string = '';
  public passwordStrengthWidth: number = 0;
  public isPasswordInvalid: boolean = false;
  public isOtpInvalid: boolean = false;

  public lstPerfil = []; // Asegúrate de cargar esta lista, por ejemplo en ngOnInit
  public selectedProfile: string = ''; // Propiedad para el ngModel del nuevo select

  // Propiedades para el manejo de bloqueos y contadores
  private countdownIntervals = new Map<string, number>();


  public isBDV: boolean = false


  constructor(
    private router: Router,
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilService: UtilService,
    private sha256: Sha256Service
  ) { }

  async ngOnInit() {
    this.isBDV = this.apiService.ConsultaSistemaBDV()
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
    this.xAPI.funcion = environment.functions.LISTAR_USUARIOS_BLOQUEADOS
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // Limpiar contadores anteriores para evitar fugas de memoria
        this.clearAllCountdowns();

        data.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))

        // Iniciar contadores para usuarios bloqueados
        data.forEach(user => {
          if (user.bloqueo) {
            this.startCountdown(user);
          }
        });

        this.rowData = data;
        this.tempData = this.rowData;
        this.count = this.rowData.length
      },
      (error) => {
        console.log(error)
      }
    )
  }

  getRowClass = (row) => {
    if (row.bloqueo) {
      return 'row-blocked';
    }
    if (row.estatus == 0) {
      return 'row-inactive';
    }
    return '';
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
        this.listarUsuarios()
      },
      (error) => {
        console.log(error)
      }
    )
  }

  DesbloquearUser(usuario: any) {
    Swal.fire({
      title: `Desbloquear Usuario`,
      text: `¿Está seguro que desea desbloquear al usuario ${usuario.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.xAPI = {} as IAPICore;
        this.xAPI.funcion = environment.functions.ELIMINAR_BLOQUEO_USUARIO; // Asegúrate que esta función exista en tu backend
        this.xAPI.parametros = usuario.login;
        this.apiService.Ejecutar(this.xAPI).subscribe(
          () => {
            Swal.fire('¡Desbloqueado!', 'El usuario ha sido desbloqueado.', 'success');
            this.listarUsuarios(); // Refrescar la lista
          },
          (error) => {
            console.error(error);
            Swal.fire('Error', 'No se pudo desbloquear al usuario.', 'error');
          }
        );
      }
    });
  }

  openChangePasswordModal(row: any, content: any) {
    this.selectedUser = row;
    this.vtopCode = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.isSuccess = false;
    this.passwordTextType = false;
    this.confirmpasswordTextType = false;
    this.passwordStrength = 0;
    this.passwordStrengthLabel = 'Sin seguridad';
    this.passwordStrengthColor = '';
    this.passwordStrengthWidth = 0;
    this.isPasswordInvalid = false;
    this.isOtpInvalid = false;

    // Paso 1: Verificar si el usuario tiene token (2FA)
    // Si tiene token, activamos el paso de validación VTOP
    if (row.token && row.token.trim() !== '') {
      this.isTotpStep = true;
    } else {
      this.isTotpStep = false;
    }

    this.modalService.open(content, {
      centered: true, backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal", size: 'md'
    });
  }

  async acceptChangePassword() {
    if (this.isTotpStep) {
      // --- Lógica del Paso 1: Validar VTOP ---
      if (!this.vtopCode || this.vtopCode.length < 6) {
        this.isOtpInvalid = true;
        this.utilService.AlertMini('top-end', 'warning', 'Ingrese un código VTOP válido de 6 dígitos', 3000);
        return;
      }
      // Aquí podrías llamar a una API para validar el VTOP si es necesario.
      // Por ahora, asumimos que si el código es válido en formato, pasamos al siguiente paso.
      this.isTotpStep = false;

    } else {
      // --- Lógica del Paso 2: Cambiar Contraseña ---
      if (!this.newPassword || !this.confirmPassword) {
        this.utilService.AlertMini('top-end', 'warning', 'Por favor complete todos los campos', 3000);
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.utilService.AlertMini('top-end', 'error', 'Las contraseñas no coinciden', 3000);
        return;
      }

      if (this.isPasswordInvalid) {
        this.utilService.AlertMini('top-end', 'error', 'La contraseña no cumple con los requisitos de seguridad', 3000);
        return;
      }

      this.xAPI = {} as IAPICore;
      this.xAPI.funcion = environment.functions.ACTUALIZAR_CLAVE; // Asegúrate de usar el nombre correcto de tu función en BD
      const hash = await this.sha256.hash(this.newPassword);
      this.xAPI.parametros = `${this.selectedUser.login},${hash},${new Date().toISOString()}`;
      // console.log('Actualizar Clave con parámetros:', this.xAPI.parametros);

      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          console.log(data);
          this.modalService.dismissAll(); // Cierra el modal
          this.isSuccess = true; // Muestra el mensaje de éxito (Paso 3)
        },
        (error) => {
          console.error(error);
          this.utilService.AlertMini('top-end', 'error', 'Error al actualizar la contraseña', 3000);
        }
      );
    }
  }

  /**
   * Check Password Strength
   * @param password 
   */
  checkPasswordStrength(password: string): void {
    let result = 0;
    if (password) {
      if (password.length >= 8) result += 20;
      if (password.match(/[A-Z]/)) result += 20;
      if (password.match(/[a-z]/)) result += 20;
      if (password.match(/[0-9]/)) result += 20;
      if (password.match(/[@$!%*?&]/)) result += 20;
    }

    this.passwordStrengthWidth = result;

    if (result < 40) {
      this.passwordStrengthLabel = 'Débil';
      this.passwordStrengthColor = 'bg-danger';
    } else if (result < 80) {
      this.passwordStrengthLabel = 'Media';
      this.passwordStrengthColor = 'bg-warning';
    } else if (result === 100) {
      this.passwordStrengthLabel = 'Fuerte';
      this.passwordStrengthColor = 'bg-success';
    } else {
      this.passwordStrengthLabel = 'Buena';
      this.passwordStrengthColor = 'bg-info';
    }
  }

  validatePassword() {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (this.newPassword && !passwordRegex.test(this.newPassword)) {
      this.isPasswordInvalid = true;
      this.utilService.AlertMini(
        "top-end",
        "error",
        "La clave no cumple con los requisitos. Debe tener entre 8 y 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&).",
        5000
      );
    } else {
      this.isPasswordInvalid = false;
    }
  }

  // --- Métodos para el manejo de inputs TOTP ---

  onInput(event: any, nextInput: HTMLInputElement | null) {
    const input = event.target;
    const value = input.value;

    // Limpiar si no es número
    if (!/^[0-9]$/.test(value)) {
      input.value = '';
      return;
    }

    // Mover al siguiente si hay valor
    if (value && nextInput) {
      nextInput.focus();
    }
    this.updateVtopCode();
  }

  onKeydown(event: KeyboardEvent, prevInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace') {
      if (!input.value && prevInput) {
        prevInput.focus();
      } else if (input.value) {
        input.value = '';
        this.updateVtopCode();
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text/plain');
    if (pastedData) {
      const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
      const inputs = document.querySelectorAll('.otp-box') as NodeListOf<HTMLInputElement>;
      digits.forEach((digit, index) => {
        if (inputs[index]) inputs[index].value = digit;
      });
      if (digits.length === 6) inputs[5]?.focus();
      this.updateVtopCode();
    }
  }

  updateVtopCode() {
    const inputs = Array.from(document.querySelectorAll('.otp-box')) as HTMLInputElement[];
    this.vtopCode = inputs.map(i => i.value).join('');
    this.isOtpInvalid = false; // Resetear error al escribir
  }

  startCountdown(user: any) {
    // La propiedad 'expira' ya es una fecha de expiración completa en formato ISO.
    // Simplemente la convertimos a un timestamp de JavaScript.
    const expirationTime = new Date(user.bloqueo.expira).getTime();

    // Verificamos si la fecha es válida para evitar errores.
    if (isNaN(expirationTime)) {
      console.error(`Fecha de expiración inválida para el usuario ${user.login}:`, user.bloqueo.expira);
      return;
    }
    const intervalId = window.setInterval(() => {
      const now = new Date().getTime();
      const distance = expirationTime - now;

      if (distance < 0) {
        clearInterval(this.countdownIntervals.get(user.login));
        this.countdownIntervals.delete(user.login);
        delete user.bloqueo; // Elimina la propiedad para actualizar la UI
        user.tiempoRestante = 'Expirado';
        this.rowData = [...this.rowData]; // Forzar actualización de la tabla
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      user.tiempoRestante = `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
    }, 1000);

    this.countdownIntervals.set(user.login, intervalId);
  }

  clearAllCountdowns() {
    this.countdownIntervals.forEach(intervalId => clearInterval(intervalId));
    this.countdownIntervals.clear();
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

        let textValue = value || 'N/A';
        if (Array.isArray(textValue)) {
          textValue = textValue.map(v => (typeof v === 'object' ? (v.name || v.descripcion || JSON.stringify(v)) : v)).join(', ');
        } else if (typeof textValue === 'object') {
          textValue = textValue.name || textValue.descripcion || JSON.stringify(textValue);
        } else {
          textValue = String(textValue);
        }
        doc.text(textValue, 60, yPos);
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
    /* Reemplaza doc.save(fileName) por esto: */
    // 1. Obtener el binario como string dataURI
    const pdfDataUri = doc.output('datauristring');

    // Sandra Sandbox Bridge detection
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({
        type: 'OPEN_PDF',
        payload: {
          fileName: fileName,
          data: pdfDataUri
        }
      }, '*');
    } else {
      // Direct browser download
      doc.save(fileName);
    }
  }

  async GeneraCaucion(user: any) {
    const doc = new jsPDF();
    // Agregar Metadatos al PDF
    doc.setProperties({
      title: `Caución de Seguridad - ${user.login}`,
      subject: 'Documento de Caución y Normas de Usuario',
      author: 'Sandra Server Security Module',
      keywords: '',
      creator: 'Sandra Server - ' + environment.Hash
    });

    // Inyectar JavaScript para notificar al usuario sobre las restricciones (Refuerzo visual)
    try {
      if ((doc as any).addJS) {
        (doc as any).addJS('app.alert("AVISO DE SEGURIDAD: Este documento está protegido. La función de impresión ha sido deshabilitada.");');
      }
    } catch (error) {
      console.warn('No se pudo inyectar JS al PDF:', error);
    }

    // Ocultar barra de herramientas y menús para dificultar la impresión/exportación desde el visor
    try {
      if ((doc as any).setViewerPreferences) {
        (doc as any).setViewerPreferences({
          'HideToolbar': true,
          'HideMenubar': true,
          'HideWindowUI': true
        });
      }
    } catch (error) {
      console.warn('No se pudo establecer preferencias de visor:', error);
    }

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;


    const trackingId = `${environment.ID || 'APP'}__${(user.login || 'user').replace(/[^a-zA-Z0-9]/g, '')}`;
    const auditUrl = `https://code-epic.com/v1/api/trace?id=${trackingId}&action=REQ_PIN`;

    let qrDataUrl = '';
    try {
      // @ts-ignore
      const QRCode = await import('qrcode');
      qrDataUrl = await QRCode.toDataURL(auditUrl, { margin: 1, color: { dark: '#000000', light: '#FFFFFF' } });
    } catch (e) {
      console.warn('Librería QRCode no disponible (npm install qrcode):', e);
    }

    // --- PÁGINA 1: EL SOBRE (Capa A - Pública) ---
    doc.setFillColor(20, 20, 20); // Fondo oscuro industrial
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("SANDRA SERVER ", pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(12);
    doc.text("DOCUMENTO CONFIDENCIAL", pageWidth / 2, 60, { align: 'center' });

    // QR en la primera página
    if (qrDataUrl) {
      const qrSize = 50;
      doc.addImage(qrDataUrl, 'PNG', (pageWidth - qrSize) / 2, 80, qrSize, qrSize);
    }

    doc.setFontSize(10);
    doc.text("Escanee el código QR para desbloquear el documento.", pageWidth / 2, 140, { align: 'center' });

    // Placeholder para Rust
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("[QR_PLACEHOLDER_COORD:105,150]", pageWidth / 2, 150, { align: 'center' });

    // --- PÁGINA 2: EL CONTENIDO (Capa B - Sensible) ---
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    const margin = 14;
    let y = 20;

    // --- Marca de Agua ---
    doc.saveGraphicsState();
    doc.setTextColor(245, 245, 245); // Gris muy claro
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    try {
      // Intentar rotar texto (soportado en versiones recientes de jsPDF)
      doc.text('EJÉRCITO BOLIVARIANO', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 } as any);
    } catch (e) {
      doc.text('EJÉRCITO BOLIVARIANO', pageWidth / 2, pageHeight / 2, { align: 'center' });
    }
    doc.restoreGraphicsState();

    // --- Encabezado ---
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('REPÚBLICA BOLIVARIANA DE VENEZUELA', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text('MINISTERIO DEL PODER POPULAR PARA LA DEFENSA', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setTextColor(20, 83, 45); // Verde oscuro
    doc.text('EJÉRCITO BOLIVARIANO', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('DIRECCIÓN DE TECNOLOGÍA DE INFORMACIÓN Y LAS COMUNICACIONES', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100); // Gris
    doc.text('GRUPO DE TRABAJO DE SEGURIDAD TECNOLÓGICA', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Fecha y Serial
    const fecha = new Date().toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'italic');
    doc.text(`Fuerte Tiuna, ${fecha}`, margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28); // Rojo
    doc.text(`SERIAL N° ${user.id || '0000'}/2025`, pageWidth - margin, y, { align: 'right' });
    y += 4;
    doc.setTextColor(0, 0, 0);
    doc.text('Caución y Normas de Usuario', pageWidth - margin, y, { align: 'right' });
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 40, y + 1, pageWidth - margin, y + 1); // Subrayado
    y += 5;

    // --- Datos del Funcionario (Tabla) ---
    autoTable(doc, {
      startY: y,
      head: [['DATOS DEL FUNCIONARIO', '', '', '']],
      body: [
        ['Grado:', user.grado || 'N/A', 'Apellidos y Nombres:', user.nombre],
        ['C.I:', user.cedula, 'Unidad / Cargo:', user.cargo || user.descripcion || 'N/A'],
        ['Usuario Sistema:', user.login, 'Teléfono:', user.telefono || 'N/A']
      ],
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { fontStyle: 'bold', cellWidth: 35 }
      },
      didParseCell: (data) => {
        if (data.section === 'head' && data.column.index === 0) {
          data.cell.colSpan = 4;
        }
        if (data.section === 'body') {
          data.cell.styles.lineWidth = 0.1;
          data.cell.styles.lineColor = [200, 200, 200];
        }
        if (data.section === 'body' && data.row.index === 2 && data.column.index === 1) {
          data.cell.styles.textColor = [29, 78, 216]; // Azul
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // --- Bloques de Seguridad ---
    const drawBlock = (title, text, colorRGB) => {
      doc.setDrawColor(colorRGB[0], colorRGB[1], colorRGB[2]);
      doc.setLineWidth(1);
      doc.line(margin, y, margin, y + 15); // Línea vertical izquierda

      doc.setFontSize(9);
      doc.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 3, y + 3);

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      const textLines = doc.splitTextToSize(text, pageWidth - margin * 2 - 5);
      doc.text(textLines, margin + 3, y + 8);

      const blockHeight = (textLines.length * 3.5) + 10;
      doc.line(margin, y, margin, y + blockHeight - 2); // Ajustar altura línea vertical

      return blockHeight;
    };

    y += drawBlock(
      '1. AUTENTICACIÓN Y CREDENCIALES',
      'La cuenta de usuario y su contraseña son estrictamente personales e intransferibles. Se requiere el uso obligatorio de la tarjeta de coordenadas (MFA/2FA). Queda prohibido fotografiar o compartir la tarjeta. La contraseña inicial debe cambiarse inmediatamente.',
      [37, 99, 235] // Azul
    );

    y += drawBlock(
      '2. USO DE INTRANET Y REDES',
      'El acceso está restringido exclusivamente a redes y equipos autorizados. La información clasificada no debe ser impresa ni transferida a dispositivos externos no cifrados.',
      [75, 85, 99] // Gris
    );

    const redHeight = drawBlock(
      '3. AUDITORÍA Y CUMPLIMIENTO LEGAL',
      'El usuario reconoce y acepta el monitoreo constante, registro de logs y auditorías forenses realizados por la División de Seguridad Tecnológica de la DIRTIC.',
      [220, 38, 38] // Rojo
    );
    y += redHeight;

    // Artículos
    doc.setFontSize(7);
    doc.setTextColor(153, 27, 27); // Rojo oscuro
    doc.setFont('helvetica', 'bold');
    doc.text('• Art 6. Acceso indebido (1-5 años)   • Art 11. Espionaje (4-8 años)', margin + 3, y);
    y += 4;
    doc.text('• Art 7. Sabotaje (4-8 años)          • Art 22. Revelación de data (2-6 años)', margin + 3, y);
    y += 15;

    // --- Firmas ---
    if (y + 40 > pageHeight) {
      doc.addPage();
      y = 20;
    }

    const signatureY = y + 20;

    // Firma Izquierda
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin + 10, signatureY, margin + 70, signatureY);

    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('GLORIMAR DEL VALLE ZAPATA BARRERA', margin + 40, signatureY + 4, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.text('Capitán | Auditor', margin + 40, signatureY + 8, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('ENTREGA', margin + 40, signatureY + 12, { align: 'center' });

    // Firma Derecha
    doc.setDrawColor(0, 0, 0);
    doc.line(pageWidth - margin - 70, signatureY, pageWidth - margin - 10, signatureY);

    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text((user.nombre || '').toUpperCase(), pageWidth - margin - 40, signatureY + 4, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.text(`${user.grado || 'Funcionario'} | Usuario`, pageWidth - margin - 40, signatureY + 8, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('RECIBE', pageWidth - margin - 40, signatureY + 12, { align: 'center' });

    // Placeholder firma digital
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Pendiente por Firma Digital', pageWidth - margin - 40, signatureY - 5, { align: 'center' });

    // --- Pie de página ---
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('[ ] Declaro conocer y aceptar las sanciones penales y disciplinarias establecidas.', pageWidth / 2, footerY, { align: 'center' });

    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text('COPIA CONTROLADA - PROHIBIDA SU REPRODUCCIÓN NO AUTORIZADA', pageWidth / 2, footerY + 5, { align: 'center' });


    // 2. Marca de Agua Dinámica en todas las páginas
    const pageCount = doc.getNumberOfPages();
    const timestamp = new Date().toLocaleString();
    const watermarkText = `CONFIDENCIAL - ${user.login} - ${timestamp}`;

    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i);
      doc.saveGraphicsState();

      // Marca de agua diagonal
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(20);
      try {
        doc.text(watermarkText, pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45, renderingMode: 'fill' } as any);
      } catch (e) {
        doc.text(watermarkText, pageWidth / 2, pageHeight / 2, { align: 'center' });
      }

      // Marca de rastreo en pie de página
      doc.setFontSize(6);
      doc.setTextColor(180, 180, 180);
      doc.text(`Rastreado por Sandra Server - ID: ${trackingId}`, 10, pageHeight - 5);

      doc.restoreGraphicsState();
    }



    const fileName = `Caucion_${user.login}_${new Date().toISOString().slice(0, 10)}.pdf`;
    /* Reemplaza doc.save(fileName) por esto: */
    // 1. Obtener el binario como string dataURI
    const pdfDataUri = doc.output('datauristring');

    // 2. Calcular Hash y Registrar
    const hash = await this.sha256.hash(pdfDataUri);
    this.registrarDocumento(user, hash, fileName);


    // Sandra Sandbox Bridge detection
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({
        type: 'OPEN_SSE',
        payload: {
          fileName: fileName,
          data: pdfDataUri
        }
      }, '*');
    } else {
      // Direct browser download
      doc.save(fileName);
    }
  }

  registrarDocumento(user: any, hash: string, fileName: string) {
    const documento = {
      usuario: user.login,
      nombre: user.nombre,
      cedula: user.cedula,
      tipo: 'CAUCION',
      archivo: fileName,
      hash: hash,
      fecha: new Date().toISOString(),
      estatus: 1
    };

    const fnx = {
      coleccion: 'sys_documentos',
      objeto: documento,
      donde: JSON.stringify({ hash: hash }),
      driver: environment.driver.PRINCIPAL,
      upsert: true,
    };

    this.apiService.ExecColeccion(fnx).subscribe();
  }

  ngOnDestroy(): void {
    this.clearAllCountdowns();
  }

}
