"use strict";
(self["webpackChunkvuexy"] = self["webpackChunkvuexy"] || []).push([[478],{

/***/ 90415:
/*!***********************************************************************!*\
  !*** ./src/app/main/asistente-virtual/asistente-virtual.component.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsistenteVirtualComponent": () => (/* binding */ AsistenteVirtualComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 94650);
/* harmony import */ var _services_apicore_api_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @services/apicore/api.service */ 89780);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ 24006);





const _c0 = ["chatMessages"];

function AsistenteVirtualComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 2)(1, "a", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AsistenteVirtualComponent_div_0_Template_a_click_1_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r3);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r2.chat_box());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "img", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
}

function AsistenteVirtualComponent_div_1_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 18)(1, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, " Asistente Virtual ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "span", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AsistenteVirtualComponent_div_1_div_2_Template_span_click_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r9);
      const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r8.hideChat());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](4, "i", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](6, "img", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](7, "div", 24)(8, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9, "\u00A1Hola! Soy ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](11, "SANDRA ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](12, ", \u00BFen qu\u00E9 puedo ayudarlo?");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
  }
}

function AsistenteVirtualComponent_div_1_div_3_div_18_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 36)(1, "div", 37)(2, "span", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "img", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "div", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](7, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "span", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](9, "img", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
  }

  if (rf & 2) {
    const item_r12 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", item_r12.preg, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", item_r12.resp, " ");
  }
}

function AsistenteVirtualComponent_div_1_div_3_div_19_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 41)(1, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "div", 43)(3, "div", 43)(4, "div", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
}

function AsistenteVirtualComponent_div_1_div_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 25)(1, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, " Asistente Virtual ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "span", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AsistenteVirtualComponent_div_1_div_3_Template_span_click_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r14);
      const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r13.hideChat());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](4, "i", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](5, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 27)(7, "div", 28)(8, "span", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](9, "img", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "div", 31)(11, "p", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](12, "\u00A1Hola! Soy ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](13, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](14, "SANDRA IA");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](15, ", \u00BFen qu\u00E9 puedo ayudarlo? ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](16, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](17, "|");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](18, AsistenteVirtualComponent_div_1_div_3_div_18_Template, 12, 2, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](19, AsistenteVirtualComponent_div_1_div_3_div_19_Template, 5, 0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }

  if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r5.client);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r5.hidden);
  }
}

const _c1 = function () {
  return {
    standalone: true
  };
};

function AsistenteVirtualComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 5)(1, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, AsistenteVirtualComponent_div_1_div_2_Template, 13, 0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, AsistenteVirtualComponent_div_1_div_3_Template, 20, 2, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "div", 9)(5, "form", 10, 11)(7, "input", 12, 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AsistenteVirtualComponent_div_1_Template_input_click_7_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r16);
      const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r15.ChatMessages());
    })("ngModelChange", function AsistenteVirtualComponent_div_1_Template_input_ngModelChange_7_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r16);
      const ctx_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r17.msj = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AsistenteVirtualComponent_div_1_Template_button_click_9_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r16);
      const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r18.ChatBot());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](10, "i", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](11, "p", 16)(12, "a", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](13, "Powered by Code-Epic Technologies");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
  }

  if (rf & 2) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](6);

    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](8);

    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.ChatWelcome);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.ChatMessage);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassProp"]("error", !_r7.valid && _r6.submitted);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngModel", ctx_r1.msj)("ngModelOptions", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](6, _c1));
  }
}

class AsistenteVirtualComponent {
  apiService;
  xAPI = {
    funcion: '',
    parametros: ''
  };
  chatMessages;
  messages = [];
  userInput = '';
  status = false;
  msj;
  preg;
  hidden = false;
  msjAux;
  client = [];
  boot = [];
  MostrarChat = false;
  ChatWelcome = false;
  ChatMessage = false;

  constructor(apiService) {
    this.apiService = apiService;
  }

  ngOnInit() {
    this.status = true; // this.escribirComoMaquina("¡Hola! Bienvenid@ Soy SANDRA IA, ¿en qué puedo ayudarlo?.", 50, "texto-maquina");
  }

  ChatBot() {
    this.msjAux = this.msj;
    this.msj = '';
    this.hidden = true;
    this.xAPI.funcion = 'CHATBOOT';
    this.xAPI.parametros = this.msjAux;
    this.apiService.Ejecutar(this.xAPI).subscribe(data => {
      // console.log(data)
      if (data.Cuerpo.length > 0) {
        data.Cuerpo.map(e => {
          e.preg = this.msjAux;
          this.client.push(e);
        });
      } else {
        this.client.push({
          resp: 'Oops lo siento, en este momento estoy presentando problemas con la conexion a internet, por favor intente mas tarde!',
          preg: this.msjAux
        });
      }

      this.hidden = false;
    }, error => {
      this.client.push({
        resp: 'Problemas con BackEnd, porfavor contacte al administrador!',
        preg: this.msjAux
      });
      this.hidden = false;
    });
  }

  chat_box() {
    this.client = [];
    this.msj = '';
    this.status = false;
    this.MostrarChat = true;
    this.ChatWelcome = true;
  }

  ChatMessages() {
    this.ChatWelcome = false;
    this.ChatMessage = true;
  }

  hideChat() {
    this.client = [];
    this.msj = '';
    this.MostrarChat = false;
    this.ChatMessage = false;
    this.status = true;
  }

  escribirComoMaquina(texto, velocidad, tipo) {
    var i = 0;
    var intervalo = setInterval(function () {
      document.getElementById(tipo).textContent += texto.charAt(i);
      i++;

      if (i >= texto.length) {
        clearInterval(intervalo);
        document.getElementById(tipo).innerHTML += "<br>";
        this.escribirComoMaquina(texto, velocidad);
      }
    }, velocidad);
  }

  enviarMensaje() {
    const mensajeUsuario = this.userInput; // Simular respuesta del chat

    const respuestaChat = 'Hola, ¿en qué puedo ayudarte?';
    this.messages.push(mensajeUsuario);
    this.messages.push(respuestaChat);
    this.userInput = '';
    this.scrollChat();
  }

  scrollChat() {
    setTimeout(() => {
      const chatMessagesElement = this.chatMessages.nativeElement;
      chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    }, 100);
  }

  static ɵfac = function AsistenteVirtualComponent_Factory(t) {
    return new (t || AsistenteVirtualComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_services_apicore_api_service__WEBPACK_IMPORTED_MODULE_0__.ApiService));
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
    type: AsistenteVirtualComponent,
    selectors: [["app-asistente-virtual"]],
    viewQuery: function AsistenteVirtualComponent_Query(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c0, 5);
      }

      if (rf & 2) {
        let _t;

        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.chatMessages = _t.first);
      }
    },
    decls: 2,
    vars: 2,
    consts: [["id", "chat-circle", 4, "ngIf"], ["class", "chat-box", "style", "position: auto; z-index: 1;", 4, "ngIf"], ["id", "chat-circle"], [1, "btn-whatsapp", "fondo-negro", 3, "click"], ["src", "assets/images/logo/logo.png", "width", "80%", "height", "80%", "alt", "ChatBoot"], [1, "chat-box", 2, "position", "auto", "z-index", "1"], [1, "chat-box-body"], ["class", "chat-box-welcome__header", 4, "ngIf"], ["id", "chat-box__wraper", 4, "ngIf"], [1, "chat-input-box"], [1, "chat-input__form"], ["formUsersRegister", "ngForm"], ["type", "text", "autocomplete", "off", "required", "", "id", "chat-input__text", "placeholder", "Preguntame...", 1, "chat-input__text", 3, "ngModel", "ngModelOptions", "click", "ngModelChange"], ["ChatBoot", "ngModel"], ["id", "chat-submit", 1, "chat-submit", 3, "click"], [1, "fa", "fa-send-o"], [1, "chat-box__sign"], ["href", "https://code-epic.com", "target", "_blank"], [1, "chat-box-welcome__header"], [1, "chat-box-header"], [1, "chat-box-toggle", 3, "click"], [1, "fa", "fa-minus-square-o"], ["id", "chat-box-welcome__ava"], ["src", "assets/images/logo/logo.png", 1, "chat-box-welcome_robot"], [1, "chat-box-welcome__welcome-text"], ["id", "chat-box__wraper"], [1, "chat-box-overlay"], [1, "chat-logs", 2, "overflow", "scroll", "background-image", "url('https://cdn.wallpapersafari.com/28/83/ls0Ajp.jpg')", "height", "400px"], ["id", "cm-msg-0", 1, "chat-msg", "bot", 2, "padding", "1px"], [1, "msg-avatar"], ["width", "60px", "src", "assets/images/logo/logo.png", 1, "chat-box-overlay_robot"], [1, "cm-msg-text"], [1, "maquina-escribir"], [1, "cursor"], ["class", "", 4, "ngFor", "ngForOf"], ["class", "spin-container", 4, "ngIf"], [1, ""], [1, "chat-msg", "bot"], [1, "msg-avatar-client"], ["width", "60px", "src", "assets/images/avatar.png", 1, "chat-box-overlay_robot"], [1, "cm-msg-text-client"], [1, "spin-container"], [1, "spiner"], ["aria-hidden", "true"]],
    template: function AsistenteVirtualComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](0, AsistenteVirtualComponent_div_0_Template, 3, 0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, AsistenteVirtualComponent_div_1_Template, 14, 7, "div", 1);
      }

      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.status);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.MostrarChat);
      }
    },
    dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.RequiredValidator, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgModel, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgForm],
    styles: ["@charset \"UTF-8\";\n\nhtml[_ngcontent-%COMP%], body[_ngcontent-%COMP%] {\n  background: #efefef;\n  height: 100%;\n  font-family: \"Roboto\", \"Helvetica Neue\", Arial, sans-serif;\n}\n#center-text[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  height: 100%;\n}\n\n.chat-circle_robot[_ngcontent-%COMP%] {\n  margin-left: 3.5px;\n  margin-top: 3.5px;\n}\n.chat-box-overlay_robot[_ngcontent-%COMP%] {\n  margin-left: -1.5px;\n  margin-top: -0.5px;\n}\nchat-box-overlay_robot[_ngcontent-%COMP%]   .chat-box-welcome_robot[_ngcontent-%COMP%] {\n  margin-left: -50px;\n  top: -10px;\n  left: 50px;\n  right: 50px;\n}\n\n.chat-box-welcome__company-name[_ngcontent-%COMP%], .chat-box__sign[_ngcontent-%COMP%] {\n  font-family: \"Roboto\", \"Helvetica Neue\", \"Arial\", sans-serif;\n  position: relative;\n}\n\n.chat-box__sign[_ngcontent-%COMP%] {\n  font-size: 9px;\n  line-height: 20px;\n  color: #b5b5b5;\n}\n.chat-input-box[_ngcontent-%COMP%] {\n  text-align: center;\n  position: relative;\n}\n.btn#my-btn[_ngcontent-%COMP%] {\n  background: white;\n  padding-top: 13px;\n  padding-bottom: 12px;\n  border-radius: 45px;\n  padding-right: 40px;\n  padding-left: 40px;\n  color: #5865C3;\n}\n\n#chat-circle[_ngcontent-%COMP%], .chat-box-welcome__header[_ngcontent-%COMP%], .chat-box-header[_ngcontent-%COMP%], .chat-msg.bot[_ngcontent-%COMP%]    > .msg-avatar[_ngcontent-%COMP%] {\n  background-image: linear-gradient(#1ba261 60%, #1ba261 40%);\n}\n.options-btn[_ngcontent-%COMP%] {\n  border: 1px solid rgb(255, 255, 255);\n}\n.spiner[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\n  background: rgb(0, 0, 0);\n}\n\n#chat-circle[_ngcontent-%COMP%] {\n  position: fixed;\n  bottom: 65px;\n  right: 0px;\n  width: 100px;\n  height: 100px;\n  border-radius: 50%;\n  padding: -80px;\n  cursor: pointer;\n  background-image: linear-gradient(to top left, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0));\n}\n#chat-overlay[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.1);\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n}\n.chat-circle_robot[_ngcontent-%COMP%] {\n  top: 100;\n  left: 100;\n  width: 80%;\n  height: 80%;\n}\n.chat-box-welcome[_ngcontent-%COMP%] {\n  background: #f8f8f8;\n  position: fixed;\n  right: 30px;\n  bottom: 50px;\n  width: 350px;\n  max-width: 85vw;\n  max-height: 100vh;\n  border-radius: 3px;\n  box-shadow: 0px 5px 35px 9px #ccc;\n}\n.chat-box-welcome__header[_ngcontent-%COMP%] {\n  height: 420px;\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.chat-box__header-text[_ngcontent-%COMP%] {\n  color: white;\n  padding-left: 10px;\n  font-size: 20px;\n  padding-top: 13px;\n}\n#chat-box-welcome__ava[_ngcontent-%COMP%] {\n  border-radius: 50%;\n  position: absolute;\n  top: 98px;\n  left: 124px;\n  width: 200px;\n  height: 200px;\n  border-radius: 50%;\n  color: white;\n}\n.chat-box-welcome_robot[_ngcontent-%COMP%] {\n  height: 100px;\n  position: absolute;\n}\n.chat-box-welcome__welcome-text[_ngcontent-%COMP%] {\n  color: #fff;\n  text-align: center;\n  width: 80%;\n  position: relative;\n  top: 45%;\n  left: 50%;\n  transform: translateX(-50%);\n}\n.chat-box-welcome__welcome-text[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  font-size: 20px;\n}\n\n.chat-box[_ngcontent-%COMP%] {\n  background: #f8f8f8;\n  position: fixed;\n  right: 30px;\n  bottom: 50px;\n  width: 350px;\n  max-width: 85vw;\n  max-height: 100vh;\n  border-radius: 3px;\n  box-shadow: 0px 5px 35px 9px #ccc;\n}\n.chat-box-toggle[_ngcontent-%COMP%] {\n  float: right;\n  margin-right: 15px;\n  cursor: pointer;\n}\n.chat-box-header[_ngcontent-%COMP%] {\n  position: relative;\n  height: 50px;\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n  color: white;\n  padding-left: 10px;\n  font-size: 20px;\n  padding-top: 13px;\n}\n.chat-box-body[_ngcontent-%COMP%] {\n  position: relative;\n  height: 370px;\n  height: auto;\n  border-bottom: 1px solid rgba(181, 181, 181, 0.42);\n  overflow: hidden;\n}\n.chat-box-body[_ngcontent-%COMP%]:after {\n  content: \"\";\n  background-color: #F8F8F8;\n  opacity: 0.1;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  height: 100%;\n  position: absolute;\n  z-index: -1;\n}\n.chat-input__text[_ngcontent-%COMP%] {\n  background: #fff;\n  width: 95%;\n  position: relative;\n  height: 47px;\n  padding-top: 10px;\n  padding-right: 50px;\n  padding-bottom: 10px;\n  padding-left: 15px;\n  margin-top: 5px;\n  resize: none;\n  outline: none;\n  border: 1px solid #F2F0F0;\n  color: #888;\n  border-radius: 3px;\n  overflow: hidden;\n}\n.chat-input-box[_ngcontent-%COMP%]    > form[_ngcontent-%COMP%] {\n  margin-bottom: 0;\n}\n.chat-input__text[_ngcontent-%COMP%]::-webkit-input-placeholder {\n  \n  color: #ccc;\n}\n.chat-input__text[_ngcontent-%COMP%]::-moz-placeholder {\n  \n  color: #ccc;\n}\n.chat-input__text[_ngcontent-%COMP%]:-ms-input-placeholder {\n  \n  color: #ccc;\n}\n.chat-input__text[_ngcontent-%COMP%]:-moz-placeholder {\n  \n  color: #ccc;\n}\n.chat-submit[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 27px;\n  right: 10px;\n  background: transparent;\n  box-shadow: none;\n  border: none;\n  border-radius: 50%;\n  color: rgba(250, 65, 95, 0.99);\n  width: 35px;\n  height: 35px;\n}\n.chat-logs[_ngcontent-%COMP%] {\n  padding: 15px;\n  height: 370px;\n  overflow-y: scroll;\n}\n@media only screen and (max-width: 500px) {\n  .chat-logs[_ngcontent-%COMP%] {\n    height: 40vh;\n  }\n}\n.chat-msg.bot[_ngcontent-%COMP%]    > .msg-avatar[_ngcontent-%COMP%] {\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  float: left;\n}\n.chat-msg.bot[_ngcontent-%COMP%]    > .msg-avatar-client[_ngcontent-%COMP%] {\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  float: right;\n  position: relative;\n}\n.chat-msg.self[_ngcontent-%COMP%]    > .msg-avatar[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  float: right;\n  width: 15%;\n}\n.cm-msg-text[_ngcontent-%COMP%] {\n  background: white;\n  padding: 10px 15px 10px 15px;\n  color: #000000;\n  max-width: 75%;\n  float: left;\n  margin-left: 10px;\n  position: relative;\n  margin-bottom: 20px;\n  border-radius: 3px;\n}\n.cm-msg-text-client[_ngcontent-%COMP%] {\n  background: white;\n  padding: 10px 15px 10px 15px;\n  color: #000000;\n  max-width: 75%;\n  float: right;\n  margin-left: 10px;\n  position: relative;\n  margin-bottom: 20px;\n  border-radius: 3px;\n}\n.options-btn[_ngcontent-%COMP%] {\n  background: white;\n  padding: 10px 15px 10px 15px;\n  color: #666;\n  width: 75%;\n  margin-left: 55px;\n  position: relative;\n  margin-bottom: 20px;\n  border-radius: 3px;\n  text-align: center;\n}\n.chat-msg[_ngcontent-%COMP%] {\n  clear: both;\n}\n.chat-msg.self[_ngcontent-%COMP%]    > .cm-msg-text[_ngcontent-%COMP%] {\n  float: right;\n  background: #efefef;\n  \n}\n.cm-msg-button[_ngcontent-%COMP%]    > ul[_ngcontent-%COMP%]    > li[_ngcontent-%COMP%] {\n  list-style: none;\n  float: left;\n  width: 50%;\n}\n.cm-msg-button[_ngcontent-%COMP%] {\n  clear: both;\n  margin-bottom: 70px;\n}\n\n.spin-container[_ngcontent-%COMP%] {\n  \n  color: #666;\n  max-width: 75%;\n  \n  bottom: 4px;\n  left: 50%;\n  \n  position: absolute;\n  \n}\n.spiner[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  margin: -10px 0 0 -20px;\n  display: inline-block;\n  position: relative;\n  height: 20px;\n  width: 40px;\n}\n.spiner[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 5px;\n  height: 10px;\n  width: 10px;\n  border-radius: 50%;\n  \n  opacity: 0.6;\n  transform: translateX(0px);\n}\n.spiner[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:nth-child(1) {\n  left: 0;\n  animation: mymove 1.3s infinite ease-in;\n}\n.spiner[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:nth-child(2) {\n  left: 12px;\n  animation: mymove 1.3s 0.3s infinite ease-in;\n}\n.spiner[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:nth-child(3) {\n  left: 24px;\n  animation: mymove 1.3s 0.6s infinite ease-in;\n}\n@keyframes mymove {\n  0%, 100%, 80% {\n    opacity: 0.6;\n    transform: scale(0.4);\n  }\n  40% {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n.fondo-negro[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 5px 5px #000000);\n  border-top-left-radius: 100px;\n  border-top-right-radius: 100px;\n  border-bottom-right-radius: 100px;\n  border-bottom-left-radius: 100px;\n  z-index: -1;\n}\n.fondo-negro[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.2901960784));\n  border-top-left-radius: 100px;\n  border-top-right-radius: 100px;\n  border-bottom-right-radius: 100px;\n  border-bottom-left-radius: 100px;\n  z-index: -1;\n}\n.btn-whatsapp[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: 999;\n  bottom: 60px;\n  right: 60px;\n  height: 100px;\n  width: 100px;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:before, .btn-whatsapp[_ngcontent-%COMP%]:after {\n  content: \"\";\n  position: absolute;\n  top: 15px;\n  left: 15px;\n  width: 45px;\n  height: 45px;\n  border-radius: 50%;\n  background-color: #ffc003;\n  opacity: 0;\n  animation: onda 1.7s infinite;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:before {\n  animation-delay: 1s;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:after {\n  animation-delay: 1.3s;\n}\n.btn-whatsapp[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 2;\n}\n@keyframes onda {\n  0% {\n    transform: scale(1);\n  }\n  15% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n    transform: scale(4);\n  }\n}\n.maquina-escribir[_ngcontent-%COMP%] {\n  white-space: nowrap; \n  width: 24ch; \n  animation: escribiendo 2s steps(20);\n  overflow: hidden;\n}\n.cursor[_ngcontent-%COMP%] {\n  animation: 0.6s parpadeo-cursor infinite;\n}\n@keyframes escribiendo {\n  from {\n    width: 0;\n  }\n}\n@keyframes parpadeo-cursor {\n  50% {\n    opacity: 0;\n  }\n}\n#texto-maquina[_ngcontent-%COMP%] {\n  font-family: \"Arial\", sans-serif;\n  font-size: 16px;\n  width: 200px;\n}"]
  });
}

