import { Component, OnInit, signal, computed, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { NgbModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';

declare var feather: any;

/* ──────────────── MODELOS ──────────────── */
export interface ForumCategory {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  gradient: string;
  totalHilos: number;
  totalComentarios: number;
  ultimaActividad: string;
  orden: number;
}

export interface ForumThread {
  id: number;
  categoriaId: number;
  titulo: string;
  contenido: string;
  autor: string;
  autorAvatar: string;
  fechaCreacion: string;
  ultimaRespuesta: string;
  totalRespuestas: number;
  visitas: number;
  upvotes: number;
  isPinned: boolean;
  isLocked: boolean;
  estatus: 'activo' | 'cerrado' | 'archivado';
  etiquetas: string[];
}

export interface ForumComment {
  id: number;
  hiloId: number;
  parentId: number | null;
  contenido: string;
  autor: string;
  autorAvatar: string;
  fechaCreacion: string;
  upvotes: number;
  nivel: number;
  editado: boolean;
}

export interface ForumsState {
  view: 'categories' | 'threads' | 'thread' | 'admin';
  selectedCategory: ForumCategory | null;
  selectedThread: ForumThread | null;
}

/* ──────────────── MOCK DATA ──────────────── */
const MOCK_CATEGORIES: ForumCategory[] = [
  { id: 1, nombre: 'Sugerencias', descripcion: 'Comparte tus ideas y propuestas para mejorar la comunidad', icono: 'edit-3', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', totalHilos: 28, totalComentarios: 142, ultimaActividad: 'Hace 2 horas', orden: 1 },
  { id: 2, nombre: 'Anuncios', descripcion: 'Comunicados oficiales de la junta directiva y administración', icono: 'bell', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', totalHilos: 15, totalComentarios: 67, ultimaActividad: 'Hace 1 día', orden: 2 },
  { id: 3, nombre: 'Mantenimiento', descripcion: 'Reporta averías, solicita reparaciones y da seguimiento', icono: 'tool', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)', totalHilos: 42, totalComentarios: 198, ultimaActividad: 'Hace 30 min', orden: 3 },
  { id: 4, nombre: 'Convivencia', descripcion: 'Normas, eventos sociales y temas de convivencia vecinal', icono: 'users', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', totalHilos: 21, totalComentarios: 95, ultimaActividad: 'Hace 3 días', orden: 4 },
  { id: 5, nombre: 'Administración', descripcion: 'Gastos comunes, presupuestos, cuotas y temas financieros', icono: 'file-text', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', totalHilos: 19, totalComentarios: 76, ultimaActividad: 'Hace 5 horas', orden: 5 },
  { id: 6, nombre: 'Áreas Comunes', descripcion: 'Salón de usos múltiples, piscina, gimnasio y jardines', icono: 'grid', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)', totalHilos: 33, totalComentarios: 156, ultimaActividad: 'Hace 1 hora', orden: 6 },
];

let threadIdCounter = 7;
const MOCK_THREADS: ForumThread[] = [
  { id: 1, categoriaId: 2, titulo: '📢 Nueva plataforma digital para propietarios', contenido: '<p>Estimados propietarios,</p><p>Nos complace anunciar el lanzamiento de nuestra nueva plataforma digital donde podrán gestionar sus reservaciones, revisar noticias, participar en encuestas y colaborar en los foros comunitarios.</p><p>Esta herramienta está diseñada para facilitar la comunicación entre todos los vecinos y la junta directiva. Pronto estaremos compartiendo un tutorial de uso.</p><p>¡Bienvenidos a la nueva era digital de nuestro condominio!</p>', autor: 'Admin Sistema', autorAvatar: '', fechaCreacion: '2026-06-10T08:00:00', ultimaRespuesta: '2026-06-12T14:30:00', totalRespuestas: 5, visitas: 127, upvotes: 15, isPinned: true, isLocked: false, estatus: 'activo', etiquetas: ['oficial', 'importante'] },
  { id: 2, categoriaId: 3, titulo: '🔧 Reporte: Ascensor Torre A fuera de servicio', contenido: '<p>Se reporta que el ascensor de la Torre A (lado izquierdo) se encuentra fuera de servicio desde las 10:00 AM de hoy.</p><p>Ya se contactó a la empresa de mantenimiento. Estaremos informando sobre los avances. Disculpen las molestias.</p>', autor: 'Carlos Méndez', autorAvatar: '', fechaCreacion: '2026-06-12T10:30:00', ultimaRespuesta: '2026-06-12T15:45:00', totalRespuestas: 3, visitas: 89, upvotes: 8, isPinned: true, isLocked: false, estatus: 'activo', etiquetas: ['urgente'] },
  { id: 3, categoriaId: 4, titulo: '🎉 Evento: Cine al aire libre este sábado', contenido: '<p>¡Vecinos!</p><p>Este sábado 15 de junio a las 7:00 PM tendremos una noche de cine al aire libre en el área de la piscina.</p><p>Proyectaremos "Intensamente 2" para los niños y "El Gran Showman" para los adultos. Habrá palomitas y refrescos.</p><p>¡Los esperamos!</p>', autor: 'María González', autorAvatar: '', fechaCreacion: '2026-06-09T16:00:00', ultimaRespuesta: '2026-06-11T20:00:00', totalRespuestas: 12, visitas: 203, upvotes: 25, isPinned: false, isLocked: false, estatus: 'activo', etiquetas: ['evento'] },
  { id: 4, categoriaId: 5, titulo: '💰 Estado de cuentas: Mayo 2026', contenido: '<p>Se comparte el estado de cuentas correspondiente al mes de mayo 2026:</p><ul><li>Ingresos: Bs. 45.230,00</li><li>Egresos: Bs. 38.150,00</li><li>Saldo: Bs. 7.080,00</li></ul><p>El desglose detallado está disponible en la oficina de administración.</p>', autor: 'Admin Sistema', autorAvatar: '', fechaCreacion: '2026-06-05T09:00:00', ultimaRespuesta: '2026-06-08T11:30:00', totalRespuestas: 7, visitas: 156, upvotes: 12, isPinned: false, isLocked: true, estatus: 'cerrado', etiquetas: ['oficial'] },
  { id: 5, categoriaId: 1, titulo: '💡 Propuesta: Horarios extendidos para el gimnasio', contenido: '<p>Hola a todos,</p><p>Propongo que extendamos el horario del gimnasio hasta las 10:00 PM entre semana. Actualmente cierra a las 8:00 PM y muchos no alcanzamos a ir después del trabajo.</p><p>¿Qué opinan? Me gustaría saber sus comentarios para llevar la propuesta a la junta directiva.</p>', autor: 'Pedro Rojas', autorAvatar: '', fechaCreacion: '2026-06-08T14:00:00', ultimaRespuesta: '2026-06-11T18:00:00', totalRespuestas: 9, visitas: 178, upvotes: 20, isPinned: false, isLocked: false, estatus: 'activo', etiquetas: [] },
  { id: 6, categoriaId: 6, titulo: '🏊 Piscina cerrada por mantenimiento programado', contenido: '<p>Se informa que la piscina estará cerrada los días 20 y 21 de junio por trabajos de mantenimiento y limpieza profunda.</p><p>Agradecemos su comprensión.</p>', autor: 'Admin Sistema', autorAvatar: '', fechaCreacion: '2026-06-11T11:00:00', ultimaRespuesta: '2026-06-12T09:00:00', totalRespuestas: 2, visitas: 67, upvotes: 5, isPinned: false, isLocked: false, estatus: 'activo', etiquetas: ['aviso'] },
  { id: 7, categoriaId: 4, titulo: '🤝 Normas actualizadas de convivencia 2026', contenido: '<p>Se han actualizado las normas de convivencia para este año. Los cambios principales son:</p><ol><li>Horario de silencio extendido a las 10:00 PM</li><li>Uso de áreas comunes requiere reservación</li><li>Mascotas deben usar correa en áreas comunes</li></ol><p>La versión completa está disponible en recepción.</p>', autor: 'Junta Directiva', autorAvatar: '', fechaCreacion: '2026-06-01T10:00:00', ultimaRespuesta: '2026-06-07T16:00:00', totalRespuestas: 14, visitas: 245, upvotes: 30, isPinned: true, isLocked: true, estatus: 'cerrado', etiquetas: ['oficial', 'importante'] },
];

let commentIdCounter = 21;
const MOCK_COMMENTS: ForumComment[] = [
  { id: 1, hiloId: 1, parentId: null, contenido: 'Excelente noticia. Espero que la plataforma incluya la opción de pagar las cuotas en línea.', autor: 'Laura Fernández', autorAvatar: '', fechaCreacion: '2026-06-10T09:15:00', upvotes: 8, nivel: 0, editado: false },
  { id: 2, hiloId: 1, parentId: null, contenido: 'Me parece una gran iniciativa. La tecnología nos ayuda a mantenernos conectados.', autor: 'Roberto Castillo', autorAvatar: '', fechaCreacion: '2026-06-10T11:30:00', upvotes: 5, nivel: 0, editado: false },
  { id: 3, hiloId: 1, parentId: 1, contenido: 'Sí, Laura. La plataforma permitirá pagos en línea en la próxima actualización.', autor: 'Admin Sistema', autorAvatar: '', fechaCreacion: '2026-06-10T14:00:00', upvotes: 12, nivel: 1, editado: false },
  { id: 4, hiloId: 1, parentId: null, contenido: '¿Habrá aplicación móvil? Sería más cómodo desde el teléfono.', autor: 'Ana Soto', autorAvatar: '', fechaCreacion: '2026-06-11T08:00:00', upvotes: 7, nivel: 0, editado: false },
  { id: 5, hiloId: 1, parentId: 4, contenido: 'Sí, la app móvil estará disponible en julio para iOS y Android.', autor: 'Admin Sistema', autorAvatar: '', fechaCreacion: '2026-06-11T09:30:00', upvotes: 9, nivel: 1, editado: false },
  { id: 6, hiloId: 2, parentId: null, contenido: 'Ya era hora, llevaba fallando varios días. Gracias por la pronta respuesta.', autor: 'Miguel Ángel Torres', autorAvatar: '', fechaCreacion: '2026-06-12T11:00:00', upvotes: 4, nivel: 0, editado: false },
  { id: 7, hiloId: 2, parentId: null, contenido: '¿Cuánto tiempo estimado estará fuera de servicio?', autor: 'Sofía Rivas', autorAvatar: '', fechaCreacion: '2026-06-12T12:00:00', upvotes: 2, nivel: 0, editado: false },
  { id: 8, hiloId: 2, parentId: 7, contenido: 'Estiman que estará listo mañana al mediodía. Ya tienen la pieza de repuesto.', autor: 'Carlos Méndez', autorAvatar: '', fechaCreacion: '2026-06-12T13:15:00', upvotes: 3, nivel: 1, editado: false },
  { id: 9, hiloId: 3, parentId: null, contenido: '¡Qué buena idea! Voy a llevar a mis hijos seguro.', autor: 'Diana Paredes', autorAvatar: '', fechaCreacion: '2026-06-09T17:00:00', upvotes: 6, nivel: 0, editado: false },
  { id: 10, hiloId: 3, parentId: null, contenido: '¿Se puede llevar comida adicional o solo lo que den allí?', autor: 'José Hernández', autorAvatar: '', fechaCreacion: '2026-06-10T10:00:00', upvotes: 1, nivel: 0, editado: false },
  { id: 11, hiloId: 3, parentId: 10, contenido: 'Pueden traer sus propios snacks y bebidas, no hay problema.', autor: 'María González', autorAvatar: '', fechaCreacion: '2026-06-10T12:00:00', upvotes: 4, nivel: 1, editado: false },
  { id: 12, hiloId: 3, parentId: null, contenido: 'Ojalá hagan esto más seguido, une mucho a la comunidad.', autor: 'Ricardo Mendoza', autorAvatar: '', fechaCreacion: '2026-06-11T19:00:00', upvotes: 10, nivel: 0, editado: false },
  { id: 13, hiloId: 4, parentId: null, contenido: '¿Podrían detallar en qué se gastaron los Bs. 38.150?', autor: 'Luis Navarro', autorAvatar: '', fechaCreacion: '2026-06-05T10:30:00', upvotes: 11, nivel: 0, editado: false },
  { id: 14, hiloId: 4, parentId: null, contenido: 'Gracias por la transparencia. Se agradece la publicación mensual.', autor: 'Elena Vargas', autorAvatar: '', fechaCreacion: '2026-06-06T08:00:00', upvotes: 7, nivel: 0, editado: false },
  { id: 15, hiloId: 4, parentId: 13, contenido: 'El desglose está disponible en recepción. Pueden pasar a solicitarlo en horario de oficina.', autor: 'Admin Sistema', autorAvatar: '', fechaCreacion: '2026-06-06T09:00:00', upvotes: 5, nivel: 1, editado: false },
  { id: 16, hiloId: 5, parentId: null, contenido: 'Apoyo totalmente la propuesta. Yo también llego tarde del trabajo.', autor: 'Andrés Jiménez', autorAvatar: '', fechaCreacion: '2026-06-08T15:00:00', upvotes: 9, nivel: 0, editado: false },
  { id: 17, hiloId: 5, parentId: null, contenido: 'Me parece bien, pero habría que evaluar el consumo eléctrico adicional.', autor: 'Gloria Medina', autorAvatar: '', fechaCreacion: '2026-06-09T09:00:00', upvotes: 6, nivel: 0, editado: false },
  { id: 18, hiloId: 5, parentId: null, contenido: 'Podríamos hacer una votación entre los vecinos para decidir.', autor: 'Fernando Ruiz', autorAvatar: '', fechaCreacion: '2026-06-10T11:00:00', upvotes: 8, nivel: 0, editado: false },
  { id: 19, hiloId: 5, parentId: 17, contenido: 'Buen punto, Gloria. Se podría evaluar el costo y dividirlo entre los usuarios del gimnasio.', autor: 'Pedro Rojas', autorAvatar: '', fechaCreacion: '2026-06-10T14:30:00', upvotes: 4, nivel: 1, editado: false },
  { id: 20, hiloId: 6, parentId: null, contenido: 'Gracias por avisar con tiempo. Tomaré previsiones.', autor: 'Carmen Flores', autorAvatar: '', fechaCreacion: '2026-06-11T14:00:00', upvotes: 3, nivel: 0, editado: false },
];

@Component({
    selector: 'app-forums',
    templateUrl: './forums.component.html',
    styleUrls: ['./forums.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        CoreCommonModule,
        ContentHeaderModule,
        NgbModule,
        CoreDirectivesModule,
        CorePipesModule,
        NgxDatatableModule,
    ]
})
export class ForumsComponent implements OnInit {
  /* ── Signals de estado ── */
  private _categories = signal<ForumCategory[]>(MOCK_CATEGORIES);
  get categories() { return this._categories(); }

  private _threads = signal<ForumThread[]>(MOCK_THREADS);
  get threads() { return this._threads(); }

  private _comments = signal<ForumComment[]>(MOCK_COMMENTS);
  get comments() { return this._comments(); }

  private _view = signal<ForumsState['view']>('categories');
  get view() { return this._view(); }

  private _selectedCategory = signal<ForumCategory | null>(null);
  get selectedCategory() { return this._selectedCategory(); }

  private _selectedThread = signal<ForumThread | null>(null);
  get selectedThread() { return this._selectedThread(); }

  private _loading = signal(false);
  get loading() { return this._loading(); }

  /* ── Admin CRUD signals ── */
  private _adminCategories = signal<ForumCategory[]>(MOCK_CATEGORIES);
  get adminCategories() { return this._adminCategories(); }

  /* ── Búsqueda y paginación ── */
  searchCtrl = new FormControl('');
  searchThreadCtrl = new FormControl('');
  searchAdminCtrl = new FormControl('');

  threadsPage = signal(1);
  threadsPageSize = signal(8);
  adminPage = signal(1);
  adminPageSize = signal(10);

  /* ── Comentarios ── */
  newCommentCtrl = new FormControl('');
  replyTo = signal<{ id: number; autor: string } | null>(null);

  /* ── ColumnMode ── */
  ColumnMode = ColumnMode;

  /* ── Auth ── */
  currentUser: string = '';
  currentAvatar: string = '';

  /* ── Content Header ── */
  contentHeader: any;

  /* ── Computed ── */
  filteredThreads = computed(() => {
    const search = this.searchThreadCtrl.value?.toLowerCase() || '';
    const catId = this.selectedCategory?.id;
    let list = this.threads.filter(t => t.categoriaId === catId);
    if (search) {
      list = list.filter(t =>
        t.titulo.toLowerCase().includes(search) ||
        t.contenido.toLowerCase().includes(search) ||
        t.autor.toLowerCase().includes(search)
      );
    }
    // Pinned first, then by date
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    });
  });

  paginatedThreads = computed(() => {
    const page = this.threadsPage();
    const size = this.threadsPageSize();
    const items = this.filteredThreads();
    return items.slice((page - 1) * size, page * size);
  });

  totalThreadPages = computed(() => Math.ceil(this.filteredThreads().length / this.threadsPageSize()));

  threadComments = computed(() => {
    const threadId = this._selectedThread()?.id;
    if (!threadId) return [];
    return this.comments.filter(c => c.hiloId === threadId);
  });

  topLevelComments = computed(() => this.threadComments().filter(c => c.parentId === null));

  replyComments = computed(() => this.threadComments().filter(c => c.parentId !== null));

  getReplies(parentId: number): ForumComment[] {
    return this.threadComments().filter(c => c.parentId === parentId);
  }

  /* ── Admin computed ── */
  filteredAdminCategories = computed(() => {
    const search = this.searchAdminCtrl.value?.toLowerCase() || '';
    if (!search) return this.adminCategories;
    return this.adminCategories.filter(c =>
      c.nombre.toLowerCase().includes(search) ||
      c.descripcion.toLowerCase().includes(search)
    );
  });

  paginatedAdminCategories = computed(() => {
    const page = this.adminPage();
    const size = this.adminPageSize();
    return this.filteredAdminCategories().slice((page - 1) * size, page * size);
  });

  totalAdminPages = computed(() => Math.ceil(this.filteredAdminCategories().length / this.adminPageSize()));

  /* ── Modal ref ── */
  private _modalRef: NgbModalRef | null = null;

  /* ── Constructor ── */
  constructor(private modalService: NgbModal) {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = this.decodeToken(token);
        this.currentUser = decoded?.Usuario?.usuario || 'Propietario';
        this.currentAvatar = decoded?.Usuario?.avatar || '';
      } catch {
        this.currentUser = 'Propietario';
      }
    } else {
      this.currentUser = 'Propietario';
    }
  }

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Foros de Discusión',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Principal', isLink: true, link: '/home' },
          { name: 'Comunicación', isLink: false },
          { name: 'Foros', isLink: false }
        ]
      }
    };
  }

  /* ── Navegación ── */
  selectCategory(cat: ForumCategory): void {
    this._selectedCategory.set(cat);
    this._view.set('threads');
    this.threadsPage.set(1);
    this.searchThreadCtrl.setValue('');
  }

  selectThread(thread: ForumThread): void {
    // Incrementar visitas
    const updated = thread;
    updated.visitas++;
    this._selectedThread.set({...updated});
    this._view.set('thread');
    this.newCommentCtrl.setValue('');
    this.replyTo.set(null);
  }

  goToCategories(): void {
    this._view.set('categories');
    this._selectedCategory.set(null);
    this._selectedThread.set(null);
  }

  goToThreads(): void {
    this._view.set('threads');
    this._selectedThread.set(null);
    this.newCommentCtrl.setValue('');
    this.replyTo.set(null);
  }

  goToAdmin(): void {
    this._view.set('admin');
  }

  /* ── Upvotes ── */
  upvoteThread(thread: ForumThread): void {
    const updated = { ...thread, upvotes: thread.upvotes + 1 };
    const list = this._threads().map(t => t.id === thread.id ? updated : t);
    this._threads.set(list);
    if (this._selectedThread()?.id === thread.id) {
      this._selectedThread.set(updated);
    }
  }

  upvoteComment(comment: ForumComment): void {
    const updated = { ...comment, upvotes: comment.upvotes + 1 };
    const list = this._comments().map(c => c.id === comment.id ? updated : c);
    this._comments.set(list);
  }

  /* ── Comentarios ── */
  setReplyTo(comment: ForumComment): void {
    this.replyTo.set({ id: comment.id, autor: comment.autor });
  }

  cancelReply(): void {
    this.replyTo.set(null);
  }

  addComment(): void {
    const content = this.newCommentCtrl.value?.trim();
    if (!content) return;

    const threadId = this._selectedThread()?.id;
    if (!threadId) return;

    const reply = this.replyTo();

    const newComment: ForumComment = {
      id: ++commentIdCounter,
      hiloId: threadId,
      parentId: reply?.id || null,
      contenido: content,
      autor: this.currentUser,
      autorAvatar: this.currentAvatar,
      fechaCreacion: new Date().toISOString(),
      upvotes: 0,
      nivel: reply ? 1 : 0,
      editado: false
    };

    this._comments.set([...this.comments, newComment]);

    // Actualizar contador en el hilo
    const thread = this._selectedThread();
    if (thread) {
      const updated = { ...thread, totalRespuestas: thread.totalRespuestas + 1, ultimaRespuesta: new Date().toISOString() };
      this._selectedThread.set(updated);
      const list = this._threads().map(t => t.id === thread.id ? updated : t);
      this._threads.set(list);
    }

    this.newCommentCtrl.setValue('');
    this.replyTo.set(null);
  }

  /* ── Admin CRUD ── */
  adminFormNombre = new FormControl('');
  adminFormDescripcion = new FormControl('');
  adminFormIcono = new FormControl('');
  adminFormColor = new FormControl('');
  adminFormGradient = new FormControl('');
  adminEditId = signal<number | null>(null);
  adminSubmitted = signal(false);

  iconosDisponibles = ['edit-3', 'bell', 'tool', 'users', 'file-text', 'grid', 'home', 'message-circle', 'bookmark', 'calendar', 'camera', 'music', 'heart', 'star', 'thumbs-up', 'share-2', 'alert-circle', 'info', 'help-circle', 'check-circle', 'zap', 'trending-up', 'activity', 'package'];

  coloresDisponibles = [
    { nombre: 'Amber', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' },
    { nombre: 'Azul', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' },
    { nombre: 'Rojo', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)' },
    { nombre: 'Verde', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' },
    { nombre: 'Púrpura', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' },
    { nombre: 'Cian', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)' },
    { nombre: 'Rosa', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
    { nombre: 'Naranja', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)' },
  ];

  openAdminModal(modal: any, category?: ForumCategory): void {
    this.adminSubmitted.set(false);
    if (category) {
      this.adminEditId.set(category.id);
      this.adminFormNombre.setValue(category.nombre);
      this.adminFormDescripcion.setValue(category.descripcion);
      this.adminFormIcono.setValue(category.icono);
      this.adminFormColor.setValue(category.color);
      this.adminFormGradient.setValue(category.gradient);
    } else {
      this.adminEditId.set(null);
      this.adminFormNombre.setValue('');
      this.adminFormDescripcion.setValue('');
      this.adminFormIcono.setValue('edit-3');
      this.adminFormColor.setValue('#3b82f6');
      this.adminFormGradient.setValue('linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)');
    }
    this._modalRef = this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: true,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  saveAdminCategory(modal: any): void {
    this.adminSubmitted.set(true);
    const nombre = this.adminFormNombre.value?.trim();
    const descripcion = this.adminFormDescripcion.value?.trim();
    if (!nombre || !descripcion) return;

    const editId = this.adminEditId();

    if (editId) {
      // Editar existente
      const list = this.adminCategories.map(c => {
        if (c.id === editId) {
          return {
            ...c,
            nombre: nombre || c.nombre,
            descripcion: descripcion || c.descripcion,
            icono: this.adminFormIcono.value || c.icono,
            color: this.adminFormColor.value || c.color,
            gradient: this.adminFormGradient.value || c.gradient,
          };
        }
        return c;
      });
      this._adminCategories.set(list);
      this._categories.set(list);
      Swal.fire({ icon: 'success', title: 'Categoría actualizada', text: `"${nombre}" se actualizó correctamente`, timer: 2000, showConfirmButton: false });
    } else {
      // Nueva categoría
      const newCat: ForumCategory = {
        id: Math.max(...this.adminCategories.map(c => c.id)) + 1,
        nombre: nombre || '',
        descripcion: descripcion || '',
        icono: this.adminFormIcono.value || 'edit-3',
        color: this.adminFormColor.value || '#3b82f6',
        gradient: this.adminFormGradient.value || 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        totalHilos: 0,
        totalComentarios: 0,
        ultimaActividad: 'Justo ahora',
        orden: this.adminCategories.length + 1,
      };
      this._adminCategories.set([...this.adminCategories, newCat]);
      this._categories.set([...this.categories, newCat]);
      Swal.fire({ icon: 'success', title: 'Categoría creada', text: `"${nombre}" se agregó correctamente`, timer: 2000, showConfirmButton: false });
    }

    this._modalRef?.dismiss();
    this._modalRef = null;
  }

  deleteAdminCategory(category: ForumCategory): void {
    // Verificar si tiene hilos
    const hasThreads = this.threads.some(t => t.categoriaId === category.id);
    const confirmText = hasThreads
      ? `La categoría "${category.nombre}" tiene hilos asociados que también se eliminarán.`
      : `¿Estás seguro de eliminar "${category.nombre}"?`;

    Swal.fire({
      title: '¿Eliminar categoría?',
      text: confirmText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-danger me-1',
        cancelButton: 'btn btn-secondary'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Eliminar hilos asociados
        const threadIds = this.threads.filter(t => t.categoriaId === category.id).map(t => t.id);
        this._threads.set(this.threads.filter(t => t.categoriaId !== category.id));
        this._comments.set(this.comments.filter(c => !threadIds.includes(c.hiloId)));

        // Eliminar categoría
        this._adminCategories.set(this.adminCategories.filter(c => c.id !== category.id));
        this._categories.set(this.categories.filter(c => c.id !== category.id));

        Swal.fire({ icon: 'success', title: 'Eliminado', text: `"${category.nombre}" fue eliminada`, timer: 2000, showConfirmButton: false });
      }
    });
  }

  /* ── Helpers ── */
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getUserColor(name: string): string {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Justo ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getCategoryName(catId: number): string {
    return this.categories.find(c => c.id === catId)?.nombre || 'General';
  }

  getCategoryColor(catId: number): string {
    return this.categories.find(c => c.id === catId)?.color || '#6b7280';
  }

  /* ── Paginación ── */
  setThreadsPage(page: number): void {
    if (page >= 1 && page <= this.totalThreadPages()) this.threadsPage.set(page);
  }

  setAdminPage(page: number): void {
    if (page >= 1 && page <= this.totalAdminPages()) this.adminPage.set(page);
  }

  /* ── Search ESC ── */
  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.searchThreadCtrl.setValue('');
    }
  }

  onAdminSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.searchAdminCtrl.setValue('');
    }
  }

  /* ── Etiqueta badge class ── */
  getEtiquetaClass(etiqueta: string): string {
    const map: Record<string, string> = {
      'oficial': 'badge-light-primary',
      'importante': 'badge-light-warning',
      'urgente': 'badge-light-danger',
      'evento': 'badge-light-success',
      'aviso': 'badge-light-info',
    };
    return map[etiqueta] || 'badge-light-secondary';
  }
}