/***/ }),

/***/ 60109:
/*!********************************************************************************************************!*\
  !*** ./src/app/main/pages/authentication/auth-forgot-password-v1/auth-forgot-password-v1.component.ts ***!
  \********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AuthForgotPasswordV1Component": () => (/* binding */ AuthForgotPasswordV1Component)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 24006);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ 7625);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 8929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 94650);
/* harmony import */ var _core_services_config_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @core/services/config.service */ 52553);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 34793);
/* harmony import */ var _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/flex-layout/extended */ 24784);
/* harmony import */ var _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @core/directives/core-ripple-effect/core-ripple-effect.directive */ 75287);
/* harmony import */ var _core_directives_core_feather_icons_core_feather_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @core/directives/core-feather-icons/core-feather-icons */ 66279);












function AuthForgotPasswordV1Component_div_17_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Email is required");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}

function AuthForgotPasswordV1Component_div_17_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Email must be a valid email address");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}

function AuthForgotPasswordV1Component_div_17_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, AuthForgotPasswordV1Component_div_17_div_1_Template, 2, 0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, AuthForgotPasswordV1Component_div_17_div_2_Template, 2, 0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r0.f.email.errors.required);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r0.f.email.errors.email);
  }
}

const _c0 = function (a0) {
  return {
    "is-invalid": a0
  };
};

class AuthForgotPasswordV1Component {
  _coreConfigService;
  _formBuilder; // Public

  emailVar;
  coreConfig;
  forgotPasswordForm;
  submitted = false; // Private

  _unsubscribeAll;
  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   *
   */

  constructor(_coreConfigService, _formBuilder) {
    this._coreConfigService = _coreConfigService;
    this._formBuilder = _formBuilder;
    this._unsubscribeAll = new rxjs__WEBPACK_IMPORTED_MODULE_4__.Subject(); // Configure the layout

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  } // convenience getter for easy access to form fields


  get f() {
    return this.forgotPasswordForm.controls;
  }
  /**
   * On Submit
   */


  onSubmit() {
    this.submitted = true; // stop here if form is invalid

    if (this.forgotPasswordForm.invalid) {
      return;
    }
  } // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */


  ngOnInit() {
    this.forgotPasswordForm = this._formBuilder.group({
      email: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.email]]
    }); // Subscribe to config changes

    this._coreConfigService.config.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.takeUntil)(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }
  /**
   * On destroy
   */


  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();

    this._unsubscribeAll.complete();
  }

  static ɵfac = function AuthForgotPasswordV1Component_Factory(t) {
    return new (t || AuthForgotPasswordV1Component)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_core_services_config_service__WEBPACK_IMPORTED_MODULE_0__.CoreConfigService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_5__.UntypedFormBuilder));
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
    type: AuthForgotPasswordV1Component,
    selectors: [["app-auth-forgot-password-v1"]],
    decls: 24,
    vars: 7,
    consts: [[1, "auth-wrapper", "auth-v1", "px-2"], [1, "auth-inner", "py-2"], [1, "card", "mb-0"], [1, "card-body"], ["href", "javascript:void(0);", 1, "brand-logo"], ["alt", "brand-logo", "height", "28", 3, "src"], [1, "brand-text", "text-primary", "ml-1"], [1, "card-title", "mb-1"], [1, "card-text", "mb-2"], [1, "auth-forgot-password-form", "mt-2", 3, "formGroup", "ngSubmit"], [1, "form-group"], ["for", "forgot-password-email", 1, "form-label"], ["type", "text", "placeholder", "john@example.com", "formControlName", "email", "aria-describedby", "forgot-password-email", "tabindex", "1", "autofocus", "", 1, "form-control", 3, "ngClass"], ["class", "invalid-feedback", 4, "ngIf"], ["tabindex", "2", "rippleEffect", "", 1, "btn", "btn-primary", "btn-block"], [1, "text-center", "mt-2"], ["routerLink", "/"], ["data-feather", "chevron-left", 1, "mb-25"], [1, "invalid-feedback"], [4, "ngIf"]],
    template: function AuthForgotPasswordV1Component_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "a", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](5, "img", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "h2", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "h4", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](9, "Has olvidado tu contrase\u00F1a? \uD83D\uDD12");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](10, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](11, "Ingresa tu correo electr\u00F3nico y te enviaremos instrucciones para restablecer tu contrase\u00F1a");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "form", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("ngSubmit", function AuthForgotPasswordV1Component_Template_form_ngSubmit_12_listener() {
          return ctx.onSubmit();
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](13, "div", 10)(14, "label", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](15, "Correo electr\u00F3nico");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](16, "input", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](17, AuthForgotPasswordV1Component_div_17_Template, 3, 2, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](18, "button", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](19, "Enviar enlace");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](20, "p", 15)(21, "a", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](22, "i", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](23, " Atr\u00E1s ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()()()()();
      }

      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate"]("src", ctx.coreConfig.app.appLogoImage, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.coreConfig.app.appName);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("formGroup", ctx.forgotPasswordForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction1"](5, _c0, ctx.submitted && ctx.f.email.errors));
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.submitted && ctx.f.email.errors);
      }
    },
    dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.NgClass, _angular_common__WEBPACK_IMPORTED_MODULE_7__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterLinkWithHref, _angular_forms__WEBPACK_IMPORTED_MODULE_5__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormControlName, _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_9__.DefaultClassDirective, _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_1__.RippleEffectDirective, _core_directives_core_feather_icons_core_feather_icons__WEBPACK_IMPORTED_MODULE_2__.FeatherIconDirective],
    styles: [".auth-wrapper {\n  display: flex;\n  flex-basis: 100%;\n  min-height: 100vh;\n  min-height: calc(var(--vh, 1vh) * 100);\n  width: 100%;\n}\n.auth-wrapper .auth-inner {\n  width: 100%;\n  position: relative;\n}\n.auth-wrapper.auth-v1 {\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n}\n.auth-wrapper.auth-v1 .auth-inner:before {\n  width: 244px;\n  height: 243px;\n  content: \" \";\n  position: absolute;\n  top: -54px;\n  left: -46px;\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPQAAADzCAMAAACG9Mt0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA9KADAAQAAAABAAAA8wAAAADhQHfUAAAAyVBMVEUAAAD///+AgP+AgP9mZv+AgNWAgP9tbf9gYP+AgP9xcf9mZv+AZuaAgP9dXf90dOhiYv92dv9mZu5mZv93d+53d/9paf94afCAcfFrXvJra/9mZvJzZvJzc/JoaP96b/Rqav91aupsYvV2bOt2bPVxaPZ7cfZqavZyau1waPd4aO9xafBxafh4afB1bfh4avFuZ/F2afJzZvJzZ/N0aPN0bvN3bPR0ae5yZ/R3be93bfR1au9zafBxbPVzavV0a/F0a/ZyafFwaPKZm3nTAAAAQ3RSTlMAAQIEBQYGBwgICQoKCgsLDQ0PDw8PERESExMUFBQWFxgYGhoaGxsdHSAgIiIiIyQlJygqLCwtLi8vLzAzNDU3Nzg7h9vbHgAAA9RJREFUeNrt3ftS2kAUx/Fc1gSyWsErtuJdRDQiiteolb7/QzUoTm07k4AzObuu3/MCez45yWbzT36eZ6b8erO1e1B97baadd+zocJWmg0HaXe/+uqmg2GWtkLT5Lle1m9LdhG2+1lvzuiUO1knEF81yFc1N+35m15kZOGodz1vyLx+v2Lseq/erxtZd/NuweCTtfiwaWLOD5FnsqI7+VnP3y8afnEs3Es/1+H1qvETwuq18B7e6VlwLup1ZM8kWWQBOsrmHL7GVtxvYRZYgQ4ywae61ffsqH5Lbq20bQm6ncp9P2ehJegwE/u+rl95ttSwLrVSc2ANetAU28dSa9Cp2E623bUG3d2VWmn/wBq0XCugQYMGLdVKoOJaoiuok1NdXSW1WAUfRPtRUllflaJf5ZE/O9pXVbZUPTov5c+IDqvtRwStdTgLutoxy6GnGfYb2o+1I2gd+1OiqzfLocvVE7TSDqG1mgodaqfQZbvZC9rXjqG1X45WzqFVKVpk0LLo4lGP0ZGD6KgMnTiITkrQgXYQrYNitHISrYrRsZPouBhdcxJdK0YnTqKTYrR2Eq1BgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRoh9DH59ag86ACoSYOL61B55EUQk1s3VqDzsNHhJpYe7QGncfMSHUxaliCHgcKSXVxeWQJehwdJdXF4dAS9DgkTKqLxuibFeiXODixNi7OrEC/BP+JtbE0WrYA/RrxKNfH2YUF6NegSbk+Gk87xtErN6EsWm88fzeMXpwE9EruLns/l42io4dJFLPo2/Po1w+D6IW7t9Bt2SPx3vOOMfS7eHVZtN54ulg2go56138Ct4XRunE2Ovsmjg46WeddUoUWr6WL0fCoIYgO2/2s91fstDZQjcPL0ePt5flpdXUwqW46uMrS1j95JNpQrW0dHp9UV/uT2m416/8HVGg3qzhpBjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KC/FDpx0pwUo2tOomvF6NhJdFyMVk6iVTE6cBIdeF9vJyvZx/I/AzuIjsrQvoNovwzt4FamSs0Ojrp80PmvoB0zh940pb7azf1yg7t0LIt978uppzbnalfucDW92ZndLPRmKweGPduYJ+zoM5/Dk+gD5NdvLhXXPp88qcUqmEH5G5JZRs6cuxwIAAAAAElFTkSuQmCC\");\n}\n@media (max-width: 575.98px) {\n  .auth-wrapper.auth-v1 .auth-inner:before {\n    display: none;\n  }\n}\n.auth-wrapper.auth-v1 .auth-inner:after {\n  width: 272px;\n  height: 272px;\n  content: \" \";\n  position: absolute;\n  bottom: -55px;\n  right: -75px;\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARAAAAEQCAMAAABP1NsnAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABEKADAAQAAAABAAABEAAAAAAQWxS2AAAAwFBMVEUAAAD///+AgICAgP9VVaqqVf+qqv+AgL+AgP9mZsxmZv+ZZv+AgNWAgP9tbdttbf+Sbf+AYN+AgN+AgP9xceNmZv+AZuaAZv90dOh0dP9qav+AauqAav+AgP92dv9tbf+Abe2Abf93Zu53d+6AcO94afCAcfF5a+R5a/JzZuaAZvKAc/J5bed5bfOAaPN6b/R1auqAavR6ZvV6cPV2bOuAbPV7aPZ2be2AbfZ7au17avZ3Zu53b+57a+97a/d4aO9J6CoeAAAAQHRSTlMAAQICAwMDBAQFBQUGBgcHBwgICAkKCgoLCwwMDAwNDg4ODw8QERITExQUFBUVFhcYGBkZGhobHBwdHR4eHx8gJ5uMWwAAA/FJREFUeNrt2G1XEkEYxvHZNk2xHGzdbKFl0cTwgdSkCKzu7/+t4pw6sAjtjIueE/f8r3fMO35nZnbuy5gVGcvfzJe0rnTfGI+MggGJRUZnbpPIhJKt88nU53JnFULvyISY6KAv8vPj0vr2rYwiE2Z2B9J+uNYcyyQxwWZvaeGH3G4bMjsvI/kcwTC/V+7kLoahlITzQojP3ZFgsJCh7IJQzpX0QFj4uMiY18eDMZ9bZCF9OQahnK6cm/Y7js0sh/LF3Auv1PlQd3MxbdXYIQspV44EEEAAAWTNDAYYkKdJbNMsLzYueZbaZ2iM46RVbHBaiZ9Js+nHEdli42N9XuSen5hGp1CQTuOJQDRsD99N4gMSpYWapNH6IJo83CIeILZQFesEaber79NCWRoukOpNEnW0gXQqD81w6ACxhbrYde7VuFCYeA2QRCNIsgZISyNIqz6IyhPjOjNVIFYniK3dmKU6QdLaJUimEySrDZLrBMlrgxRKU7sxCw/EMe0CAggggADySJCqxixIkKpNEh6IozELD8RxjQACCCCAAPJIkKrGLEgQXqqAAEJjxrQLCCCAAEJjRmNGY8a0CwgggABCYwYIfQgggNCYMe0CAggggNCY0ZjRmDHtAgIIIIAAQmNGHwIIIDRmTLuAAAIIIDRmNGY0Zky7gAACCCCA0JjRhwACCI0Z0y4ggAACCI0ZjRmNGdMuIIAAAgggNGb0IYAAQmPGtAsIIIAAQmNGY0ZjxrQLCCCAAAIIjRl9CCCA0Jgx7QICCCCA0JjRmNGYMe0CAggggABCY0YfAgggNGZMu4AAAgggNGY0ZjRmTLuAAAIIIIDQmNGHAAIIjRnTLiCAAAIIjRmNGY0ZIEy7gAACCCA0ZvQhgABCY8a0CwgggABCY0ZjBgiNGdMuIIAAAgiN2f/Sh+Q6PfLaIJlOkKw2SKoTJK3dmFmdILb2tBvrBIlrg5iWRo+WqQ+SaARJ1gCJAzsxThCN16p1vNurGjNjoo42j07kAHFskoY2kEbl33U0ZgoPjXW+Rl0gkarnahqtDaJKxMPDDWIiNafGenh4gExvVhXfmk7Da6L1AVGxSby2h6MxK79Zk42ea1pJbJ48sU2zDezQ8iy1z6BBwoyjMQsvXp8YQAAhgADilRfyy+wf8WqZZUfGZihvgZiB3FybC+kCUU5XLkAo50C+gbBQdUzkAIVyejIAYfFTI1solHP2HgNCnHn5AYNy4jvpoVB6fVzL91cwzLJ9Lfd7S0jhehxO5H5/yePr1W6gHonI7fJ5ORSR/n6Q2yQanq763zuXU5LJZRKiyD/W9/pjkdPZz0/yJ8fqVyry+qQZDMjJKoDfy8bRVhHhQTwAAAAASUVORK5CYII=\");\n  z-index: -1;\n}\n@media (max-width: 575.98px) {\n  .auth-wrapper.auth-v1 .auth-inner:after {\n    display: none;\n  }\n}\n.auth-wrapper.auth-v2 {\n  align-items: flex-start;\n}\n.auth-wrapper.auth-v2 .auth-inner {\n  height: 100vh;\n  overflow-y: auto;\n  height: calc(var(--vh, 1vh) * 100);\n}\n.auth-wrapper.auth-v2 .brand-logo {\n  position: absolute;\n  top: 2rem;\n  left: 2rem;\n  margin: 0;\n  z-index: 1;\n}\n.auth-wrapper.auth-v1 .auth-inner {\n  max-width: 400px;\n}\n.auth-wrapper .brand-logo {\n  display: flex;\n  justify-content: center;\n  margin: 1rem 0 2rem 0;\n}\n.auth-wrapper .brand-logo .brand-text {\n  font-weight: 600;\n}\n.auth-wrapper .auth-footer-btn .btn {\n  padding: 0.6rem !important;\n}\n.auth-wrapper .auth-footer-btn .btn:not(:last-child) {\n  margin-right: 1rem;\n}\n@media (min-width: 1200px) {\n  .auth-wrapper.auth-v2 .auth-card {\n    width: 400px;\n  }\n}\n.auth-wrapper .auth-bg {\n  background-color: #fff;\n}\n.dark-layout .auth-wrapper .auth-bg {\n  background-color: #283046;\n}\n@media (max-height: 625px) {\n  .dark-layout .auth-wrapper .auth-inner {\n    background-color: #283046;\n  }\n  .auth-wrapper .auth-bg {\n    padding-top: 3rem;\n  }\n  .auth-wrapper .auth-inner {\n    background-color: #fff;\n    padding-bottom: 1rem;\n  }\n  .auth-wrapper.auth-v2 .brand-logo {\n    width: 100%;\n    display: flex;\n    justify-content: unset;\n    position: relative;\n    left: 0;\n    padding-left: 1.5rem;\n  }\n}"],
    encapsulation: 2
  });
}

/***/ }),

/***/ 60928:
/*!************************************************************************************!*\
  !*** ./src/app/main/pages/authentication/auth-login-v1/auth-login-v1.component.ts ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AuthLoginV1Component": () => (/* binding */ AuthLoginV1Component)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/forms */ 24006);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs/operators */ 7625);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs */ 8929);
/* harmony import */ var environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! environments/environment */ 92340);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ 94650);
/* harmony import */ var _services_apicore_task_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @services/apicore/task.service */ 46930);
/* harmony import */ var _core_services_config_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @core/services/config.service */ 52553);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/router */ 34793);
/* harmony import */ var _services_seguridad_login_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @services/seguridad/login.service */ 38072);
/* harmony import */ var _services_util_util_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @services/util/util.service */ 34380);
/* harmony import */ var _services_apicore_api_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @services/apicore/api.service */ 89780);
/* harmony import */ var _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/flex-layout/extended */ 24784);
/* harmony import */ var _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @core/directives/core-ripple-effect/core-ripple-effect.directive */ 75287);
/* harmony import */ var _core_directives_core_feather_icons_core_feather_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @core/directives/core-feather-icons/core-feather-icons */ 66279);


















function AuthLoginV1Component_div_0_ng_container_9_div_6_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1, "Usuario es requerido");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }
}

function AuthLoginV1Component_div_0_ng_container_9_div_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, AuthLoginV1Component_div_0_ng_container_9_div_6_div_1_Template, 2, 0, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r7.f.email.errors.required);
  }
}

function AuthLoginV1Component_div_0_ng_container_9_div_19_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1, "contrase\u00F1a es requerida");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }
}

const _c0 = function (a0) {
  return {
    "d-block": a0
  };
};

function AuthLoginV1Component_div_0_ng_container_9_div_19_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, AuthLoginV1Component_div_0_ng_container_9_div_19_div_1_Template, 2, 0, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](2, _c0, ctx_r8.submitted && ctx_r8.f.password.errors));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r8.f.password.errors.required);
  }
}

const _c1 = function (a0) {
  return {
    "is-invalid": a0
  };
};

const _c2 = function (a0) {
  return {
    "is-invalid error": a0
  };
};

const _c3 = function (a0, a1) {
  return {
    "icon-eye-off": a0,
    "icon-eye": a1
  };
};

function AuthLoginV1Component_div_0_ng_container_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "form", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("ngSubmit", function AuthLoginV1Component_div_0_ng_container_9_Template_form_ngSubmit_1_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r12);
      const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r11.login());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div", 18)(3, "label", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4, "Usuario");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](5, "input", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](6, AuthLoginV1Component_div_0_ng_container_9_div_6_Template, 2, 1, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](7, "div", 18)(8, "div", 22)(9, "label", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](10, "Clave");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](11, "a", 24)(12, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](13, "Has olvidado tu contrase\u00F1a?");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](14, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](15, "input", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](16, "div", 27)(17, "span", 28)(18, "i", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AuthLoginV1Component_div_0_ng_container_9_Template_i_click_18_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r12);
      const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r13.togglePasswordTextType());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](19, AuthLoginV1Component_div_0_ng_container_9_div_19_Template, 2, 4, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](20, "div", 18)(21, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](22, "input", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](23, "label", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](24, " Recu\u00E9rdame ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](25, "button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](26, "Iniciar Sesi\u00F3n");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("formGroup", ctx_r4.loginForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](7, _c1, ctx_r4.submitted && ctx_r4.f.email.errors));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r4.submitted && ctx_r4.f.email.errors);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("type", ctx_r4.passwordTextType ? "text" : "password")("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](9, _c2, ctx_r4.submitted && ctx_r4.f.password.errors));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction2"](11, _c3, ctx_r4.passwordTextType, !ctx_r4.passwordTextType));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r4.submitted && ctx_r4.f.password.errors);
  }
}

function AuthLoginV1Component_div_0_ng_container_10_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainer"](0);
  }
}

function AuthLoginV1Component_div_0_ng_container_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, AuthLoginV1Component_div_0_ng_container_10_ng_container_1_Template, 1, 0, "ng-container", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);

    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](3);

    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngTemplateOutlet", _r2);
  }
}

function AuthLoginV1Component_div_0_div_14_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](0, "div", 15);
  }
}

function AuthLoginV1Component_div_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 3)(1, "div", 4)(2, "div", 5)(3, "div", 6)(4, "a", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](5, "img", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](6, "h2", 9)(7, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](8, "Sandra Server");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](9, AuthLoginV1Component_div_0_ng_container_9_Template, 27, 14, "ng-container", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](10, AuthLoginV1Component_div_0_ng_container_10_Template, 2, 1, "ng-container", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](11, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](12, "h1", 12)(13, "span", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](14, AuthLoginV1Component_div_0_div_14_Template, 1, 0, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](15, "div", 15)(16, "p", 16)(17, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](19, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](20, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](21);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](22, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()()()()()();
  }

  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", !ctx_r0.showTotpSection);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r0.showTotpSection);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", !ctx_r0.showTotpSection);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassProp"]("mt-3", ctx_r0.showTotpSection);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate3"](" ", "\u00A9", " ", ctx_r0.coreConfig.app.appName, " ", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind2"](19, 10, ctx_r0.getCurrentDate(), "yyyy"), " - Todos los derechos reservados ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" ", ctx_r0.version, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" Versi\u00F3n: ", ctx_r0.fechaX, " ");
  }
}

const _c4 = function () {
  return {
    standalone: true
  };
};

function AuthLoginV1Component_div_1_ng_container_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "form", 48, 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](3, "br")(4, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "h2", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](6, "Consola");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](7, "input", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("blur", function AuthLoginV1Component_div_1_ng_container_8_Template_input_blur_7_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r19);
      const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r18.onLoginBlur($event));
    })("ngModelChange", function AuthLoginV1Component_div_1_ng_container_8_Template_input_ngModelChange_7_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r19);
      const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r20.usuario = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](8, "input", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("ngModelChange", function AuthLoginV1Component_div_1_ng_container_8_Template_input_ngModelChange_8_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r19);
      const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r21.clave = $event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](9, "div", 53)(10, "button", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AuthLoginV1Component_div_1_ng_container_8_Template_button_click_10_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r19);
      const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r22.loginOpt());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](11, " Ingresar ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](12, "div", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](13, "div", 56)(14, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](15, "div")(16, "p", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](18, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx_r15.usuario)("ngModelOptions", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction0"](6, _c4));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngModel", ctx_r15.clave)("ngModelOptions", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction0"](7, _c4));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" ", ctx_r15.version, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" Versi\u00F3n: ", ctx_r15.fechaX, " ");
  }
}

function AuthLoginV1Component_div_1_ng_container_9_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainer"](0);
  }
}

function AuthLoginV1Component_div_1_ng_container_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, AuthLoginV1Component_div_1_ng_container_9_ng_container_1_Template, 1, 0, "ng-container", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
  }

  if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);

    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](3);

    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngTemplateOutlet", _r2);
  }
}

const _c5 = function (a0) {
  return {
    "width": a0
  };
};

function AuthLoginV1Component_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 38)(1, "div", 39)(2, "div", 40)(3, "div", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](4, "img", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "div", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](6, "Sandra Server");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](7, "div", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](8, AuthLoginV1Component_div_1_ng_container_8_Template, 20, 8, "ng-container", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](9, AuthLoginV1Component_div_1_ng_container_9_Template, 2, 1, "ng-container", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](10, "div", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](11, "div", 46)(12, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
  }

  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngStyle", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction1"](3, _c5, ctx_r1.xWidth));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", !ctx_r1.showTotpSection);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r1.showTotpSection);
  }
}

function AuthLoginV1Component_ng_template_2_p_21_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "p", 78);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1, "C\u00F3digo incorrecto. Int\u00E9ntalo de nuevo.");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }
}

function AuthLoginV1Component_ng_template_2_small_22_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "small", 79);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1, "El c\u00F3digo ingresado es incorrecto. Int\u00E9ntalo de nuevo.");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
  }
}

function AuthLoginV1Component_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r33 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();

    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("keydown.escape", function AuthLoginV1Component_ng_template_2_Template_div_keydown_escape_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);
      const ctx_r32 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r32.goBackToLogin());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](1, "span", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "h4", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](3, "Verificaci\u00F3n de Dos Pasos");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "p", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](5, " Abre tu aplicaci\u00F3n de autenticaci\u00F3n (ej. Google Authenticator) e ingresa el c\u00F3digo de 6 d\u00EDgitos. ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](6, "div", 62)(7, "div", 63)(8, "input", 64, 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("input", function AuthLoginV1Component_ng_template_2_Template_input_input_8_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r25 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](11);

      const ctx_r34 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r34.onInput($event, _r25));
    })("keydown", function AuthLoginV1Component_ng_template_2_Template_input_keydown_8_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);
      const ctx_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r35.onKeydown($event, null));
    })("paste", function AuthLoginV1Component_ng_template_2_Template_input_paste_8_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);
      const ctx_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r36.onPaste($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](10, "input", 66, 67);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("input", function AuthLoginV1Component_ng_template_2_Template_input_input_10_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r26 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](13);

      const ctx_r37 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r37.onInput($event, _r26));
    })("keydown", function AuthLoginV1Component_ng_template_2_Template_input_keydown_10_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r24 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](9);

      const ctx_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r38.onKeydown($event, _r24));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](12, "input", 66, 68);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("input", function AuthLoginV1Component_ng_template_2_Template_input_input_12_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r27 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](16);

      const ctx_r39 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r39.onInput($event, _r27));
    })("keydown", function AuthLoginV1Component_ng_template_2_Template_input_keydown_12_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r25 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](11);

      const ctx_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r40.onKeydown($event, _r25));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](14, "span", 69);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](15, "input", 66, 70);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("input", function AuthLoginV1Component_ng_template_2_Template_input_input_15_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r28 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](18);

      const ctx_r41 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r41.onInput($event, _r28));
    })("keydown", function AuthLoginV1Component_ng_template_2_Template_input_keydown_15_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r26 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](13);

      const ctx_r42 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r42.onKeydown($event, _r26));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](17, "input", 66, 71);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("input", function AuthLoginV1Component_ng_template_2_Template_input_input_17_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r29 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](20);

      const ctx_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r43.onInput($event, _r29));
    })("keydown", function AuthLoginV1Component_ng_template_2_Template_input_keydown_17_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r27 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](16);

      const ctx_r44 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r44.onKeydown($event, _r27));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](19, "input", 66, 72);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("input", function AuthLoginV1Component_ng_template_2_Template_input_input_19_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);
      const ctx_r45 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r45.onInput($event, null));
    })("keydown", function AuthLoginV1Component_ng_template_2_Template_input_keydown_19_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);

      const _r28 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵreference"](18);

      const ctx_r46 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r46.onKeydown($event, _r28));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](21, AuthLoginV1Component_ng_template_2_p_21_Template, 2, 0, "p", 73);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](22, AuthLoginV1Component_ng_template_2_small_22_Template, 2, 0, "small", 74);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](23, "div", 75)(24, "a", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AuthLoginV1Component_ng_template_2_Template_a_click_24_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r33);
      const ctx_r47 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵresetView"](ctx_r47.goBackToLogin());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](25, "i", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](26, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](27, "Volver al inicio de sesi\u00F3n");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]()()()();
  }

  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("size", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassProp"]("shake", ctx_r3.isOtpInvalid);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r3.isOtpInvalid);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r3.isOtpInvalid);
  }
}

class AuthLoginV1Component {
  taskService;
  _coreConfigService;
  _formBuilder;
  router;
  loginService;
  utilservice;
  apiService;
  document;
  token; //  Public

  fechafinal;
  fechaX;
  build;
  coreConfig;
  loginForm;
  submitted = false;
  passwordTextType;
  usuario;
  clave;
  loading = false;
  isHidden = true;
  iToken = {
    token: ""
  };
  itk;
  bdv = true; // Private

  _unsubscribeAll;
  showTotpSection = false;
  otp = new Array(6).fill('');
  isOtpInvalid = false;
  tempAuthToken = ''; // To store the token from the first login step

  xWidth = '660px';
  version = "1.0.0";
  fecha = "";
  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   */

  constructor(taskService, // private recaptchaV3Service: ReCaptchaV3Service,
  _coreConfigService, _formBuilder, router, loginService, // private toastrService: ToastrService,
  utilservice, apiService, document) {
    this.taskService = taskService;
    this._coreConfigService = _coreConfigService;
    this._formBuilder = _formBuilder;
    this.router = router;
    this.loginService = loginService;
    this.utilservice = utilservice;
    this.apiService = apiService;
    this.document = document;
    this.bdv = true;

    if (sessionStorage.getItem("token") != undefined) {
      this.router.navigate(["home"]);
    }

    this._unsubscribeAll = new rxjs__WEBPACK_IMPORTED_MODULE_9__.Subject(); // Configure the layout

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
    this.bdv = this.apiService.ConsultaSistemaBDV();
  } // convenience getter for easy access to form fields


  get f() {
    return this.loginForm.controls;
  }
  /**
   * Toggle password
   */


  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }
  /**
   * On init
   */


  ngOnInit() {
    this.getCurrentDate();
    this.fechafinal = environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.buildDateTime;
    this.fechaX = this.utilservice.FechaMoment(environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.buildDateTime);
    this.build = this.utilservice.FechaMomentL(environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.buildDateTime).replace(/\//g, '.');
    this.version = environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.version;
    this.loginForm = this._formBuilder.group({
      email: ["", [_angular_forms__WEBPACK_IMPORTED_MODULE_10__.Validators.required]],
      password: ["", _angular_forms__WEBPACK_IMPORTED_MODULE_10__.Validators.required]
    }); // Subscribe to config changes

    this._coreConfigService.config.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_11__.takeUntil)(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  getCurrentDate() {
    return new Date(); // or format as you prefer
  }

  login() {
    this.submitted = true; // stop here if form is invalid

    if (this.loginForm.invalid) {
      return;
    } else {
      this.loading = true;
      this.loginService.getLogin(this.loginForm.value.email, this.loginForm.value.password).subscribe(itk => {
        // Find this part in your login() or loginOpt() method
        this.loading = false;
        this.isHidden = false;
        let tk = this.loginService.getUserDecrypt(itk.token);

        if (tk.Usuario.token !== undefined && tk.Usuario.token !== null) {
          this.showTotpSection = true;
          this.tempAuthToken = itk.token; // Store the temporary token
        } else {
          // No 2FA, proceed with normal login
          this.loginService.Iniciar(itk.token);
        }
      }, er => {
        this.loading = false;
        this.isHidden = false;
        this.utilservice.AlertMini("top-end", "error", er.error.msj || "Error al acceder al sistema", 3000);
      });
    }
  }
  /**
   * On destroy
   */


  ngOnDestroy() {
    this._unsubscribeAll.next();

    this._unsubscribeAll.complete();
  }

  loginOpt() {
    this.xWidth = '660px';
    this.loading = true;
    this.loginService.getLogin(this.usuario, this.clave).subscribe(itk => {
      this.loading = false;
      this.isHidden = false;
      let tk = this.loginService.getUserDecrypt(itk.token);
      this.tempAuthToken = itk.token;

      if (tk.Usuario.token !== undefined && tk.Usuario.token !== null) {
        // 2FA is required, show the TOTP section
        this.xWidth = '840px';
        this.showTotpSection = true;
      } else {
        // No 2FA, proceed with normal login
        this.loginService.Iniciar(this.tempAuthToken);
      }
    }, er => {
      this.loading = false;
      this.isHidden = false;
      this.utilservice.AlertMini("top-end", "error", er.error.msj || "Error al acceder al sistema", 3000);
    });
  }

  onLoginBlur() {
    if (this.bdv && this.usuario) {
      const prefix = this.usuario.substring(0, 2).toUpperCase();

      if (prefix === 'NM' || prefix === 'CT') {
        this.usuario = this.usuario.toUpperCase();
      }
    }
  }
  /**
   * Handles the paste event on the OTP inputs.
   * @param event The clipboard event.
   */


  onPaste(event) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').trim(); // Check if pasted data is a 6-digit number

    if (pastedData && /^[0-9]{6}$/.test(pastedData)) {
      const inputs = Array.from(document.querySelectorAll('.otp-box'));
      const digits = pastedData.split('');
      inputs.forEach((input, index) => {
        if (digits[index]) {
          input.value = digits[index];
        }
      }); // Focus the last input and trigger verification

      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
        this.checkAndVerify();
      }
    }
  }
  /**
   * Navigates back to the username/password login view.
   */


  goBackToLogin() {
    this.showTotpSection = false;
    this.tempAuthToken = '';
    this.isOtpInvalid = false;
    this.otp = new Array(6).fill('');
    this.xWidth = '660px'; // Also clear the actual input fields in the DOM

    const inputs = document.querySelectorAll('.otp-box');
    inputs.forEach(i => i.value = ''); // Optionally, focus the username/email field again

    const emailInput = this.document.querySelector('#login-email');

    if (emailInput) {
      emailInput.focus();
    }
  }

  onInput(event, nextInput) {
    const input = event.target;
    const value = input.value; // Limpiar si no es número

    if (!/^[0-9]$/.test(value)) {
      input.value = '';
      return;
    } // Mover al siguiente si hay valor


    if (value && nextInput) {
      nextInput.focus();
    }

    this.checkAndVerify();
  }

  onKeydown(event, prevInput) {
    const input = event.target;

    if (event.key === 'Backspace') {
      if (!input.value && prevInput) {
        prevInput.focus(); // Opcional: borrar el valor del anterior al retroceder
        // prevInput.value = ''; 
      }
    }
  }

  checkAndVerify() {
    // Obtenemos todos los valores directamente del DOM para máxima precisión
    const inputs = Array.from(document.querySelectorAll('.otp-box'));
    const code = inputs.map(i => i.value).join('');

    if (code.length === 6) {
      this.otp = code.split(''); // Sincronizamos con tu lógica existente

      this.Continuar();
    }
  } // Modifica tu handleOtpError para limpiar los inputs físicos


  handleOtpError(alertMessage = 'Código incorrecto') {
    this.isOtpInvalid = true;
    const inputs = document.querySelectorAll('.otp-box');
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
    inputs.forEach(i => i.value = ''); // Usamos setTimeout para asegurar que el foco se aplique después de que Angular
    // haya actualizado la vista y aplicado la clase 'shake'.

    setTimeout(() => inputs[0]?.focus(), 0); // Quitar la clase de animación después de 500ms para poder repetirla

    setTimeout(() => this.isOtpInvalid = false, 500);
    setTimeout(() => this.isOtpInvalid = false, 500);
    this.utilservice.AlertMini('top-end', 'error', alertMessage, 4000);
  }
  /**
   * Validates the completed OTP code with the backend.
   */


  Continuar() {
    const otpCode = this.otp.join('');

    if (otpCode.length !== 6 || this.loading) {
      // Evita re-entrada si ya está cargando
      return;
    }

    this.loading = true; // Mostrar spinner mientras valida

    this.apiService.Validar_TOTP(otpCode, this.tempAuthToken).subscribe(data => {
      this.loading = false;

      if (data.msj === 'Ok') {
        this.apiService.MultipleSesion(this.tempAuthToken).subscribe(xdata => {
          console.log(xdata);

          if (xdata.msj === 'Ok') {
            this.loginService.Iniciar(this.tempAuthToken);
          } else if (xdata.tipo == 99) {
            this.handleOtpError(xdata.msj);
            this.goBackToLogin();
          } else {
            this.handleOtpError('Error al validar el código. Consulta al administrador');
          }
        }, error => {});
      } else {
        this.handleOtpError('Error de validacion');
      }
    }, e => {
      this.loading = false;
      console.info(e.error.msj);
      let xdata = e.error;

      if (xdata.tipo == 99) {
        this.handleOtpError(xdata.msj);
        this.goBackToLogin();
      } else {
        this.handleOtpError('Error al validar el código. Inténtelo de nuevo.');
      }
    });
  }

  static ɵfac = function AuthLoginV1Component_Factory(t) {
    return new (t || AuthLoginV1Component)(_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_services_apicore_task_service__WEBPACK_IMPORTED_MODULE_1__.TaskService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_core_services_config_service__WEBPACK_IMPORTED_MODULE_2__.CoreConfigService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_10__.UntypedFormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_12__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_services_seguridad_login_service__WEBPACK_IMPORTED_MODULE_3__.LoginService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_services_util_util_service__WEBPACK_IMPORTED_MODULE_4__.UtilService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_services_apicore_api_service__WEBPACK_IMPORTED_MODULE_5__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdirectiveInject"](_angular_common__WEBPACK_IMPORTED_MODULE_13__.DOCUMENT));
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdefineComponent"]({
    type: AuthLoginV1Component,
    selectors: [["app-auth-login-v1"]],
    decls: 4,
    vars: 2,
    consts: [["class", "login__heading auth-wrapper auth-v1 px-2", 4, "ngIf"], ["class", "page", 4, "ngIf"], ["totpSection", ""], [1, "login__heading", "auth-wrapper", "auth-v1", "px-2"], [1, "auth-inner", "py-2"], [1, "card", "mb-0"], [1, "card-body"], ["href", "javascript:void(0);", 1, "brand-logo"], ["src", "/assets/images/logo/sandra.png", "alt", "brand-logo", "height", "80"], [1, "mb-1", "text-center", 2, "margin-top", "-20px"], [4, "ngIf"], [1, "login"], [1, "login__heading"], [1, "login__circuit-mask"], ["class", "divider my-2", 4, "ngIf"], [1, "divider", "my-2"], [1, "card-text", "text-center"], [1, "auth-login-form", "mt-2", 3, "formGroup", "ngSubmit"], [1, "form-group"], ["for", "login-email", 1, "form-label"], ["type", "text", "formControlName", "email", "placeholder", "Usuario", "aria-describedby", "login-email", "tabindex", "1", "autofocus", "", 1, "form-control", 3, "ngClass"], ["class", "invalid-feedback", 4, "ngIf"], [1, "d-flex", "justify-content-between"], ["for", "login-password"], ["routerLink", "/authentication/forgot-password-v1"], [1, "input-group", "input-group-merge", "form-password-toggle"], ["formControlName", "password", "tabindex", "2", "placeholder", "\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7", "aria-describedby", "login-password", 1, "form-control", "form-control-merge", 3, "type", "ngClass"], [1, "input-group-append"], [1, "input-group-text", "cursor-pointer"], [1, "feather", "font-small-4", 3, "ngClass", "click"], ["class", "invalid-feedback", 3, "ngClass", 4, "ngIf"], [1, "custom-control", "custom-checkbox"], ["type", "checkbox", "id", "remember-me", "tabindex", "3", 1, "custom-control-input"], ["for", "remember-me", 1, "custom-control-label"], ["tabindex", "4", "rippleEffect", "", 1, "btn", "btn-primary", "btn-block"], [1, "invalid-feedback"], [1, "invalid-feedback", 3, "ngClass"], [4, "ngTemplateOutlet"], [1, "page"], [1, "border-0", "contenedor", 3, "ngStyle"], [1, "left"], [1, "loginx"], ["src", "assets/images/bdv/bdv.png", "alt", "LogoBDV"], [1, "titulo"], [1, "right"], [1, "row", "mt-5", 2, "width", "50%"], [1, "col-6"], [1, "col-6", "text-right"], ["role", "form", 1, "xform"], ["form", "ngForm"], [1, "titulo", 2, "text-transform", "uppercase", "margin-bottom", "0"], ["type", "text", "id", "usuario", "name", "usuario", "maxlength", "12", "placeholder", "Usuario (*)", "autocomplete", "off", 1, "xinput", 3, "ngModel", "ngModelOptions", "blur", "ngModelChange"], ["type", "password", "name", "clave", "id", "clave", "placeholder", "Contrase\u00F1a (*)", "required", "", 1, "xinput", 3, "ngModel", "ngModelOptions", "ngModelChange"], [1, "row", 2, "margin-top", ".5rem"], ["type", "submit", "id", "submit", 1, "xbutton", "primary", 2, "margin-right", ".5rem", "height", "30px", "font-size", "13px", 3, "click"], [1, "row"], [1, "separador", 2, "margin-top", "20px"], [2, "color", "#494949", "font-size", "11px", "text-align", "center"], [1, "totp-container", "text-center", 3, "keydown.escape"], ["data-feather", "shield", 1, "mb-2", "text-primary", 3, "size"], [1, "mb-1", "font-weight-bolder"], [1, "card-text", "mb-2", 2, "color", "#5d5d5d", "padding", "5px"], [1, "otp-container"], [1, "otp-wrapper"], ["type", "tel", "maxlength", "1", 1, "otp-box", 3, "input", "keydown", "paste"], ["otp0", ""], ["type", "tel", "maxlength", "1", 1, "otp-box", 3, "input", "keydown"], ["otp1", ""], ["otp2", ""], [1, "otp-divider"], ["otp3", ""], ["otp4", ""], ["otp5", ""], ["class", "error-text", 4, "ngIf"], ["class", "text-danger mt-1 d-block", 4, "ngIf"], [1, "mt-3"], ["href", "javascript:void(0);", 3, "click"], [1, "feather", "icon-chevron-left", "mr-25"], [1, "error-text"], [1, "text-danger", "mt-1", "d-block"]],
    template: function AuthLoginV1Component_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](0, AuthLoginV1Component_div_0_Template, 24, 13, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, AuthLoginV1Component_div_1_Template, 13, 5, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](2, AuthLoginV1Component_ng_template_2_Template, 28, 5, "ng-template", null, 2, _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplateRefExtractor"]);
      }

      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", !ctx.bdv);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx.bdv);
      }
    },
    dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_13__.NgClass, _angular_common__WEBPACK_IMPORTED_MODULE_13__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_13__.NgTemplateOutlet, _angular_common__WEBPACK_IMPORTED_MODULE_13__.NgStyle, _angular_router__WEBPACK_IMPORTED_MODULE_12__.RouterLinkWithHref, _angular_forms__WEBPACK_IMPORTED_MODULE_10__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_10__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.RequiredValidator, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.MaxLengthValidator, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.NgModel, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.NgForm, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.FormControlName, _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_14__.DefaultClassDirective, _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_14__.DefaultStyleDirective, _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_6__.RippleEffectDirective, _core_directives_core_feather_icons_core_feather_icons__WEBPACK_IMPORTED_MODULE_7__.FeatherIconDirective, _angular_common__WEBPACK_IMPORTED_MODULE_13__.DatePipe],
    styles: [".auth-wrapper {\n  display: flex;\n  flex-basis: 100%;\n  min-height: 100vh;\n  min-height: calc(var(--vh, 1vh) * 100);\n  width: 100%;\n}\n.auth-wrapper .auth-inner {\n  width: 100%;\n  position: relative;\n}\n.auth-wrapper.auth-v1 {\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n}\n.auth-wrapper.auth-v1 .auth-inner:before {\n  width: 244px;\n  height: 243px;\n  content: \" \";\n  position: absolute;\n  top: -54px;\n  left: -46px;\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPQAAADzCAMAAACG9Mt0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA9KADAAQAAAABAAAA8wAAAADhQHfUAAAAyVBMVEUAAAD///+AgP+AgP9mZv+AgNWAgP9tbf9gYP+AgP9xcf9mZv+AZuaAgP9dXf90dOhiYv92dv9mZu5mZv93d+53d/9paf94afCAcfFrXvJra/9mZvJzZvJzc/JoaP96b/Rqav91aupsYvV2bOt2bPVxaPZ7cfZqavZyau1waPd4aO9xafBxafh4afB1bfh4avFuZ/F2afJzZvJzZ/N0aPN0bvN3bPR0ae5yZ/R3be93bfR1au9zafBxbPVzavV0a/F0a/ZyafFwaPKZm3nTAAAAQ3RSTlMAAQIEBQYGBwgICQoKCgsLDQ0PDw8PERESExMUFBQWFxgYGhoaGxsdHSAgIiIiIyQlJygqLCwtLi8vLzAzNDU3Nzg7h9vbHgAAA9RJREFUeNrt3ftS2kAUx/Fc1gSyWsErtuJdRDQiiteolb7/QzUoTm07k4AzObuu3/MCez45yWbzT36eZ6b8erO1e1B97baadd+zocJWmg0HaXe/+uqmg2GWtkLT5Lle1m9LdhG2+1lvzuiUO1knEF81yFc1N+35m15kZOGodz1vyLx+v2Lseq/erxtZd/NuweCTtfiwaWLOD5FnsqI7+VnP3y8afnEs3Es/1+H1qvETwuq18B7e6VlwLup1ZM8kWWQBOsrmHL7GVtxvYRZYgQ4ywae61ffsqH5Lbq20bQm6ncp9P2ehJegwE/u+rl95ttSwLrVSc2ANetAU28dSa9Cp2E623bUG3d2VWmn/wBq0XCugQYMGLdVKoOJaoiuok1NdXSW1WAUfRPtRUllflaJf5ZE/O9pXVbZUPTov5c+IDqvtRwStdTgLutoxy6GnGfYb2o+1I2gd+1OiqzfLocvVE7TSDqG1mgodaqfQZbvZC9rXjqG1X45WzqFVKVpk0LLo4lGP0ZGD6KgMnTiITkrQgXYQrYNitHISrYrRsZPouBhdcxJdK0YnTqKTYrR2Eq1BgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRoh9DH59ag86ACoSYOL61B55EUQk1s3VqDzsNHhJpYe7QGncfMSHUxaliCHgcKSXVxeWQJehwdJdXF4dAS9DgkTKqLxuibFeiXODixNi7OrEC/BP+JtbE0WrYA/RrxKNfH2YUF6NegSbk+Gk87xtErN6EsWm88fzeMXpwE9EruLns/l42io4dJFLPo2/Po1w+D6IW7t9Bt2SPx3vOOMfS7eHVZtN54ulg2go56138Ct4XRunE2Ovsmjg46WeddUoUWr6WL0fCoIYgO2/2s91fstDZQjcPL0ePt5flpdXUwqW46uMrS1j95JNpQrW0dHp9UV/uT2m416/8HVGg3qzhpBjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KC/FDpx0pwUo2tOomvF6NhJdFyMVk6iVTE6cBIdeF9vJyvZx/I/AzuIjsrQvoNovwzt4FamSs0Ojrp80PmvoB0zh940pb7azf1yg7t0LIt978uppzbnalfucDW92ZndLPRmKweGPduYJ+zoM5/Dk+gD5NdvLhXXPp88qcUqmEH5G5JZRs6cuxwIAAAAAElFTkSuQmCC\");\n}\n@media (max-width: 575.98px) {\n  .auth-wrapper.auth-v1 .auth-inner:before {\n    display: none;\n  }\n}\n.auth-wrapper.auth-v1 .auth-inner:after {\n  width: 272px;\n  height: 272px;\n  content: \" \";\n  position: absolute;\n  bottom: -55px;\n  right: -75px;\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARAAAAEQCAMAAABP1NsnAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABEKADAAQAAAABAAABEAAAAAAQWxS2AAAAwFBMVEUAAAD///+AgICAgP9VVaqqVf+qqv+AgL+AgP9mZsxmZv+ZZv+AgNWAgP9tbdttbf+Sbf+AYN+AgN+AgP9xceNmZv+AZuaAZv90dOh0dP9qav+AauqAav+AgP92dv9tbf+Abe2Abf93Zu53d+6AcO94afCAcfF5a+R5a/JzZuaAZvKAc/J5bed5bfOAaPN6b/R1auqAavR6ZvV6cPV2bOuAbPV7aPZ2be2AbfZ7au17avZ3Zu53b+57a+97a/d4aO9J6CoeAAAAQHRSTlMAAQICAwMDBAQFBQUGBgcHBwgICAkKCgoLCwwMDAwNDg4ODw8QERITExQUFBUVFhcYGBkZGhobHBwdHR4eHx8gJ5uMWwAAA/FJREFUeNrt2G1XEkEYxvHZNk2xHGzdbKFl0cTwgdSkCKzu7/+t4pw6sAjtjIueE/f8r3fMO35nZnbuy5gVGcvfzJe0rnTfGI+MggGJRUZnbpPIhJKt88nU53JnFULvyISY6KAv8vPj0vr2rYwiE2Z2B9J+uNYcyyQxwWZvaeGH3G4bMjsvI/kcwTC/V+7kLoahlITzQojP3ZFgsJCh7IJQzpX0QFj4uMiY18eDMZ9bZCF9OQahnK6cm/Y7js0sh/LF3Auv1PlQd3MxbdXYIQspV44EEEAAAWTNDAYYkKdJbNMsLzYueZbaZ2iM46RVbHBaiZ9Js+nHEdli42N9XuSen5hGp1CQTuOJQDRsD99N4gMSpYWapNH6IJo83CIeILZQFesEaber79NCWRoukOpNEnW0gXQqD81w6ACxhbrYde7VuFCYeA2QRCNIsgZISyNIqz6IyhPjOjNVIFYniK3dmKU6QdLaJUimEySrDZLrBMlrgxRKU7sxCw/EMe0CAggggADySJCqxixIkKpNEh6IozELD8RxjQACCCCAAPJIkKrGLEgQXqqAAEJjxrQLCCCAAEJjRmNGY8a0CwgggABCYwYIfQgggNCYMe0CAggggNCY0ZjRmDHtAgIIIIAAQmNGHwIIIDRmTLuAAAIIIDRmNGY0Zky7gAACCCCA0JjRhwACCI0Z0y4ggAACCI0ZjRmNGdMuIIAAAgggNGb0IYAAQmPGtAsIIIAAQmNGY0ZjxrQLCCCAAAIIjRl9CCCA0Jgx7QICCCCA0JjRmNGYMe0CAggggABCY0YfAgggNGZMu4AAAgggNGY0ZjRmTLuAAAIIIIDQmNGHAAIIjRnTLiCAAAIIjRmNGY0ZIEy7gAACCCA0ZvQhgABCY8a0CwgggABCY0ZjBgiNGdMuIIAAAgiN2f/Sh+Q6PfLaIJlOkKw2SKoTJK3dmFmdILb2tBvrBIlrg5iWRo+WqQ+SaARJ1gCJAzsxThCN16p1vNurGjNjoo42j07kAHFskoY2kEbl33U0ZgoPjXW+Rl0gkarnahqtDaJKxMPDDWIiNafGenh4gExvVhXfmk7Da6L1AVGxSby2h6MxK79Zk42ea1pJbJ48sU2zDezQ8iy1z6BBwoyjMQsvXp8YQAAhgADilRfyy+wf8WqZZUfGZihvgZiB3FybC+kCUU5XLkAo50C+gbBQdUzkAIVyejIAYfFTI1solHP2HgNCnHn5AYNy4jvpoVB6fVzL91cwzLJ9Lfd7S0jhehxO5H5/yePr1W6gHonI7fJ5ORSR/n6Q2yQanq763zuXU5LJZRKiyD/W9/pjkdPZz0/yJ8fqVyry+qQZDMjJKoDfy8bRVhHhQTwAAAAASUVORK5CYII=\");\n  z-index: -1;\n}\n@media (max-width: 575.98px) {\n  .auth-wrapper.auth-v1 .auth-inner:after {\n    display: none;\n  }\n}\n.auth-wrapper.auth-v2 {\n  align-items: flex-start;\n}\n.auth-wrapper.auth-v2 .auth-inner {\n  height: 100vh;\n  overflow-y: auto;\n  height: calc(var(--vh, 1vh) * 100);\n}\n.auth-wrapper.auth-v2 .brand-logo {\n  position: absolute;\n  top: 2rem;\n  left: 2rem;\n  margin: 0;\n  z-index: 1;\n}\n.auth-wrapper.auth-v1 .auth-inner {\n  max-width: 400px;\n}\n.auth-wrapper .brand-logo {\n  display: flex;\n  justify-content: center;\n  margin: 1rem 0 2rem 0;\n}\n.auth-wrapper .brand-logo .brand-text {\n  font-weight: 600;\n}\n.auth-wrapper .auth-footer-btn .btn {\n  padding: 0.6rem !important;\n}\n.auth-wrapper .auth-footer-btn .btn:not(:last-child) {\n  margin-right: 1rem;\n}\n@media (min-width: 1200px) {\n  .auth-wrapper.auth-v2 .auth-card {\n    width: 400px;\n  }\n}\n.auth-wrapper .auth-bg {\n  background-color: #fff;\n}\n.dark-layout .auth-wrapper .auth-bg {\n  background-color: #283046;\n}\n@media (max-height: 625px) {\n  .dark-layout .auth-wrapper .auth-inner {\n    background-color: #283046;\n  }\n  .auth-wrapper .auth-bg {\n    padding-top: 3rem;\n  }\n  .auth-wrapper .auth-inner {\n    background-color: #fff;\n    padding-bottom: 1rem;\n  }\n  .auth-wrapper.auth-v2 .brand-logo {\n    width: 100%;\n    display: flex;\n    justify-content: unset;\n    position: relative;\n    left: 0;\n    padding-left: 1.5rem;\n  }\n}\n.login:before,\n.login__circuit-mask {\n  content: \"\";\n  position: absolute;\n  z-index: -1;\n  top: 48%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  display: block;\n  width: 700px;\n  height: 700px;\n}\n.login:before {\n  background: url(/assets/circuito/bg-circuito.svg);\n}\n.login__circuit-mask {\n  display: grid;\n  place-items: center;\n  mask: url(/assets/circuito/bg-circuito.svg);\n}\n.login__circuit-mask:before {\n  content: \"\";\n  position: absolute;\n  width: 100px;\n  height: 100px;\n  border-radius: 50%;\n  border: 3px solid #00f0ff;\n  animation: onda 4s infinite;\n  animation-delay: 2s;\n}\n@keyframes onda {\n  0% {\n    transform: scale(1);\n  }\n  50% {\n    transform: scale(10);\n  }\n  100% {\n    transform: scale(10);\n  }\n}\n.page {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  place-content: center;\n  width: 100%;\n  align-items: start;\n  justify-content: center;\n  padding-left: 4rem;\n  background-image: url(\"/assets/images/bdv/background-login.png\") !important;\n  background-repeat: no-repeat !important;\n  background-position: center;\n  background-attachment: fixed;\n  background-size: cover;\n  background-color: #ECECEC;\n}\n@media (max-width: 767px) {\n  .page {\n    align-items: center;\n    height: auto;\n    margin-bottom: 20px;\n    padding-bottom: 20px;\n    padding: 0;\n  }\n}\n.contenedor {\n  display: flex;\n  min-height: 320px;\n  width: 640px;\n  padding: 5px;\n}\n@media (max-width: 767px) {\n  body {\n    overflow-y: hidden !important;\n  }\n  .contenedor {\n    flex-direction: column;\n    height: 630px;\n    width: 320px;\n    margin: 0 auto;\n  }\n}\n.left {\n  /*   background: #DB0032; */\n  height: calc(100% - 40px);\n  top: 26px;\n  position: relative;\n  width: 45%;\n  color: #3d3d3d;\n  background-image: url(\"/assets/images/bdv/left.png\");\n  background-color: #fff;\n  background-size: 13.25rem;\n  box-shadow: -4px 4px 40px 16px rgba(0, 0, 0, 0.22);\n  background-position: bottom;\n  background-repeat: no-repeat;\n  border-radius: 10px 0 0 10px;\n}\n@media (max-width: 767px) {\n  .left {\n    height: 100%;\n    left: 20px;\n    width: calc(100% - 40px);\n    max-height: 270px;\n    border-radius: 10px 10px 0 0;\n  }\n}\n.loginx {\n  font-size: 50px;\n  /*   font-weight: 900; */\n  margin: 20px 40px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.loginx img {\n  width: 75%;\n  margin: 0 auto;\n}\n.eula {\n  color: #3b3b3b;\n  font-size: 14px;\n  line-height: 1.5;\n  /*   margin: 40px; */\n}\n.subtitulo {\n  text-align: center;\n  /*     font-style: italic; */\n  font-size: 18px;\n  font-weight: 500;\n  font-family: \"Trebuchet MS\", \"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Arial, sans-serif, \"Source Sans Pro\" !important;\n}\n.titulo {\n  font-size: 22px;\n  color: #0067b1;\n  margin-top: 5px;\n  font-family: \"Trebuchet MS\", \"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Arial, sans-serif, \"Source Sans Pro\" !important;\n  text-align: center;\n  font-weight: 700;\n}\n.right {\n  background: #fdfdff;\n  box-shadow: 8px 0px 40px 16px rgba(0, 0, 0, 0.22);\n  color: #f1f1f2;\n  position: relative;\n  width: 55%;\n  height: 102% !important;\n  border-radius: 0 10px 10px 0;\n}\n@media (max-width: 767px) {\n  .right {\n    flex-shrink: 0;\n    height: 100%;\n    width: 100%;\n    max-height: 350px;\n    border-radius: 10px;\n  }\n}\n.xform {\n  position: absolute;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1rem;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  padding: 20px 45px;\n}\n.xinput {\n  border-radius: 5px;\n  width: 100%;\n  padding: 5px 10px;\n  border: 1px solid #d8d4d4;\n  color: #5a5757;\n  font-family: \"Trebuchet MS\", \"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Arial, sans-serif, \"Source Sans Pro\" !important;\n}\n.xbutton.primary {\n  background-color: #0067b1;\n  color: #fff;\n  border: none;\n  border-radius: 5px;\n  padding: 2px 28px;\n  font-size: 11px;\n  font-weight: 400;\n  transition: 0.3s ease-in-out all;\n}\n.primary:hover {\n  background-color: #025fa1;\n  transition: 0.3s ease-in-out all;\n}\n.xbutton.outline {\n  background-color: #fff;\n  border: 2px solid #0067b1;\n  color: #0067b1;\n  border-radius: 5px;\n  padding: 2px 28px;\n  font-size: 11px;\n  font-weight: 400;\n  transition: 0.1s ease-in-out all;\n}\n.outline:hover {\n  background-color: #025fa1;\n  color: #fff;\n  transition: 0.2s ease-in-out all;\n}\n.separador {\n  background-color: #e9e9e9;\n  height: 1px;\n  width: 100%;\n}\n.forgive {\n  color: #4A96D2;\n  text-decoration: underline;\n  -webkit-text-decoration-color: #4A96D2;\n          text-decoration-color: #4A96D2;\n  font-size: 11px;\n}\n.totp-container {\n  padding: 1rem 0;\n  animation: fadeIn 0.5s ease-in-out;\n  font-family: \"Trebuchet MS\", \"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Arial, sans-serif, \"Source Sans Pro\" !important;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n    transform: translateY(10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n.otp-input-group {\n  position: relative;\n  display: flex;\n  gap: 0.5rem;\n  justify-content: center;\n  margin-top: 1.5rem;\n}\n.otp-input {\n  width: 45px;\n  height: 55px;\n  text-align: center;\n  font-size: 1.75rem;\n  font-weight: 600;\n  border: 1px solid #d8d6de;\n  border-radius: 0.357rem;\n  transition: all 0.2s ease-in-out;\n  -moz-appearance: textfield;\n}\n.otp-input::-webkit-outer-spin-button, .otp-input::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.otp-input:focus {\n  border-color: #7367f0;\n  box-shadow: 0 3px 10px 0 rgba(115, 103, 240, 0.3);\n  transform: translateY(-2px);\n}\n.otp-separator {\n  display: flex;\n  align-items: center;\n  font-size: 1.5rem;\n  color: #b9b9c3;\n  margin: 0 0.25rem;\n}\n.invalid-otp .otp-input {\n  border-color: #ea5455 !important;\n  animation: shake 0.5s;\n}\n@keyframes shake {\n  10%, 90% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20%, 80% {\n    transform: translate3d(2px, 0, 0);\n  }\n  30%, 50%, 70% {\n    transform: translate3d(-4px, 0, 0);\n  }\n  40%, 60% {\n    transform: translate3d(4px, 0, 0);\n  }\n}\n.page .xform .otp-input {\n  height: 50px;\n  background-color: #f0f0f0;\n  border: 1px solid #ccc;\n  font-size: 1.5rem;\n  color: #333;\n}\n.page .xform .otp-input:focus {\n  background-color: #fff;\n  border-color: #7367f0;\n  box-shadow: 0 3px 10px 0 rgba(115, 103, 240, 0.3);\n}\n.page .xform .invalid-otp .otp-input {\n  border-color: #c00 !important;\n}\n.otp-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1.5rem;\n}\n.otp-container .otp-wrapper {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.otp-container .otp-box {\n  width: 45px;\n  height: 55px;\n  text-align: center;\n  font-size: 1.5rem;\n  font-weight: bold;\n  border: 2px solid #e0e0e0;\n  border-radius: 8px;\n  background: #f9f9f9;\n  transition: all 0.2s ease;\n  outline: none;\n}\n.otp-container .otp-box:focus {\n  border-color: #7367f0;\n  box-shadow: 0 0 8px rgba(115, 103, 240, 0.4);\n  background: white;\n  transform: translateY(-2px);\n}\n.otp-container .otp-divider {\n  width: 12px;\n  height: 2px;\n  background: #d0d0d0;\n  margin: 0 5px;\n}\n.otp-container.shake {\n  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;\n}\n.otp-container.shake .otp-box {\n  border-color: #ea5455;\n}\n@keyframes shake {\n  10%, 90% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20%, 80% {\n    transform: translate3d(2px, 0, 0);\n  }\n  30%, 50%, 70% {\n    transform: translate3d(-4px, 0, 0);\n  }\n  40%, 60% {\n    transform: translate3d(4px, 0, 0);\n  }\n}\n.error-text {\n  color: #ea5455;\n  font-size: 0.85rem;\n  margin-top: 10px;\n}"],
    encapsulation: 2
  });
}

/***/ }),

/***/ 56436:
/*!******************************************************************************************!*\
  !*** ./src/app/main/pages/authentication/auth-register-v1/auth-register-v1.component.ts ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AuthRegisterV1Component": () => (/* binding */ AuthRegisterV1Component)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/forms */ 24006);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/operators */ 7625);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ 8929);
/* harmony import */ var environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! environments/environment */ 92340);
/* harmony import */ var _services_apicore_api_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @services/apicore/api.service */ 89780);
/* harmony import */ var _services_seguridad_login_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @services/seguridad/login.service */ 38072);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 94650);
/* harmony import */ var _core_services_config_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @core/services/config.service */ 52553);
/* harmony import */ var _services_util_util_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @services/util/util.service */ 34380);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/router */ 34793);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/flex-layout/extended */ 24784);
/* harmony import */ var _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @core/directives/core-ripple-effect/core-ripple-effect.directive */ 75287);

















function AuthRegisterV1Component_div_14_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1, "Usuario es requerido");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
}

function AuthRegisterV1Component_div_14_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, AuthRegisterV1Component_div_14_div_1_Template, 2, 0, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx_r0.f.user.errors.required);
  }
}

function AuthRegisterV1Component_div_23_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1, "Contrase\u00F1a es requerido");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
}

const _c0 = function (a0) {
  return {
    "d-block": a0
  };
};

function AuthRegisterV1Component_div_23_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, AuthRegisterV1Component_div_23_div_1_Template, 2, 0, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](2, _c0, ctx_r1.submitted && ctx_r1.f.password.errors));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx_r1.f.password.errors.required);
  }
}

const _c1 = function (a0) {
  return {
    "is-invalid": a0
  };
};

const _c2 = function (a0) {
  return {
    "is-invalid error": a0
  };
};

const _c3 = function (a0, a1) {
  return {
    "icon-eye-off": a0,
    "icon-eye": a1
  };
};

class AuthRegisterV1Component {
  _coreConfigService;
  _formBuilder;
  utilservice;
  apiService;
  loginService;
  router; // Public

  coreConfig;
  passwordTextType;
  registerForm;
  submitted = false;
  version;
  fecha;
  xUser = {
    _id: undefined,
    cedula: '',
    nombre: '',
    login: '',
    correo: '',
    clave: '',
    sucursal: '',
    direccion: '',
    cargo: '',
    telefono: '',
    sistema: '',
    token: '',
    Perfil: undefined,
    Aplicacion: [],
    firmadigital: undefined
  }; // Private

  _unsubscribeAll;
  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   */

  constructor(_coreConfigService, _formBuilder, utilservice, apiService, loginService, router) {
    this._coreConfigService = _coreConfigService;
    this._formBuilder = _formBuilder;
    this.utilservice = utilservice;
    this.apiService = apiService;
    this.loginService = loginService;
    this.router = router;
    this._unsubscribeAll = new rxjs__WEBPACK_IMPORTED_MODULE_7__.Subject(); // Configure the layout

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  } // convenience getter for easy access to form fields


  get f() {
    return this.registerForm.controls;
  }
  /**
   * Toggle password
   */


  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }
  /**
   * On Submit
   */


  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    } else {
      // this.xUser.login = this.registerForm.value.user
      // this.xUser.clave = this.registerForm.value.password
      // var obj = {
      //   "coleccion": "usuario",
      //   "objeto": this.xUser,
      //   "donde": `{\"id\":\"${this.registerForm.value.id}\"}`,
      //   "driver": "MGDBA",
      //   "upsert": true
      // }
      this.loginService.getCrear(this.registerForm.value.user, this.registerForm.value.clave).subscribe(data => {
        this.router.navigate(['/']);
        this.utilservice.AlertMini('top-end', 'success', `Usuario creado exitosamente!`, 3000);
      }, error => {
        this.utilservice.AlertMini('top-end', 'error', 'Error al Guardadar los Datos', 3000);
      });
    }
  } // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */


  ngOnInit() {
    // const hash = CryptoJS.SHA256('za7896321').toString();
    // console.log(hash);
    this.version = environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.version;
    this.fecha = environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.fecha;
    this.registerForm = this._formBuilder.group({
      user: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]],
      password: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_8__.Validators.required]
    }); // Subscribe to config changes

    this._coreConfigService.config.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_9__.takeUntil)(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }
  /**
   * On destroy
   */


  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();

    this._unsubscribeAll.complete();
  }

  static ɵfac = function AuthRegisterV1Component_Factory(t) {
    return new (t || AuthRegisterV1Component)(_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_core_services_config_service__WEBPACK_IMPORTED_MODULE_3__.CoreConfigService), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_8__.UntypedFormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_util_util_service__WEBPACK_IMPORTED_MODULE_4__.UtilService), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_apicore_api_service__WEBPACK_IMPORTED_MODULE_1__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_seguridad_login_service__WEBPACK_IMPORTED_MODULE_2__.LoginService), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_10__.Router));
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineComponent"]({
    type: AuthRegisterV1Component,
    selectors: [["app-auth-register-v1"]],
    decls: 43,
    vars: 16,
    consts: [[1, "auth-wrapper", "auth-v1", "px-2"], [1, "auth-inner", "py-2"], [1, "card", "mb-0"], [1, "card-body"], ["href", "javascript:void(0);", 1, "brand-logo"], ["src", "/assets/images/logo/sandra.png", "alt", "brand-logo", "height", "90"], [1, "mb-1", "text-center", 2, "margin-top", "-20px", "color", "rgb(61, 15, 103)"], [1, "auth-register-form", "mt-2", 3, "formGroup", "ngSubmit"], [1, "form-group"], ["for", "register-email", 1, "form-label"], ["type", "text", "formControlName", "user", "placeholder", "Ingrese nombre de usuario", "aria-describedby", "register-email", "tabindex", "2", 1, "form-control", 3, "ngClass"], ["class", "invalid-feedback", 4, "ngIf"], ["for", "register-password", 1, "form-label"], [1, "input-group", "input-group-merge", "form-password-toggle"], ["formControlName", "password", "placeholder", "\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7", "aria-describedby", "register-password", "tabindex", "3", 1, "form-control", "form-control-merge", 3, "type", "ngClass"], [1, "input-group-append"], [1, "input-group-text", "cursor-pointer"], [1, "feather", "font-small-4", 3, "ngClass", "click"], ["class", "invalid-feedback", 3, "ngClass", 4, "ngIf"], ["href", "javascript:void(0);"], ["tabindex", "5", "rippleEffect", "", 1, "btn", "btn-primary", "btn-block"], [1, "login"], [1, "login__heading"], [1, "login__circuit-mask"], [1, "text-center", "mt-2"], ["routerLink", "/"], [1, "card-text", "text-center"], [1, "invalid-feedback"], [4, "ngIf"], [1, "invalid-feedback", 3, "ngClass"]],
    template: function AuthRegisterV1Component_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "a", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](5, "img", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "h2", 6)(7, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](8, "Sandra Server");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](9, "form", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("ngSubmit", function AuthRegisterV1Component_Template_form_ngSubmit_9_listener() {
          return ctx.onSubmit();
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "div", 8)(11, "label", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](12, "Nombre de Usuario");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](13, "input", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](14, AuthRegisterV1Component_div_14_Template, 2, 1, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](15, "div", 8)(16, "label", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](17, "Contrase\u00F1a");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](18, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](19, "input", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](20, "div", 15)(21, "span", 16)(22, "i", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function AuthRegisterV1Component_Template_i_click_22_listener() {
          return ctx.togglePasswordTextType();
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](23, AuthRegisterV1Component_div_23_Template, 2, 4, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "div", 8)(25, "a", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](26, "Pol\u00EDtica de Privacidad y los T\u00E9rminos.");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "button", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](28, "Crear cuenta");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](29, "div", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](30, "h1", 22)(31, "span", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](32, "p", 24)(33, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](34, "Ya tienes una cuenta? ");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](35, "a", 25)(36, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](37, " Inicia sesi\u00F3n");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](38, "p", 26)(39, "small");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](40);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](41, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](42);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()()()();
      }

      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("formGroup", ctx.registerForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](9, _c1, ctx.submitted && ctx.f.user.errors));
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.submitted && ctx.f.user.errors);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("type", ctx.passwordTextType ? "text" : "password")("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](11, _c2, ctx.submitted && ctx.f.password.errors));
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction2"](13, _c3, ctx.passwordTextType, !ctx.passwordTextType));
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.submitted && ctx.f.password.errors);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](17);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("Broglie ", ctx.version, " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx.fecha, "");
      }
    },
    dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_11__.NgClass, _angular_common__WEBPACK_IMPORTED_MODULE_11__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_10__.RouterLinkWithHref, _angular_forms__WEBPACK_IMPORTED_MODULE_8__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_8__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControlName, _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_12__.DefaultClassDirective, _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_5__.RippleEffectDirective],
    styles: [".auth-wrapper {\n  display: flex;\n  flex-basis: 100%;\n  min-height: 100vh;\n  min-height: calc(var(--vh, 1vh) * 100);\n  width: 100%;\n}\n.auth-wrapper .auth-inner {\n  width: 100%;\n  position: relative;\n}\n.auth-wrapper.auth-v1 {\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n}\n.auth-wrapper.auth-v1 .auth-inner:before {\n  width: 244px;\n  height: 243px;\n  content: \" \";\n  position: absolute;\n  top: -54px;\n  left: -46px;\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPQAAADzCAMAAACG9Mt0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA9KADAAQAAAABAAAA8wAAAADhQHfUAAAAyVBMVEUAAAD///+AgP+AgP9mZv+AgNWAgP9tbf9gYP+AgP9xcf9mZv+AZuaAgP9dXf90dOhiYv92dv9mZu5mZv93d+53d/9paf94afCAcfFrXvJra/9mZvJzZvJzc/JoaP96b/Rqav91aupsYvV2bOt2bPVxaPZ7cfZqavZyau1waPd4aO9xafBxafh4afB1bfh4avFuZ/F2afJzZvJzZ/N0aPN0bvN3bPR0ae5yZ/R3be93bfR1au9zafBxbPVzavV0a/F0a/ZyafFwaPKZm3nTAAAAQ3RSTlMAAQIEBQYGBwgICQoKCgsLDQ0PDw8PERESExMUFBQWFxgYGhoaGxsdHSAgIiIiIyQlJygqLCwtLi8vLzAzNDU3Nzg7h9vbHgAAA9RJREFUeNrt3ftS2kAUx/Fc1gSyWsErtuJdRDQiiteolb7/QzUoTm07k4AzObuu3/MCez45yWbzT36eZ6b8erO1e1B97baadd+zocJWmg0HaXe/+uqmg2GWtkLT5Lle1m9LdhG2+1lvzuiUO1knEF81yFc1N+35m15kZOGodz1vyLx+v2Lseq/erxtZd/NuweCTtfiwaWLOD5FnsqI7+VnP3y8afnEs3Es/1+H1qvETwuq18B7e6VlwLup1ZM8kWWQBOsrmHL7GVtxvYRZYgQ4ywae61ffsqH5Lbq20bQm6ncp9P2ehJegwE/u+rl95ttSwLrVSc2ANetAU28dSa9Cp2E623bUG3d2VWmn/wBq0XCugQYMGLdVKoOJaoiuok1NdXSW1WAUfRPtRUllflaJf5ZE/O9pXVbZUPTov5c+IDqvtRwStdTgLutoxy6GnGfYb2o+1I2gd+1OiqzfLocvVE7TSDqG1mgodaqfQZbvZC9rXjqG1X45WzqFVKVpk0LLo4lGP0ZGD6KgMnTiITkrQgXYQrYNitHISrYrRsZPouBhdcxJdK0YnTqKTYrR2Eq1BgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRoh9DH59ag86ACoSYOL61B55EUQk1s3VqDzsNHhJpYe7QGncfMSHUxaliCHgcKSXVxeWQJehwdJdXF4dAS9DgkTKqLxuibFeiXODixNi7OrEC/BP+JtbE0WrYA/RrxKNfH2YUF6NegSbk+Gk87xtErN6EsWm88fzeMXpwE9EruLns/l42io4dJFLPo2/Po1w+D6IW7t9Bt2SPx3vOOMfS7eHVZtN54ulg2go56138Ct4XRunE2Ovsmjg46WeddUoUWr6WL0fCoIYgO2/2s91fstDZQjcPL0ePt5flpdXUwqW46uMrS1j95JNpQrW0dHp9UV/uT2m416/8HVGg3qzhpBjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KC/FDpx0pwUo2tOomvF6NhJdFyMVk6iVTE6cBIdeF9vJyvZx/I/AzuIjsrQvoNovwzt4FamSs0Ojrp80PmvoB0zh940pb7azf1yg7t0LIt978uppzbnalfucDW92ZndLPRmKweGPduYJ+zoM5/Dk+gD5NdvLhXXPp88qcUqmEH5G5JZRs6cuxwIAAAAAElFTkSuQmCC\");\n}\n@media (max-width: 575.98px) {\n  .auth-wrapper.auth-v1 .auth-inner:before {\n    display: none;\n  }\n}\n.auth-wrapper.auth-v1 .auth-inner:after {\n  width: 272px;\n  height: 272px;\n  content: \" \";\n  position: absolute;\n  bottom: -55px;\n  right: -75px;\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARAAAAEQCAMAAABP1NsnAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABEKADAAQAAAABAAABEAAAAAAQWxS2AAAAwFBMVEUAAAD///+AgICAgP9VVaqqVf+qqv+AgL+AgP9mZsxmZv+ZZv+AgNWAgP9tbdttbf+Sbf+AYN+AgN+AgP9xceNmZv+AZuaAZv90dOh0dP9qav+AauqAav+AgP92dv9tbf+Abe2Abf93Zu53d+6AcO94afCAcfF5a+R5a/JzZuaAZvKAc/J5bed5bfOAaPN6b/R1auqAavR6ZvV6cPV2bOuAbPV7aPZ2be2AbfZ7au17avZ3Zu53b+57a+97a/d4aO9J6CoeAAAAQHRSTlMAAQICAwMDBAQFBQUGBgcHBwgICAkKCgoLCwwMDAwNDg4ODw8QERITExQUFBUVFhcYGBkZGhobHBwdHR4eHx8gJ5uMWwAAA/FJREFUeNrt2G1XEkEYxvHZNk2xHGzdbKFl0cTwgdSkCKzu7/+t4pw6sAjtjIueE/f8r3fMO35nZnbuy5gVGcvfzJe0rnTfGI+MggGJRUZnbpPIhJKt88nU53JnFULvyISY6KAv8vPj0vr2rYwiE2Z2B9J+uNYcyyQxwWZvaeGH3G4bMjsvI/kcwTC/V+7kLoahlITzQojP3ZFgsJCh7IJQzpX0QFj4uMiY18eDMZ9bZCF9OQahnK6cm/Y7js0sh/LF3Auv1PlQd3MxbdXYIQspV44EEEAAAWTNDAYYkKdJbNMsLzYueZbaZ2iM46RVbHBaiZ9Js+nHEdli42N9XuSen5hGp1CQTuOJQDRsD99N4gMSpYWapNH6IJo83CIeILZQFesEaber79NCWRoukOpNEnW0gXQqD81w6ACxhbrYde7VuFCYeA2QRCNIsgZISyNIqz6IyhPjOjNVIFYniK3dmKU6QdLaJUimEySrDZLrBMlrgxRKU7sxCw/EMe0CAggggADySJCqxixIkKpNEh6IozELD8RxjQACCCCAAPJIkKrGLEgQXqqAAEJjxrQLCCCAAEJjRmNGY8a0CwgggABCYwYIfQgggNCYMe0CAggggNCY0ZjRmDHtAgIIIIAAQmNGHwIIIDRmTLuAAAIIIDRmNGY0Zky7gAACCCCA0JjRhwACCI0Z0y4ggAACCI0ZjRmNGdMuIIAAAgggNGb0IYAAQmPGtAsIIIAAQmNGY0ZjxrQLCCCAAAIIjRl9CCCA0Jgx7QICCCCA0JjRmNGYMe0CAggggABCY0YfAgggNGZMu4AAAgggNGY0ZjRmTLuAAAIIIIDQmNGHAAIIjRnTLiCAAAIIjRmNGY0ZIEy7gAACCCA0ZvQhgABCY8a0CwgggABCY0ZjBgiNGdMuIIAAAgiN2f/Sh+Q6PfLaIJlOkKw2SKoTJK3dmFmdILb2tBvrBIlrg5iWRo+WqQ+SaARJ1gCJAzsxThCN16p1vNurGjNjoo42j07kAHFskoY2kEbl33U0ZgoPjXW+Rl0gkarnahqtDaJKxMPDDWIiNafGenh4gExvVhXfmk7Da6L1AVGxSby2h6MxK79Zk42ea1pJbJ48sU2zDezQ8iy1z6BBwoyjMQsvXp8YQAAhgADilRfyy+wf8WqZZUfGZihvgZiB3FybC+kCUU5XLkAo50C+gbBQdUzkAIVyejIAYfFTI1solHP2HgNCnHn5AYNy4jvpoVB6fVzL91cwzLJ9Lfd7S0jhehxO5H5/yePr1W6gHonI7fJ5ORSR/n6Q2yQanq763zuXU5LJZRKiyD/W9/pjkdPZz0/yJ8fqVyry+qQZDMjJKoDfy8bRVhHhQTwAAAAASUVORK5CYII=\");\n  z-index: -1;\n}\n@media (max-width: 575.98px) {\n  .auth-wrapper.auth-v1 .auth-inner:after {\n    display: none;\n  }\n}\n.auth-wrapper.auth-v2 {\n  align-items: flex-start;\n}\n.auth-wrapper.auth-v2 .auth-inner {\n  height: 100vh;\n  overflow-y: auto;\n  height: calc(var(--vh, 1vh) * 100);\n}\n.auth-wrapper.auth-v2 .brand-logo {\n  position: absolute;\n  top: 2rem;\n  left: 2rem;\n  margin: 0;\n  z-index: 1;\n}\n.auth-wrapper.auth-v1 .auth-inner {\n  max-width: 400px;\n}\n.auth-wrapper .brand-logo {\n  display: flex;\n  justify-content: center;\n  margin: 1rem 0 2rem 0;\n}\n.auth-wrapper .brand-logo .brand-text {\n  font-weight: 600;\n}\n.auth-wrapper .auth-footer-btn .btn {\n  padding: 0.6rem !important;\n}\n.auth-wrapper .auth-footer-btn .btn:not(:last-child) {\n  margin-right: 1rem;\n}\n@media (min-width: 1200px) {\n  .auth-wrapper.auth-v2 .auth-card {\n    width: 400px;\n  }\n}\n.auth-wrapper .auth-bg {\n  background-color: #fff;\n}\n.dark-layout .auth-wrapper .auth-bg {\n  background-color: #283046;\n}\n@media (max-height: 625px) {\n  .dark-layout .auth-wrapper .auth-inner {\n    background-color: #283046;\n  }\n  .auth-wrapper .auth-bg {\n    padding-top: 3rem;\n  }\n  .auth-wrapper .auth-inner {\n    background-color: #fff;\n    padding-bottom: 1rem;\n  }\n  .auth-wrapper.auth-v2 .brand-logo {\n    width: 100%;\n    display: flex;\n    justify-content: unset;\n    position: relative;\n    left: 0;\n    padding-left: 1.5rem;\n  }\n}\n.login:before,\n.login__circuit-mask {\n  content: \"\";\n  position: absolute;\n  z-index: -1;\n  top: 48%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  display: block;\n  width: 700px;\n  height: 700px;\n}\n.login:before {\n  background: url(/assets/circuito/bg-circuito.svg);\n}\n.login__circuit-mask {\n  display: grid;\n  place-items: center;\n  mask: url(/assets/circuito/bg-circuito.svg);\n}\n.login__circuit-mask:before {\n  content: \"\";\n  position: absolute;\n  width: 100px;\n  height: 100px;\n  border-radius: 50%;\n  border: 3px solid #00f0ff;\n  animation: onda 4s infinite;\n  animation-delay: 2s;\n}\n@keyframes onda {\n  0% {\n    transform: scale(1);\n  }\n  50% {\n    transform: scale(10);\n  }\n  100% {\n    transform: scale(10);\n  }\n}"],
    encapsulation: 2
  });
}

/***/ }),

/***/ 10667:
/*!******************************************************************************************************!*\
  !*** ./src/app/main/pages/authentication/auth-reset-password-v1/auth-reset-password-v1.component.ts ***!
  \******************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AuthResetPasswordV1Component": () => (/* binding */ AuthResetPasswordV1Component)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 24006);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ 7625);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 8929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 94650);
/* harmony import */ var _core_services_config_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @core/services/config.service */ 52553);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 34793);
/* harmony import */ var _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/flex-layout/extended */ 24784);
/* harmony import */ var _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @core/directives/core-ripple-effect/core-ripple-effect.directive */ 75287);
/* harmony import */ var _core_directives_core_feather_icons_core_feather_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @core/directives/core-feather-icons/core-feather-icons */ 66279);












function AuthResetPasswordV1Component_div_22_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Password is required");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}

const _c0 = function (a0) {
  return {
    "d-block": a0
  };
};

function AuthResetPasswordV1Component_div_22_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, AuthResetPasswordV1Component_div_22_div_1_Template, 2, 0, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction1"](2, _c0, ctx_r0.submitted && ctx_r0.f.newPassword.errors));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r0.f.newPassword.errors.required);
  }
}

function AuthResetPasswordV1Component_div_32_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Password is required");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}

function AuthResetPasswordV1Component_div_32_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, AuthResetPasswordV1Component_div_32_div_1_Template, 2, 0, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }

  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction1"](2, _c0, ctx_r1.submitted && ctx_r1.f.confirmPassword.errors));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r1.f.confirmPassword.errors.required);
  }
}

const _c1 = function (a0) {
  return {
    "is-invalid error": a0
  };
};

const _c2 = function (a0, a1) {
  return {
    "icon-eye-off": a0,
    "icon-eye": a1
  };
};

class AuthResetPasswordV1Component {
  _coreConfigService;
  _formBuilder; // Public

  coreConfig;
  passwordTextType;
  confPasswordTextType;
  resetPasswordForm;
  submitted = false; // Private

  _unsubscribeAll;
  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   */

  constructor(_coreConfigService, _formBuilder) {
    this._coreConfigService = _coreConfigService;
    this._formBuilder = _formBuilder;
    this._unsubscribeAll = new rxjs__WEBPACK_IMPORTED_MODULE_4__.Subject(); // Configure the layout

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  } // convenience getter for easy access to form fields


  get f() {
    return this.resetPasswordForm.controls;
  }
  /**
   * Toggle password
   */


  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }
  /**
   * Toggle confirm password
   */


  toggleConfPasswordTextType() {
    this.confPasswordTextType = !this.confPasswordTextType;
  }
  /**
   * On Submit
   */


  onSubmit() {
    this.submitted = true; // stop here if form is invalid

    if (this.resetPasswordForm.invalid) {
      return;
    }
  } // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */


  ngOnInit() {
    this.resetPasswordForm = this._formBuilder.group({
      newPassword: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required]],
      confirmPassword: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required]]
    }); // Subscribe to config changes

    this._coreConfigService.config.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.takeUntil)(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }
  /**
   * On destroy
   */


  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();

    this._unsubscribeAll.complete();
  }

  static ɵfac = function AuthResetPasswordV1Component_Factory(t) {
    return new (t || AuthResetPasswordV1Component)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_core_services_config_service__WEBPACK_IMPORTED_MODULE_0__.CoreConfigService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_5__.UntypedFormBuilder));
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
    type: AuthResetPasswordV1Component,
    selectors: [["app-auth-reset-password-v1"]],
    decls: 39,
    vars: 21,
    consts: [[1, "auth-wrapper", "auth-v1", "px-2"], [1, "auth-inner", "py-2"], [1, "card", "mb-0"], [1, "card-body"], ["href", "javascript:void(0);", 1, "brand-logo"], ["alt", "brand-logo", "height", "28", 3, "src"], [1, "brand-text", "text-primary", "ml-1"], [1, "card-title", "mb-1"], [1, "card-text", "mb-2"], [1, "auth-reset-password-form", "mt-2", 3, "formGroup", "ngSubmit"], [1, "form-group"], [1, "d-flex", "justify-content-between"], ["for", "reset-password-new"], [1, "input-group", "input-group-merge", "form-password-toggle"], ["formControlName", "newPassword", "placeholder", "\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7", "aria-describedby", "reset-password-new", "tabindex", "1", "autofocus", "", 1, "form-control", "form-control-merge", 3, "type", "ngClass"], [1, "input-group-append"], [1, "input-group-text", "cursor-pointer"], [1, "feather", "font-small-4", 3, "ngClass", "click"], ["class", "invalid-feedback", 3, "ngClass", 4, "ngIf"], ["for", "reset-password-confirm"], ["formControlName", "confirmPassword", "placeholder", "\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7\u00B7", "aria-describedby", "reset-password-confirm", "tabindex", "2", 1, "form-control", "form-control-merge", 3, "type", "ngClass"], ["tabindex", "3", "rippleEffect", "", 1, "btn", "btn-primary", "btn-block"], [1, "text-center", "mt-2"], ["routerLink", "/"], ["data-feather", "chevron-left", 1, "mb-25"], [1, "invalid-feedback", 3, "ngClass"], [4, "ngIf"]],
    template: function AuthResetPasswordV1Component_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "a", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](5, "img", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "h2", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "h4", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](9, "Reset Password \uD83D\uDD12");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](10, "p", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](11, "Your new password must be different from previously used passwords");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "form", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("ngSubmit", function AuthResetPasswordV1Component_Template_form_ngSubmit_12_listener() {
          return ctx.onSubmit();
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](13, "div", 10)(14, "div", 11)(15, "label", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](16, "New Password");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](17, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](18, "input", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](19, "div", 15)(20, "span", 16)(21, "i", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AuthResetPasswordV1Component_Template_i_click_21_listener() {
          return ctx.togglePasswordTextType();
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](22, AuthResetPasswordV1Component_div_22_Template, 2, 4, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](23, "div", 10)(24, "div", 11)(25, "label", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](26, "Confirm Password");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](27, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](28, "input", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](29, "div", 15)(30, "span", 16)(31, "i", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AuthResetPasswordV1Component_Template_i_click_31_listener() {
          return ctx.toggleConfPasswordTextType();
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](32, AuthResetPasswordV1Component_div_32_Template, 2, 4, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](33, "button", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](34, "Set New Password");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](35, "p", 22)(36, "a", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](37, "i", 24);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](38, " Back to login ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()()()()();
      }

      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate"]("src", ctx.coreConfig.app.appLogoImage, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.coreConfig.app.appName);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("formGroup", ctx.resetPasswordForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("type", ctx.passwordTextType ? "text" : "password")("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction1"](11, _c1, ctx.submitted && ctx.f.newPassword.errors));
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction2"](13, _c2, ctx.passwordTextType, !ctx.passwordTextType));
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.submitted && ctx.f.newPassword.errors);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("type", ctx.confPasswordTextType ? "text" : "password")("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction1"](16, _c1, ctx.submitted && ctx.f.confirmPassword.errors));
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction2"](18, _c2, ctx.confPasswordTextType, !ctx.confPasswordTextType));
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.submitted && ctx.f.confirmPassword.errors);
      }
    },
    dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.NgClass, _angular_common__WEBPACK_IMPORTED_MODULE_7__.NgIf, _angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterLinkWithHref, _angular_forms__WEBPACK_IMPORTED_MODULE_5__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormControlName, _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_9__.DefaultClassDirective, _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_1__.RippleEffectDirective, _core_directives_core_feather_icons_core_feather_icons__WEBPACK_IMPORTED_MODULE_2__.FeatherIconDirective],
    styles: [".auth-wrapper {\n  display: flex;\n  flex-basis: 100%;\n  min-height: 100vh;\n  min-height: calc(var(--vh, 1vh) * 100);\n  width: 100%;\n}\n.auth-wrapper .auth-inner {\n  width: 100%;\n  position: relative;\n}\n.auth-wrapper.auth-v1 {\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n}\n.auth-wrapper.auth-v1 .auth-inner:before {\n  width: 244px;\n  height: 243px;\n  content: \" \";\n  position: absolute;\n  top: -54px;\n  left: -46px;\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPQAAADzCAMAAACG9Mt0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA9KADAAQAAAABAAAA8wAAAADhQHfUAAAAyVBMVEUAAAD///+AgP+AgP9mZv+AgNWAgP9tbf9gYP+AgP9xcf9mZv+AZuaAgP9dXf90dOhiYv92dv9mZu5mZv93d+53d/9paf94afCAcfFrXvJra/9mZvJzZvJzc/JoaP96b/Rqav91aupsYvV2bOt2bPVxaPZ7cfZqavZyau1waPd4aO9xafBxafh4afB1bfh4avFuZ/F2afJzZvJzZ/N0aPN0bvN3bPR0ae5yZ/R3be93bfR1au9zafBxbPVzavV0a/F0a/ZyafFwaPKZm3nTAAAAQ3RSTlMAAQIEBQYGBwgICQoKCgsLDQ0PDw8PERESExMUFBQWFxgYGhoaGxsdHSAgIiIiIyQlJygqLCwtLi8vLzAzNDU3Nzg7h9vbHgAAA9RJREFUeNrt3ftS2kAUx/Fc1gSyWsErtuJdRDQiiteolb7/QzUoTm07k4AzObuu3/MCez45yWbzT36eZ6b8erO1e1B97baadd+zocJWmg0HaXe/+uqmg2GWtkLT5Lle1m9LdhG2+1lvzuiUO1knEF81yFc1N+35m15kZOGodz1vyLx+v2Lseq/erxtZd/NuweCTtfiwaWLOD5FnsqI7+VnP3y8afnEs3Es/1+H1qvETwuq18B7e6VlwLup1ZM8kWWQBOsrmHL7GVtxvYRZYgQ4ywae61ffsqH5Lbq20bQm6ncp9P2ehJegwE/u+rl95ttSwLrVSc2ANetAU28dSa9Cp2E623bUG3d2VWmn/wBq0XCugQYMGLdVKoOJaoiuok1NdXSW1WAUfRPtRUllflaJf5ZE/O9pXVbZUPTov5c+IDqvtRwStdTgLutoxy6GnGfYb2o+1I2gd+1OiqzfLocvVE7TSDqG1mgodaqfQZbvZC9rXjqG1X45WzqFVKVpk0LLo4lGP0ZGD6KgMnTiITkrQgXYQrYNitHISrYrRsZPouBhdcxJdK0YnTqKTYrR2Eq1BgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRoh9DH59ag86ACoSYOL61B55EUQk1s3VqDzsNHhJpYe7QGncfMSHUxaliCHgcKSXVxeWQJehwdJdXF4dAS9DgkTKqLxuibFeiXODixNi7OrEC/BP+JtbE0WrYA/RrxKNfH2YUF6NegSbk+Gk87xtErN6EsWm88fzeMXpwE9EruLns/l42io4dJFLPo2/Po1w+D6IW7t9Bt2SPx3vOOMfS7eHVZtN54ulg2go56138Ct4XRunE2Ovsmjg46WeddUoUWr6WL0fCoIYgO2/2s91fstDZQjcPL0ePt5flpdXUwqW46uMrS1j95JNpQrW0dHp9UV/uT2m416/8HVGg3qzhpBjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KBBgwYNGjRo0KC/FDpx0pwUo2tOomvF6NhJdFyMVk6iVTE6cBIdeF9vJyvZx/I/AzuIjsrQvoNovwzt4FamSs0Ojrp80PmvoB0zh940pb7azf1yg7t0LIt978uppzbnalfucDW92ZndLPRmKweGPduYJ+zoM5/Dk+gD5NdvLhXXPp88qcUqmEH5G5JZRs6cuxwIAAAAAElFTkSuQmCC\");\n}\n@media (max-width: 575.98px) {\n  .auth-wrapper.auth-v1 .auth-inner:before {\n    display: none;\n  }\n}\n.auth-wrapper.auth-v1 .auth-inner:after {\n  width: 272px;\n  height: 272px;\n  content: \" \";\n  position: absolute;\n  bottom: -55px;\n  right: -75px;\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARAAAAEQCAMAAABP1NsnAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABEKADAAQAAAABAAABEAAAAAAQWxS2AAAAwFBMVEUAAAD///+AgICAgP9VVaqqVf+qqv+AgL+AgP9mZsxmZv+ZZv+AgNWAgP9tbdttbf+Sbf+AYN+AgN+AgP9xceNmZv+AZuaAZv90dOh0dP9qav+AauqAav+AgP92dv9tbf+Abe2Abf93Zu53d+6AcO94afCAcfF5a+R5a/JzZuaAZvKAc/J5bed5bfOAaPN6b/R1auqAavR6ZvV6cPV2bOuAbPV7aPZ2be2AbfZ7au17avZ3Zu53b+57a+97a/d4aO9J6CoeAAAAQHRSTlMAAQICAwMDBAQFBQUGBgcHBwgICAkKCgoLCwwMDAwNDg4ODw8QERITExQUFBUVFhcYGBkZGhobHBwdHR4eHx8gJ5uMWwAAA/FJREFUeNrt2G1XEkEYxvHZNk2xHGzdbKFl0cTwgdSkCKzu7/+t4pw6sAjtjIueE/f8r3fMO35nZnbuy5gVGcvfzJe0rnTfGI+MggGJRUZnbpPIhJKt88nU53JnFULvyISY6KAv8vPj0vr2rYwiE2Z2B9J+uNYcyyQxwWZvaeGH3G4bMjsvI/kcwTC/V+7kLoahlITzQojP3ZFgsJCh7IJQzpX0QFj4uMiY18eDMZ9bZCF9OQahnK6cm/Y7js0sh/LF3Auv1PlQd3MxbdXYIQspV44EEEAAAWTNDAYYkKdJbNMsLzYueZbaZ2iM46RVbHBaiZ9Js+nHEdli42N9XuSen5hGp1CQTuOJQDRsD99N4gMSpYWapNH6IJo83CIeILZQFesEaber79NCWRoukOpNEnW0gXQqD81w6ACxhbrYde7VuFCYeA2QRCNIsgZISyNIqz6IyhPjOjNVIFYniK3dmKU6QdLaJUimEySrDZLrBMlrgxRKU7sxCw/EMe0CAggggADySJCqxixIkKpNEh6IozELD8RxjQACCCCAAPJIkKrGLEgQXqqAAEJjxrQLCCCAAEJjRmNGY8a0CwgggABCYwYIfQgggNCYMe0CAggggNCY0ZjRmDHtAgIIIIAAQmNGHwIIIDRmTLuAAAIIIDRmNGY0Zky7gAACCCCA0JjRhwACCI0Z0y4ggAACCI0ZjRmNGdMuIIAAAgggNGb0IYAAQmPGtAsIIIAAQmNGY0ZjxrQLCCCAAAIIjRl9CCCA0Jgx7QICCCCA0JjRmNGYMe0CAggggABCY0YfAgggNGZMu4AAAgggNGY0ZjRmTLuAAAIIIIDQmNGHAAIIjRnTLiCAAAIIjRmNGY0ZIEy7gAACCCA0ZvQhgABCY8a0CwgggABCY0ZjBgiNGdMuIIAAAgiN2f/Sh+Q6PfLaIJlOkKw2SKoTJK3dmFmdILb2tBvrBIlrg5iWRo+WqQ+SaARJ1gCJAzsxThCN16p1vNurGjNjoo42j07kAHFskoY2kEbl33U0ZgoPjXW+Rl0gkarnahqtDaJKxMPDDWIiNafGenh4gExvVhXfmk7Da6L1AVGxSby2h6MxK79Zk42ea1pJbJ48sU2zDezQ8iy1z6BBwoyjMQsvXp8YQAAhgADilRfyy+wf8WqZZUfGZihvgZiB3FybC+kCUU5XLkAo50C+gbBQdUzkAIVyejIAYfFTI1solHP2HgNCnHn5AYNy4jvpoVB6fVzL91cwzLJ9Lfd7S0jhehxO5H5/yePr1W6gHonI7fJ5ORSR/n6Q2yQanq763zuXU5LJZRKiyD/W9/pjkdPZz0/yJ8fqVyry+qQZDMjJKoDfy8bRVhHhQTwAAAAASUVORK5CYII=\");\n  z-index: -1;\n}\n@media (max-width: 575.98px) {\n  .auth-wrapper.auth-v1 .auth-inner:after {\n    display: none;\n  }\n}\n.auth-wrapper.auth-v2 {\n  align-items: flex-start;\n}\n.auth-wrapper.auth-v2 .auth-inner {\n  height: 100vh;\n  overflow-y: auto;\n  height: calc(var(--vh, 1vh) * 100);\n}\n.auth-wrapper.auth-v2 .brand-logo {\n  position: absolute;\n  top: 2rem;\n  left: 2rem;\n  margin: 0;\n  z-index: 1;\n}\n.auth-wrapper.auth-v1 .auth-inner {\n  max-width: 400px;\n}\n.auth-wrapper .brand-logo {\n  display: flex;\n  justify-content: center;\n  margin: 1rem 0 2rem 0;\n}\n.auth-wrapper .brand-logo .brand-text {\n  font-weight: 600;\n}\n.auth-wrapper .auth-footer-btn .btn {\n  padding: 0.6rem !important;\n}\n.auth-wrapper .auth-footer-btn .btn:not(:last-child) {\n  margin-right: 1rem;\n}\n@media (min-width: 1200px) {\n  .auth-wrapper.auth-v2 .auth-card {\n    width: 400px;\n  }\n}\n.auth-wrapper .auth-bg {\n  background-color: #fff;\n}\n.dark-layout .auth-wrapper .auth-bg {\n  background-color: #283046;\n}\n@media (max-height: 625px) {\n  .dark-layout .auth-wrapper .auth-inner {\n    background-color: #283046;\n  }\n  .auth-wrapper .auth-bg {\n    padding-top: 3rem;\n  }\n  .auth-wrapper .auth-inner {\n    background-color: #fff;\n    padding-bottom: 1rem;\n  }\n  .auth-wrapper.auth-v2 .brand-logo {\n    width: 100%;\n    display: flex;\n    justify-content: unset;\n    position: relative;\n    left: 0;\n    padding-left: 1.5rem;\n  }\n}"],
    encapsulation: 2
  });
}

/***/ }),

/***/ 35982:
/*!********************************************************************!*\
  !*** ./src/app/main/pages/authentication/authentication.module.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AuthenticationModule": () => (/* binding */ AuthenticationModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/forms */ 24006);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 34793);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 65765);
/* harmony import */ var _core_common_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @core/common.module */ 75078);
/* harmony import */ var _auth_login_v1_auth_login_v1_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./auth-login-v1/auth-login-v1.component */ 60928);
/* harmony import */ var _auth_register_v1_auth_register_v1_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./auth-register-v1/auth-register-v1.component */ 56436);
/* harmony import */ var _auth_reset_password_v1_auth_reset_password_v1_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./auth-reset-password-v1/auth-reset-password-v1.component */ 10667);
/* harmony import */ var _auth_forgot_password_v1_auth_forgot_password_v1_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./auth-forgot-password-v1/auth-forgot-password-v1.component */ 60109);
/* harmony import */ var app_main_asistente_virtual_asistente_virtual_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! app/main/asistente-virtual/asistente-virtual.component */ 90415);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 94650);











 // routing

const routes = [{
  path: '',
  component: _auth_login_v1_auth_login_v1_component__WEBPACK_IMPORTED_MODULE_1__.AuthLoginV1Component
}, {
  path: 'login',
  component: _auth_login_v1_auth_login_v1_component__WEBPACK_IMPORTED_MODULE_1__.AuthLoginV1Component
}, {
  path: 'authentication/register-v1',
  component: _auth_register_v1_auth_register_v1_component__WEBPACK_IMPORTED_MODULE_2__.AuthRegisterV1Component
}, {
  path: 'authentication/reset-password-v1',
  component: _auth_reset_password_v1_auth_reset_password_v1_component__WEBPACK_IMPORTED_MODULE_3__.AuthResetPasswordV1Component
}, {
  path: 'authentication/forgot-password-v1',
  component: _auth_forgot_password_v1_auth_forgot_password_v1_component__WEBPACK_IMPORTED_MODULE_4__.AuthForgotPasswordV1Component
}];
class AuthenticationModule {
  constructor() {// console.log('iniciando modulos de autenticacion')
  }

  static ɵfac = function AuthenticationModule_Factory(t) {
    return new (t || AuthenticationModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineNgModule"]({
    type: AuthenticationModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineInjector"]({
    imports: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.CommonModule, _angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterModule.forChild(routes), _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_9__.NgbModule, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.FormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.ReactiveFormsModule, _core_common_module__WEBPACK_IMPORTED_MODULE_0__.CoreCommonModule]
  });
}

(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵsetNgModuleScope"](AuthenticationModule, {
    declarations: [_auth_login_v1_auth_login_v1_component__WEBPACK_IMPORTED_MODULE_1__.AuthLoginV1Component, _auth_register_v1_auth_register_v1_component__WEBPACK_IMPORTED_MODULE_2__.AuthRegisterV1Component, _auth_reset_password_v1_auth_reset_password_v1_component__WEBPACK_IMPORTED_MODULE_3__.AuthResetPasswordV1Component, _auth_forgot_password_v1_auth_forgot_password_v1_component__WEBPACK_IMPORTED_MODULE_4__.AuthForgotPasswordV1Component, app_main_asistente_virtual_asistente_virtual_component__WEBPACK_IMPORTED_MODULE_5__.AsistenteVirtualComponent],
    imports: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.CommonModule, _angular_router__WEBPACK_IMPORTED_MODULE_8__.RouterModule, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_9__.NgbModule, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.FormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_10__.ReactiveFormsModule, _core_common_module__WEBPACK_IMPORTED_MODULE_0__.CoreCommonModule]
  });
})();

/***/ }),

/***/ 10825:
/*!*******************************************************************!*\
  !*** ./src/app/main/pages/miscellaneous/error/error.component.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ErrorComponent": () => (/* binding */ ErrorComponent)
/* harmony export */ });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ 7625);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 8929);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 98723);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 94650);
/* harmony import */ var _core_services_config_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @core/services/config.service */ 52553);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/flex-layout/extended */ 24784);
/* harmony import */ var _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @core/directives/core-ripple-effect/core-ripple-effect.directive */ 75287);
 // Keep takeUntil

 // Import timer







const _c0 = function () {
  return {
    "background-color": "#f8f9fa"
  };
};

class ErrorComponent {
  _coreConfigService;
  _location;
  coreConfig;
  countdown = 10; // Initial countdown value

  _timerSubscription; // To hold the timer subscription
  // Private

  _unsubscribeAll; // Keep for general subscriptions

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {Location} _location // Inject Location service
   */

  constructor(_coreConfigService, _location) {
    this._coreConfigService = _coreConfigService;
    this._location = _location;
    this._unsubscribeAll = new rxjs__WEBPACK_IMPORTED_MODULE_2__.Subject(); // Configure the layout

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  } // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */


  ngOnInit() {
    // Subscribe to config changes
    this._coreConfigService.config.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.takeUntil)(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    }); // Start the countdown timer


    this._timerSubscription = (0,rxjs__WEBPACK_IMPORTED_MODULE_4__.timer)(0, 1000) // Emit value immediately, then every 1 second
    .pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.takeUntil)(this._unsubscribeAll)) // Ensure it unsubscribes when component is destroyed
    .subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.goBack(); // Redirect after countdown finishes
      }
    });
  }
  /**
   * Navigates back to the previous page.
   */


  goBack() {
    this._location.back();
  }
  /**
   * On destroy
   */


  ngOnDestroy() {
    // Unsubscribe from all subscriptions (including the timer)
    this._unsubscribeAll.next();

    this._unsubscribeAll.complete(); // Explicitly unsubscribe from the timer if it's still active


    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }

  static ɵfac = function ErrorComponent_Factory(t) {
    return new (t || ErrorComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_core_services_config_service__WEBPACK_IMPORTED_MODULE_0__.CoreConfigService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_common__WEBPACK_IMPORTED_MODULE_6__.Location));
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({
    type: ErrorComponent,
    selectors: [["app-error"]],
    decls: 25,
    vars: 3,
    consts: [[1, "misc-wrapper", 3, "ngStyle"], [1, "background-shapes"], [1, "shape", "shape1"], [1, "shape", "shape2"], [1, "shape", "shape3"], [1, "misc-inner", "d-flex", "flex-column", "col-lg-12", "align-items-center", "justify-content-center", "p-4"], [1, "w-100", "text-center"], [1, "animated-lock-container", "mb-4"], ["xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 100 125", 0, "xml", "space", "preserve", 1, "animated-lock", 2, "width", "150px", "height", "auto"], [1, "lock-body"], ["fill", "#7367F0", "d", "M82.1,48.4H78V35.3C78,20.8,65.2,8,50.7,8S23.4,20.8,23.4,35.3v13.1h-4.1c-3.3,0-6,2.7-6,6v34.5c0,3.3,2.7,6,6,6h62.8c3.3,0,6-2.7,6-6V54.4C88.1,51.1,85.4,48.4,82.1,48.4z M31.4,35.3c0-10.1,8.2-18.3,18.3-18.3s18.3,8.2,18.3,18.3v13.1H31.4V35.3z"], [1, "shackle"], ["fill", "#7367F0", "d", "M62.1,21.3c0-6.8-5.5-12.3-12.3-12.3S37.4,14.5,37.4,21.3v14h8V21.3c0-2.4,1.9-4.3,4.3-4.3s4.3,1.9,4.3,4.3v14h8V21.3z"], [1, "mb-2", "font-weight-bolder", 2, "color", "#5e5873"], [1, "mb-4", 2, "color", "#6e6b7b"], [1, "countdown-timer"], ["rippleEffect", "", 1, "btn", "btn-primary", "btn-lg", "mb-2", 3, "click"]],
    template: function ErrorComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 0)(1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "div", 2)(3, "div", 3)(4, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "div", 5)(6, "div", 6)(7, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "svg", 8)(9, "g", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](10, "path", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "g", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](12, "path", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](13, "h1", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](14, "Acceso Restringido");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "p", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](16, " No tienes permiso para ver esta p\u00E1gina. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](17, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](18, " Ser\u00E1s redirigido autom\u00E1ticamente en ");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](19, "span", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](20);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](21, " segundos. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](22, "a", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function ErrorComponent_Template_a_click_22_listener() {
          return ctx.goBack();
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](23, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](24, "Regresar a la p\u00E1gina anterior");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()()();
      }

      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngStyle", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](2, _c0));
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](20);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx.countdown);
      }
    },
    dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.NgStyle, _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_7__.DefaultStyleDirective, _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_1__.RippleEffectDirective],
    styles: [".misc-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-basis: 100%;\n  min-height: 100vh;\n  width: 100%;\n  align-items: center;\n  justify-content: center;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .misc-inner[_ngcontent-%COMP%] {\n  position: relative;\n  max-width: 750px;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .brand-logo[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  position: absolute;\n  top: 2rem;\n  left: 2rem;\n  margin: 0;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .brand-logo[_ngcontent-%COMP%]   .brand-text[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n@media (max-height: 625px) {\n  .misc-wrapper[_ngcontent-%COMP%]   .misc-inner[_ngcontent-%COMP%] {\n    margin-top: 4rem;\n  }\n}\n.drop[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.7));\n}\n.btn-whatsapp[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: -1;\n  bottom: 20px;\n  right: 740px;\n  top: 100px;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:before, .btn-whatsapp[_ngcontent-%COMP%]:after {\n  content: \"\";\n  position: absolute;\n  top: 10px;\n  left: 10px;\n  width: 180px;\n  height: 180px;\n  border-radius: 50%;\n  background-color: #eda409;\n  opacity: 0;\n  animation: onda 1s infinite;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:before {\n  animation-delay: 0.2s;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:after {\n  animation-delay: 0.5s;\n}\n.btn-whatsapp[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 2;\n}\n@keyframes onda {\n  0% {\n    transform: scale(1);\n  }\n  15% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n    transform: scale(2.5);\n  }\n}", ".misc-wrapper[_ngcontent-%COMP%] {\n    position: relative;\n    overflow: hidden;\n  }\n  .background-shapes[_ngcontent-%COMP%] {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    z-index: 0;\n  }\n  .shape[_ngcontent-%COMP%] {\n    position: absolute;\n    border-radius: 50%;\n    background: rgba(115, 103, 240, 0.08); \n    animation: float 20s infinite linear;\n  }\n  .shape1[_ngcontent-%COMP%] { width: 200px; height: 200px; top: 5%; left: 10%; animation-duration: 25s; }\n  .shape2[_ngcontent-%COMP%] { width: 120px; height: 120px; top: 65%; left: 80%; animation-duration: 18s; }\n  .shape3[_ngcontent-%COMP%] { width: 80px; height: 80px; top: 80%; left: 5%; animation-duration: 22s; }\n\n  @keyframes float {\n    0% { transform: translateY(0px) translateX(0px) rotate(0deg); }\n    50% { transform: translateY(-30px) translateX(20px) rotate(180deg); }\n    100% { transform: translateY(0px) translateX(0px) rotate(360deg); }\n  }\n\n  .misc-inner[_ngcontent-%COMP%] {\n    z-index: 1;\n    transform: translateY(-10%); \n  }\n\n  .animated-lock-container[_ngcontent-%COMP%] {\n    animation: float-lock 6s ease-in-out infinite;\n  }\n\n  .animated-lock[_ngcontent-%COMP%]   .shackle[_ngcontent-%COMP%] {\n    animation: lock-shake 2s ease-in-out infinite alternate;\n    transform-origin: 50% 50%;\n  }\n\n  @keyframes float-lock {\n    0%, 100% { transform: translateY(0); }\n    50% { transform: translateY(-15px); }\n  }\n\n  @keyframes lock-shake {\n    0%, 100% { transform: translateX(-2px) rotate(-3deg); }\n    50% { transform: translateX(2px) rotate(3deg); }\n  }\n\n  .countdown-timer[_ngcontent-%COMP%] {\n    font-weight: bold;\n    color: #7367F0; \n    font-size: 1.1em;\n  }"]
  });
}

/***/ }),

/***/ 59778:
/*!*********************************************************************!*\
  !*** ./src/app/main/pages/miscellaneous/logout/logout.component.ts ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LogoutComponent": () => (/* binding */ LogoutComponent)
/* harmony export */ });
/* harmony import */ var _Users_imac_dev_angular_code_epic_io_v2consola_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ 15861);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 8929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 94650);
/* harmony import */ var _core_services_config_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @core/services/config.service */ 52553);
/* harmony import */ var _services_seguridad_login_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @services/seguridad/login.service */ 38072);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/flex-layout/extended */ 24784);


 // Import timer







function LogoutComponent_li_16_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "i-feather", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}

function LogoutComponent_li_16_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 25)(1, "span", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2, "Loading...");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
}

function LogoutComponent_li_16_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "i-feather", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}

function LogoutComponent_li_16_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "i-feather", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}

function LogoutComponent_li_16_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "li", 16)(1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, LogoutComponent_li_16_div_2_Template, 2, 0, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](3, LogoutComponent_li_16_div_3_Template, 3, 0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](4, LogoutComponent_li_16_div_4_Template, 2, 0, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](5, LogoutComponent_li_16_div_5_Template, 2, 0, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }

  if (rf & 2) {
    const step_r1 = ctx.$implicit;
    const i_r2 = ctx.index;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("animation-delay", i_r2 * 150, "ms");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngClass", "status-" + step_r1.status);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", step_r1.status === "pending");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", step_r1.status === "in-progress");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", step_r1.status === "done");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", step_r1.status === "error");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](step_r1.label);
  }
}

class LogoutComponent {
  _coreConfigService;
  loginService;
  ngZone;
  cdr;
  steps = [{
    key: 'SERVER_LOGOUT',
    label: 'Finalizando sesión en el servidor',
    status: 'pending'
  }, {
    key: 'CLEAR_SESSION',
    label: 'Limpiando datos de la sesión local',
    status: 'pending'
  }, {
    key: 'REDIRECT',
    label: 'Redirigiendo',
    status: 'pending'
  }];
  finalMessage = ''; // Mapea los mensajes del servicio a las claves de los pasos

  messageToStepKey = {
    'Finalizando sesión en el servidor...': 'SERVER_LOGOUT',
    'No se pudo contactar al servidor, limpiando localmente...': 'SERVER_LOGOUT',
    'Limpiando datos de la sesión...': 'CLEAR_SESSION',
    '¡Hasta pronto!': 'REDIRECT'
  };
  coreConfig;
  countdown = 10; // Initial countdown value

  _timerSubscription; // To hold the timer subscription
  // Private

  _unsubscribeAll; // Keep for general subscriptions

  constructor(_coreConfigService, loginService, ngZone, cdr) {
    this._coreConfigService = _coreConfigService;
    this.loginService = loginService;
    this.ngZone = ngZone;
    this.cdr = cdr;
    this._unsubscribeAll = new rxjs__WEBPACK_IMPORTED_MODULE_4__.Subject(); // Configure the layout

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  ngOnInit() {
    this.executeLogout();
  }

  executeLogout() {
    var _this = this;

    return (0,_Users_imac_dev_angular_code_epic_io_v2consola_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
      yield _this.loginService.performLogoutProcess(message => {
        _this.ngZone.run(() => {
          _this.updateStepStatus(message);
        });
      });
    })();
  }

  updateStepStatus(message) {
    const stepKey = this.messageToStepKey[message];
    if (!stepKey) return;
    const currentStepIndex = this.steps.findIndex(s => s.key === stepKey);
    if (currentStepIndex === -1) return; // Marcar todos los pasos anteriores como 'completados'

    for (let i = 0; i < currentStepIndex; i++) {
      if (this.steps[i].status !== 'error') {
        this.steps[i].status = 'done';
      }
    } // Marcar el paso actual


    const currentStep = this.steps[currentStepIndex];

    if (message.includes('No se pudo')) {
      currentStep.status = 'error';
    } else if (message === '¡Hasta pronto!') {
      currentStep.status = 'done';
      this.finalMessage = '¡Sesión cerrada con éxito!';
    } else {
      currentStep.status = 'in-progress';
    }

    this.cdr.detectChanges();
  }
  /**
  * On destroy
  */


  ngOnDestroy() {
    // Unsubscribe from all subscriptions (including the timer)
    this._unsubscribeAll.next();

    this._unsubscribeAll.complete(); // Explicitly unsubscribe from the timer if it's still active


    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }

  static ɵfac = function LogoutComponent_Factory(t) {
    return new (t || LogoutComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_core_services_config_service__WEBPACK_IMPORTED_MODULE_1__.CoreConfigService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_seguridad_login_service__WEBPACK_IMPORTED_MODULE_2__.LoginService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.NgZone), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_3__.ChangeDetectorRef));
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
    type: LogoutComponent,
    selectors: [["app-logout"]],
    decls: 19,
    vars: 2,
    consts: [[1, "misc-wrapper"], [1, "background-shapes"], [1, "shape", "shape1"], [1, "shape", "shape2"], [1, "shape", "shape3"], [1, "misc-inner", "p-2", "p-sm-3"], [1, "w-100", "text-center"], [1, "power-off-container", "mb-4"], [1, "power-off-icon"], [1, "power-off-line"], [1, "mb-2", "font-weight-bolder", 2, "color", "#5e5873"], [1, "mb-4", 2, "color", "#6e6b7b"], [1, "logout-steps-container"], [1, "logout-steps"], ["class", "step-item", 3, "ngClass", "animation-delay", 4, "ngFor", "ngForOf"], [1, "mt-4", "font-weight-bold", "final-message"], [1, "step-item", 3, "ngClass"], [1, "step-icon"], ["class", "pending-icon-wrapper", 4, "ngIf"], ["class", "spinner-border spinner-border-sm", "role", "status", 4, "ngIf"], ["class", "done-icon-wrapper", 4, "ngIf"], ["class", "error-icon-wrapper", 4, "ngIf"], [1, "step-label"], [1, "pending-icon-wrapper"], ["name", "clock", 1, "pending-icon"], ["role", "status", 1, "spinner-border", "spinner-border-sm"], [1, "sr-only"], [1, "done-icon-wrapper"], ["name", "check", 1, "done-icon"], [1, "error-icon-wrapper"], ["name", "x-circle", 1, "error-icon"]],
    template: function LogoutComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0)(1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "div", 2)(3, "div", 3)(4, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "div", 5)(6, "div", 6)(7, "div", 7)(8, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](9, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](10, "h1", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](11, "Cerrando Sesi\u00F3n...");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "p", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](13, " Estamos finalizando tu sesi\u00F3n de forma segura. Por favor, espera un momento. ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "div", 12)(15, "ul", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](16, LogoutComponent_li_16_Template, 8, 8, "li", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](17, "p", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](18);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()()();
      }

      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx.steps);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.finalMessage);
      }
    },
    dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.NgClass, _angular_common__WEBPACK_IMPORTED_MODULE_5__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_5__.NgIf, _angular_flex_layout_extended__WEBPACK_IMPORTED_MODULE_6__.DefaultClassDirective],
    styles: [".misc-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-basis: 100%;\n  min-height: 100vh;\n  width: 100%;\n  align-items: center;\n  justify-content: center;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .misc-inner[_ngcontent-%COMP%] {\n  position: relative;\n  max-width: 750px;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .brand-logo[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  position: absolute;\n  top: 2rem;\n  left: 2rem;\n  margin: 0;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .brand-logo[_ngcontent-%COMP%]   .brand-text[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n@media (max-height: 625px) {\n  .misc-wrapper[_ngcontent-%COMP%]   .misc-inner[_ngcontent-%COMP%] {\n    margin-top: 4rem;\n  }\n}\n@keyframes float {\n  0% {\n    transform: translateY(0px) translateX(0px) rotate(0deg);\n  }\n  50% {\n    transform: translateY(-30px) translateX(20px) rotate(180deg);\n  }\n  100% {\n    transform: translateY(0px) translateX(0px) rotate(360deg);\n  }\n}\n@keyframes float-icon {\n  0%, 100% {\n    transform: translateY(0);\n  }\n  50% {\n    transform: translateY(-15px);\n  }\n}\n@keyframes pulse-border {\n  0% {\n    border-color: #d9d7f1;\n  }\n  50% {\n    border-color: #7367f0;\n  }\n  100% {\n    border-color: #d9d7f1;\n  }\n}\n@keyframes pulse-color {\n  0% {\n    background-color: #d9d7f1;\n  }\n  50% {\n    background-color: #7367f0;\n  }\n  100% {\n    background-color: #d9d7f1;\n  }\n}\n@keyframes pop-in {\n  0% {\n    transform: scale(0);\n    opacity: 0;\n  }\n  80% {\n    transform: scale(1.2);\n    opacity: 1;\n  }\n  100% {\n    transform: scale(1);\n  }\n}\n@keyframes slide-in-fade {\n  from {\n    opacity: 0;\n    transform: translateY(20px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n@keyframes clock-tick {\n  0%, 100% {\n    transform: rotate(0deg);\n  }\n  25% {\n    transform: rotate(8deg);\n  }\n  75% {\n    transform: rotate(-8deg);\n  }\n}\n.misc-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n  overflow: hidden;\n  background-color: #f8f9fa;\n}\n.background-shapes[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 0;\n}\n.background-shapes[_ngcontent-%COMP%]   .shape[_ngcontent-%COMP%] {\n  position: absolute;\n  border-radius: 50%;\n  background: rgba(115, 103, 240, 0.08);\n  animation: float 20s infinite linear;\n}\n.background-shapes[_ngcontent-%COMP%]   .shape1[_ngcontent-%COMP%] {\n  width: 200px;\n  height: 200px;\n  top: 15%;\n  left: 10%;\n  animation-duration: 25s;\n}\n.background-shapes[_ngcontent-%COMP%]   .shape2[_ngcontent-%COMP%] {\n  width: 120px;\n  height: 120px;\n  top: 75%;\n  left: 80%;\n  animation-duration: 18s;\n}\n.background-shapes[_ngcontent-%COMP%]   .shape3[_ngcontent-%COMP%] {\n  width: 80px;\n  height: 80px;\n  top: 80%;\n  left: 15%;\n  animation-duration: 22s;\n}\n.misc-inner[_ngcontent-%COMP%] {\n  z-index: 1;\n}\n.power-off-container[_ngcontent-%COMP%] {\n  display: inline-block;\n  animation: float-icon 6s ease-in-out infinite;\n}\n.power-off-icon[_ngcontent-%COMP%] {\n  position: relative;\n  width: 100px;\n  height: 100px;\n  border: 8px solid #d9d7f1;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: pulse-border 2.5s infinite ease-in-out;\n}\n.power-off-line[_ngcontent-%COMP%] {\n  width: 8px;\n  height: 40px;\n  background-color: #d9d7f1;\n  position: absolute;\n  top: 10px;\n  border-radius: 4px;\n  animation: pulse-color 2.5s infinite ease-in-out;\n}\n.logout-steps-container[_ngcontent-%COMP%] {\n  max-width: 400px;\n  margin: 2rem auto 0;\n  background: #fff;\n  padding: 1rem 1.5rem;\n  border-radius: 12px;\n  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);\n  border: 1px solid #ebe9f1;\n}\n.logout-steps[_ngcontent-%COMP%] {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n}\n.step-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding: 0.85rem 0;\n  transition: all 0.4s ease;\n  opacity: 0;\n  animation: slide-in-fade 0.5s forwards ease-out;\n}\n.step-item[_ngcontent-%COMP%]:not(:last-child) {\n  border-bottom: 1px solid #f0eff5;\n}\n.step-item[_ngcontent-%COMP%]   .step-icon[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  margin-right: 1.25rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 50%;\n  transition: all 0.3s ease-in-out;\n}\n.step-item[_ngcontent-%COMP%]   .step-label[_ngcontent-%COMP%] {\n  transition: color 0.3s ease;\n}\n.step-item.status-pending[_ngcontent-%COMP%] {\n  opacity: 0.6;\n}\n.step-item.status-pending[_ngcontent-%COMP%]   .step-icon[_ngcontent-%COMP%] {\n  background-color: #f3f2f7;\n}\n.step-item.status-pending[_ngcontent-%COMP%]   .pending-icon[_ngcontent-%COMP%] {\n  color: #a8a4c2;\n  animation: clock-tick 2s infinite ease-in-out;\n}\n.step-item.status-in-progress[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #5e5873;\n}\n.step-item.status-in-progress[_ngcontent-%COMP%]   .step-icon[_ngcontent-%COMP%] {\n  background-color: rgba(115, 103, 240, 0.1);\n}\n.step-item.status-in-progress[_ngcontent-%COMP%]   .spinner-border[_ngcontent-%COMP%] {\n  color: #7367f0 !important;\n}\n.step-item.status-done[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #5e5873;\n}\n.step-item.status-done[_ngcontent-%COMP%]   .step-icon[_ngcontent-%COMP%] {\n  background-color: rgba(40, 199, 111, 0.12);\n}\n.step-item.status-done[_ngcontent-%COMP%]   .done-icon-wrapper[_ngcontent-%COMP%] {\n  animation: pop-in 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);\n}\n.step-item.status-done[_ngcontent-%COMP%]   .done-icon[_ngcontent-%COMP%] {\n  color: #28c76f;\n}\n.step-item.status-done[_ngcontent-%COMP%]   .step-label[_ngcontent-%COMP%] {\n  color: #4d4a61;\n}\n.step-item.status-error[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #ea5455;\n}\n.step-item.status-error[_ngcontent-%COMP%]   .step-icon[_ngcontent-%COMP%] {\n  background-color: rgba(234, 84, 85, 0.12);\n}\n.step-item.status-error[_ngcontent-%COMP%]   .error-icon-wrapper[_ngcontent-%COMP%] {\n  animation: pop-in 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);\n}\n.step-item.status-error[_ngcontent-%COMP%]   .error-icon[_ngcontent-%COMP%] {\n  color: #ea5455;\n}\n.final-message[_ngcontent-%COMP%] {\n  min-height: 24px;\n  animation: slide-in-fade 0.5s forwards ease-out;\n  animation-delay: 500ms;\n  opacity: 0;\n  color: #28c76f !important;\n}\n.misc-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n  overflow: hidden;\n  background-color: #f8f9fa;\n}\n.background-shapes[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 0;\n}\n.shape[_ngcontent-%COMP%] {\n  position: absolute;\n  border-radius: 50%;\n  background: rgba(115, 103, 240, 0.08);\n  animation: float 20s infinite linear;\n}\n.shape1[_ngcontent-%COMP%] {\n  width: 200px;\n  height: 200px;\n  top: 15%;\n  left: 10%;\n  animation-duration: 25s;\n}\n.shape2[_ngcontent-%COMP%] {\n  width: 120px;\n  height: 120px;\n  top: 75%;\n  left: 80%;\n  animation-duration: 18s;\n}\n.shape3[_ngcontent-%COMP%] {\n  width: 80px;\n  height: 80px;\n  top: 80%;\n  left: 15%;\n  animation-duration: 22s;\n}\n@keyframes float {\n  0% {\n    transform: translateY(0px) translateX(0px) rotate(0deg);\n  }\n  50% {\n    transform: translateY(-30px) translateX(20px) rotate(180deg);\n  }\n  100% {\n    transform: translateY(0px) translateX(0px) rotate(360deg);\n  }\n}\n.misc-inner[_ngcontent-%COMP%] {\n  z-index: 1;\n}\n\n.power-off-container[_ngcontent-%COMP%] {\n  display: inline-block;\n  animation: float-icon 6s ease-in-out infinite;\n}\n@keyframes float-icon {\n  0%, 100% {\n    transform: translateY(0);\n  }\n  50% {\n    transform: translateY(-15px);\n  }\n}\n.power-off-icon[_ngcontent-%COMP%] {\n  position: relative;\n  width: 100px;\n  height: 100px;\n  border: 8px solid #c8c8e0;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: pulse-border 2s infinite;\n}\n.power-off-line[_ngcontent-%COMP%] {\n  width: 8px;\n  height: 40px;\n  background-color: #c8c8e0;\n  position: absolute;\n  top: 10px;\n  border-radius: 4px;\n  animation: pulse-color 2s infinite;\n}\n@keyframes pulse-border {\n  0% {\n    border-color: #c8c8e0;\n  }\n  50% {\n    border-color: #7367F0;\n  }\n  100% {\n    border-color: #c8c8e0;\n  }\n}\n@keyframes pulse-color {\n  0% {\n    background-color: #c8c8e0;\n  }\n  50% {\n    background-color: #7367F0;\n  }\n  100% {\n    background-color: #c8c8e0;\n  }\n}\n\n.logout-steps-container[_ngcontent-%COMP%] {\n  max-width: 400px;\n  margin: 2rem auto 0;\n  background: #fff;\n  padding: 1.5rem;\n  border-radius: 8px;\n  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);\n  border: 1px solid #ebe9f1;\n}\n.logout-steps[_ngcontent-%COMP%] {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n}\n.step-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding: 0.75rem 0;\n  transition: all 0.3s ease;\n  opacity: 0.5;\n  color: #6e6b7b;\n}\n.step-item[_ngcontent-%COMP%]:not(:last-child) {\n  border-bottom: 1px solid #ebe9f1;\n}\n.step-item.status-in-progress[_ngcontent-%COMP%], .step-item.status-done[_ngcontent-%COMP%], .step-item.status-error[_ngcontent-%COMP%] {\n  opacity: 1;\n  font-weight: 600;\n}\n.step-item.status-in-progress[_ngcontent-%COMP%] {\n  color: #7367F0;\n}\n.step-item.status-done[_ngcontent-%COMP%] {\n  color: #28c76f;\n}\n.step-item.status-error[_ngcontent-%COMP%] {\n  color: #ea5455;\n}\n.step-icon[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  margin-right: 1rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.pending-icon[_ngcontent-%COMP%] {\n  width: 10px;\n  height: 10px;\n  background-color: #b9b9c3;\n  border-radius: 50%;\n}\n.done-icon[_ngcontent-%COMP%], .error-icon[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n}\n.final-message[_ngcontent-%COMP%] {\n  min-height: 24px;\n  \n  animation: fadeIn 0.5s ease-in;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}"]
  });
}

/***/ }),

/***/ 48057:
/*!*******************************************************************************!*\
  !*** ./src/app/main/pages/miscellaneous/maintenance/maintenance.component.ts ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MaintenanceComponent": () => (/* binding */ MaintenanceComponent)
/* harmony export */ });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ 7625);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 8929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 94650);
/* harmony import */ var _core_services_config_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @core/services/config.service */ 52553);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ 34793);
/* harmony import */ var _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @core/directives/core-ripple-effect/core-ripple-effect.directive */ 75287);






class MaintenanceComponent {
  _coreConfigService;
  coreConfig; // Private

  _unsubscribeAll;
  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */

  constructor(_coreConfigService) {
    this._coreConfigService = _coreConfigService;
    this._unsubscribeAll = new rxjs__WEBPACK_IMPORTED_MODULE_2__.Subject(); // Configure the layout

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  } // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */


  ngOnInit() {
    // Subscribe to config changes
    this._coreConfigService.config.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.takeUntil)(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }
  /**
   * On destroy
   */


  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();

    this._unsubscribeAll.complete();
  }

  static ɵfac = function MaintenanceComponent_Factory(t) {
    return new (t || MaintenanceComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_core_services_config_service__WEBPACK_IMPORTED_MODULE_0__.CoreConfigService));
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({
    type: MaintenanceComponent,
    selectors: [["app-maintenance"]],
    decls: 20,
    vars: 4,
    consts: [[1, "misc-wrapper"], ["href", "javascript:void(0);", 1, "brand-logo"], ["alt", "brand-logo", "height", "28", 3, "src"], [1, "brand-text", "text-primary", "ml-1"], [1, "misc-inner", "d-lg-flex", "col-lg-12", "align-items-center", "p-5"], [1, "w-100", "text-center"], [1, "mb-1"], [1, "mb-3"], [1, "btn-whatsapp"], ["alt", "Error page", "width", "200px", 1, "img-fluid", "drop", 3, "src"], [1, "mb-1", "drop"], ["align", "center", "routerLink", "/", "rippleEffect", "", 1, "btn", "btn-danger", "mb-2", "btn-sm-block"]],
    template: function MaintenanceComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 0)(1, "a", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "img", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "h2", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "div", 4)(6, "div", 5)(7, "h1", 6)(8, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](10, "h2", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](11, "Sistema en Mantenimiento\uD83D\uDEE0");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](13, "Disculpe las molestias, pero estamos realizando un mantenimiento en este momento.");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](14, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](15, "img", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](16, "p", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](17, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](18, "a", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](19, "Regresar al Inicio");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()()();
      }

      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("src", ctx.coreConfig.app.appLogoImage, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsanitizeUrl"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx.coreConfig.app.appName);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx.coreConfig.app.appTitle);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("src", ctx.coreConfig.layout.skin === "dark" ? "assets/images/logo/logo.png" : "assets/images/logo/logo.png", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsanitizeUrl"]);
      }
    },
    dependencies: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterLinkWithHref, _core_directives_core_ripple_effect_core_ripple_effect_directive__WEBPACK_IMPORTED_MODULE_1__.RippleEffectDirective],
    styles: [".misc-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-basis: 100%;\n  min-height: 100vh;\n  width: 100%;\n  align-items: center;\n  justify-content: center;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .misc-inner[_ngcontent-%COMP%] {\n  position: relative;\n  max-width: 750px;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .brand-logo[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  position: absolute;\n  top: 2rem;\n  left: 2rem;\n  margin: 0;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .brand-logo[_ngcontent-%COMP%]   .brand-text[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n@media (max-height: 625px) {\n  .misc-wrapper[_ngcontent-%COMP%]   .misc-inner[_ngcontent-%COMP%] {\n    margin-top: 4rem;\n  }\n}\n.drop[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.7));\n}\n.btn-whatsapp[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: -1;\n  bottom: 20px;\n  right: 740px;\n  top: 100px;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:before, .btn-whatsapp[_ngcontent-%COMP%]:after {\n  content: \"\";\n  position: absolute;\n  top: 10px;\n  left: 10px;\n  width: 180px;\n  height: 180px;\n  border-radius: 50%;\n  background-color: #eda409;\n  opacity: 0;\n  animation: onda 1s infinite;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:before {\n  animation-delay: 0.2s;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:after {\n  animation-delay: 0.5s;\n}\n.btn-whatsapp[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 2;\n}\n@keyframes onda {\n  0% {\n    transform: scale(1);\n  }\n  15% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n    transform: scale(2.5);\n  }\n}"]
  });
}

/***/ }),

/***/ 79034:
/*!******************************************************************!*\
  !*** ./src/app/main/pages/miscellaneous/miscellaneous.module.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MiscellaneousModule": () => (/* binding */ MiscellaneousModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ 34793);
/* harmony import */ var _core_common_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @core/common.module */ 75078);
/* harmony import */ var _error_error_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error/error.component */ 10825);
/* harmony import */ var _maintenance_maintenance_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./maintenance/maintenance.component */ 48057);
/* harmony import */ var _not_authorized_not_authorized_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./not-authorized/not-authorized.component */ 17804);
/* harmony import */ var _logout_logout_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./logout/logout.component */ 59778);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 94650);








 // routing

const routes = [{
  path: 'miscellaneous/error',
  component: _error_error_component__WEBPACK_IMPORTED_MODULE_1__.ErrorComponent
}, {
  path: 'miscellaneous/maintenance',
  component: _maintenance_maintenance_component__WEBPACK_IMPORTED_MODULE_2__.MaintenanceComponent
}, {
  path: 'miscellaneous/not-authorized',
  component: _not_authorized_not_authorized_component__WEBPACK_IMPORTED_MODULE_3__.NotAuthorizedComponent
}, {
  path: 'miscellaneous/logout',
  component: _logout_logout_component__WEBPACK_IMPORTED_MODULE_4__.LogoutComponent
}];
class MiscellaneousModule {
  static ɵfac = function MiscellaneousModule_Factory(t) {
    return new (t || MiscellaneousModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineNgModule"]({
    type: MiscellaneousModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjector"]({
    imports: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_router__WEBPACK_IMPORTED_MODULE_7__.RouterModule.forChild(routes), _core_common_module__WEBPACK_IMPORTED_MODULE_0__.CoreCommonModule]
  });
}

(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsetNgModuleScope"](MiscellaneousModule, {
    declarations: [_error_error_component__WEBPACK_IMPORTED_MODULE_1__.ErrorComponent, _maintenance_maintenance_component__WEBPACK_IMPORTED_MODULE_2__.MaintenanceComponent, _logout_logout_component__WEBPACK_IMPORTED_MODULE_4__.LogoutComponent],
    imports: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_router__WEBPACK_IMPORTED_MODULE_7__.RouterModule, _core_common_module__WEBPACK_IMPORTED_MODULE_0__.CoreCommonModule]
  });
})();

/***/ }),

/***/ 17804:
/*!*************************************************************************************!*\
  !*** ./src/app/main/pages/miscellaneous/not-authorized/not-authorized.component.ts ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NotAuthorizedComponent": () => (/* binding */ NotAuthorizedComponent)
/* harmony export */ });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 7625);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ 8929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 94650);
/* harmony import */ var _core_services_config_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @core/services/config.service */ 52553);




class NotAuthorizedComponent {
  _coreConfigService;
  coreConfig; // Private

  _unsubscribeAll;
  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */

  constructor(_coreConfigService) {
    this._coreConfigService = _coreConfigService;
    this._unsubscribeAll = new rxjs__WEBPACK_IMPORTED_MODULE_1__.Subject(); // Configure the layout

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  } // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */


  ngOnInit() {
    // Subscribe to config changes
    this._coreConfigService.config.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.takeUntil)(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  salir() {
    sessionStorage.removeItem('token');
    window.location.href = '/';
  }
  /**
   * On destroy
   */


  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();

    this._unsubscribeAll.complete();
  }

  static ɵfac = function NotAuthorizedComponent_Factory(t) {
    return new (t || NotAuthorizedComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_core_services_config_service__WEBPACK_IMPORTED_MODULE_0__.CoreConfigService));
  };
  static ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
    type: NotAuthorizedComponent,
    selectors: [["app-not-authorized"]],
    decls: 23,
    vars: 4,
    consts: [[1, "misc-wrapper"], ["href", "javascript:void(0);", 1, "brand-logo"], ["alt", "brand-logo", "height", "28", 3, "src"], [1, "brand-text", "text-primary", "ml-1"], [1, "misc-inner", "d-lg-flex", "col-lg-12", "align-items-center", "p-5"], [1, "w-100", "text-center"], [1, "mb-1"], [1, "mb-2"], [1, "btn-whatsapp"], ["alt", "Error page", "width", "200px", 1, "img-fluid", "drop", 3, "src"], [1, "mb-1", "drop"], ["align", "center", "routerLink", "/", "rippleEffect", "", 1, "btn", "btn-warning", "mb-2", "btn-sm-block"], ["align", "center", "rippleEffect", "", 1, "btn", "btn-danger", "mb-2", "btn-sm-block", 3, "click"]],
    template: function NotAuthorizedComponent_Template(rf, ctx) {
      if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0)(1, "a", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "img", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "h2", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "div", 4)(6, "div", 5)(7, "h1", 6)(8, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](10, "h2", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](11, "Usted no est\u00E1 autorizado! \uD83D\uDD10");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "p", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](13, "No tienes permisos para ingresar a esta URL, te recomendamos salir de esta p\u00E1gina");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](15, "img", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](16, "p", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](17, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](18, "a", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](19, "Salir de esta P\u00E1gina");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](20, " \u00A0 ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](21, "a", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function NotAuthorizedComponent_Template_a_click_21_listener() {
          return ctx.salir();
        });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](22, "Cerrar Sesi\u00F3n");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()()()();
      }

      if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate"]("src", ctx.coreConfig.app.appLogoImage, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.coreConfig.app.appName);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.coreConfig.app.appTitle);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("src", ctx.coreConfig.layout.skin === "dark" ? "assets/images/logo/logo.png" : "assets/images/logo/logo.png", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsanitizeUrl"]);
      }
    },
    styles: [".misc-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-basis: 100%;\n  min-height: 100vh;\n  width: 100%;\n  align-items: center;\n  justify-content: center;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .misc-inner[_ngcontent-%COMP%] {\n  position: relative;\n  max-width: 750px;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .brand-logo[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  position: absolute;\n  top: 2rem;\n  left: 2rem;\n  margin: 0;\n}\n.misc-wrapper[_ngcontent-%COMP%]   .brand-logo[_ngcontent-%COMP%]   .brand-text[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n@media (max-height: 625px) {\n  .misc-wrapper[_ngcontent-%COMP%]   .misc-inner[_ngcontent-%COMP%] {\n    margin-top: 4rem;\n  }\n}\n.drop[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.7));\n}\n.btn-whatsapp[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: -1;\n  bottom: 20px;\n  right: 740px;\n  top: 100px;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:before, .btn-whatsapp[_ngcontent-%COMP%]:after {\n  content: \"\";\n  position: absolute;\n  top: 10px;\n  left: 10px;\n  width: 180px;\n  height: 180px;\n  border-radius: 50%;\n  background-color: #eda409;\n  opacity: 0;\n  animation: onda 1s infinite;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:before {\n  animation-delay: 0.2s;\n}\n.btn-whatsapp[_ngcontent-%COMP%]:after {\n  animation-delay: 0.5s;\n}\n.btn-whatsapp[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 2;\n}\n@keyframes onda {\n  0% {\n    transform: scale(1);\n  }\n  15% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n    transform: scale(2.5);\n  }\n}"]
  });
}

/***/ }),

/***/ 37478:
/*!********************************************!*\
  !*** ./src/app/main/pages/pages.module.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesModule": () => (/* binding */ PagesModule)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 36895);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/forms */ 24006);
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ 65765);
/* harmony import */ var _ng_select_ng_select__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ng-select/ng-select */ 88796);
/* harmony import */ var _core_common_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @core/common.module */ 75078);
/* harmony import */ var app_layout_components_content_header_content_header_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! app/layout/components/content-header/content-header.module */ 50619);
/* harmony import */ var _authentication_authentication_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./authentication/authentication.module */ 35982);
/* harmony import */ var _miscellaneous_miscellaneous_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./miscellaneous/miscellaneous.module */ 79034);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 94650);









class PagesModule {
  static ɵfac = function PagesModule_Factory(t) {
    return new (t || PagesModule)();
  };
  static ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineNgModule"]({
    type: PagesModule
  });
  static ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjector"]({
    imports: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.CommonModule, _core_common_module__WEBPACK_IMPORTED_MODULE_0__.CoreCommonModule, app_layout_components_content_header_content_header_module__WEBPACK_IMPORTED_MODULE_1__.ContentHeaderModule, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_6__.NgbModule, _ng_select_ng_select__WEBPACK_IMPORTED_MODULE_7__.NgSelectModule, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormsModule, _authentication_authentication_module__WEBPACK_IMPORTED_MODULE_2__.AuthenticationModule, _miscellaneous_miscellaneous_module__WEBPACK_IMPORTED_MODULE_3__.MiscellaneousModule]
  });
}

(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsetNgModuleScope"](PagesModule, {
    imports: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.CommonModule, _core_common_module__WEBPACK_IMPORTED_MODULE_0__.CoreCommonModule, app_layout_components_content_header_content_header_module__WEBPACK_IMPORTED_MODULE_1__.ContentHeaderModule, _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_6__.NgbModule, _ng_select_ng_select__WEBPACK_IMPORTED_MODULE_7__.NgSelectModule, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormsModule, _authentication_authentication_module__WEBPACK_IMPORTED_MODULE_2__.AuthenticationModule, _miscellaneous_miscellaneous_module__WEBPACK_IMPORTED_MODULE_3__.MiscellaneousModule]
  });
})();

/***/ })

}]);