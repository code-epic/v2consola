# Sandra UI - Consola

Una vez instalada la plataforma podra acceder al **Panel** mediante la siguiente URL.

`https://localhost/panel`

En informática y ciencias de la computación, en particular en análisis y diseño orientado a objetos, el término lógica de negocio es la parte de un sistema que se encarga de codificar las reglas de negocio del mundo real que determinan cómo la información puede ser creada, almacenada y cambiada. En programación es una de las capas del modelo MVC Modelo–vista–controlador separando así la complejidad del desarrollo en capas independientes.

Son rutinas que realizan entradas de datos, consultas a los datos, generación de informes y más específicamente todo el procesamiento que se realiza detrás de la aplicación visible para el usuario (Backend).

En el contexto de la orientación a objetos, la lógica del negocio es tomada como aquella funcionalidad ofrecida por el software. El software se comunica de manera amigable con el usuario a partir de la interfaz, pero el procesamiento de los datos capturados como entrada y la posterior entrega de resultados al usuario por medio de la interfaz, es conocido como la Lógica de Negocio.

_A fines de implementar un modelo que ayude al mismo tiempo que regule las empresas descentralizadas a una recaudación centralizada de la misma estableciendo sus parámetros de negocio analizando sus productos. Este sistema se posiciona como una solución Enterprise de alta gama, integrando capacidades de SRE (Site Reliability Engineering) y observabilidad avanzada para garantizar la continuidad operativa._

---

## Ecosistema Tecnológico

Sandra UI no es solo una interfaz; es el nodo de control de un ecosistema distribuido diseñado para la resiliencia:

- **Backend Core**: Desarrollado en **Go** y **Rust** para maximizar la eficiencia en el manejo de memoria y concurrencia.
- **Comunicación**: Utiliza **gRPC** con Serialización de Protocol Buffers para streaming de datos de alta velocidad y baja latencia.
- **Frontend**: **Angular Enterprise** con un motor de renderizado optimizado y una estética premium basada en principios de diseño moderno.
- **Seguridad**: Cifrado de punto a punto utilizando **AES-256** para datos en reposo y **RSA/TLS 1.3** para datos en tránsito.
- **Base de Datos**: Soporte híbrido para **MongoDB** (vía driver MGDBA) y Motores Relacionales, optimizados para grandes volúmenes de datos.

---

## Navegación

1. Login
1. Principal
1. Redes Informaticas
1. Herramientas
1. Aplicaciones
1. Seguridad
1. Opciones

## Plugins - Tools

- Escanear Archivos (sandra_scanf)
- Descargar Archivos seguros (sandra_dwl)

## Extras - Tesis

- Core
- WorkFlow
- ORM (Proximamente)

## Referencias

- Desarrollo de codigo limpio
- UML 2.0

# Login

El inicio de sesión promete formular y cubrir amplios aspectos de la seguridad y sus fallas aplicando normas [Web Aplication Firewall](https://es.wikipedia.org/wiki/Web_application_firewall) al mismo tiempo que genera Documentos [Json Web Token](https://jwt.io/), colaborando en el desarrollo y brindando configuraciones basadas en Perfil, Roles, Privilegios.

## Seguridad Informática

<p align="center">
   <img src="https://raw.githubusercontent.com/code-epic/sandra-enterprise/main/img/sec-login.png" width="500px;"/>
</p>

La seguridad informática es una disciplina que se encarga de proteger la integridad y la privacidad de la información almacenada en un sistema informático. De todas formas, no existe ninguna técnica que permita asegurar la inviolabilidad de un sistema. Un sistema informático puede ser protegido desde un punto de vista lógico (con el desarrollo de software). Por otra parte, las amenazas pueden proceder desde programas dañinos que se instalan en la computadora del usuario (como un virus) o llegar por vía remota (los delincuentes que se conectan a Internet e ingresan a distintos sistemas).

Un sistema seguro debe ser íntegro (con información modificable sólo por las personas autorizadas), confidencial (los datos tienen que ser legibles únicamente para los usuarios autorizados), irrefutable (el usuario no debe poder negar las acciones que realizó) y tener buena disponibilidad (debe ser estable). De todas formas, como en la mayoría de los ámbitos de la [seguridad](https://definicion.de/seguridad), lo esencial sigue siendo la capacitación de los usuarios. Una persona que conoce cómo protegerse de las amenazas sabrá utilizar sus recursos de la mejor manera posible para evitar ataques o accidentes. En otras palabras se puede decir que la seguridad depende de las buenas practicas efectuadas por los usuarios frente a las aplicaciones.

Seguridad basada En tokens

Una forma común de manejar la seguridad en tus servicios, es mediante la seguridad basada en tokens. Un Json Web Token es una cadena codificada en base64 formada por 3 partes las cuales están separadas por un punto.

1. Header: Indica el algoritmo y tipo de token
1. Payload: Datos del usuario, caducidad del token, roles del usuario
1. Signature: Incluye una llave secreta para validar el token

Para poder generar los tokens necesitamos:

- LLave secreta: Es una llave que permite validar la información del token
- Issuer: Es quien genera el token, por lo general es la URL del servidor que contiene los servicios
- Audience: Sirve para identificar quienes puedes conectarse a tus servicios, por ejemplo quieres que tus servicios solo sean accesibles con la audiencia www.tusistema.com
- La información adicional que guardas en el token como el id del usuario se conoce como Claims o Reclamaciones. El funcionamiento es el siguiente:
- El usuario inicia sesión ya sea en una aplicación móvil o en navegador. Internamente se envía una petición POST con el usuario y contraseña.
- El servidor valida el usuario y contraseña enviados y genera un token, el cual es básicamente una cadena codificada donde agrega información como el Id del usuario, los roles que tiene el usuario, y el tiempo en el cual es token es válido por ejemplo 1 hora, 2 horas, 1 día, una vez caducado el token el usuario debe volver a iniciar sesión o pedir una renovación del token.
- El navegador o la aplicación recibe el token y lo guarda. Se puede guardar el token en el local storage de la página si es una aplicación web o en los datos tu aplicación móvil. Por motivos de seguridad si guardas el token en el local storage o en un cookie puedes agregar otra validación como por ejemplo la ip de la cual el usuario realizó el login, para que si un hacker obtiene el token e intenta acceder desde otra ciudad o país notificar al usuario para cancelar el token.
- El usuario consulta información del sistema, como por ejemplo la lista de clientes. En el servicio GET para la lista de clientes, en el header se envía el token que el servidor regreso en el paso 2.
- El servidor válida el token si es válido y el usuario tiene permiso para consultar la información regresa la información, si no regresa un código de error (401) No autorizado.

### Cifrado y Protección de Datos

La plataforma implementa una capa de abstracción de seguridad que automatiza el cifrado de fragmentos sensibles antes de su persistencia. La integración con **WAF (Web Application Firewall)** avanzado permite la detección proactiva de ataques de inyección, XSS y DDoS, filtrando el tráfico malicioso antes de que alcance la lógica de negocio.

### Autenticación Robusta (MFA)

El sistema integra **MFA (Multi-Factor Authentication)** mediante algoritmos **TOTP (Time-based One-Time Password)**. Los usuarios deben validar su identidad no solo con credenciales tradicionales, sino también mediante un código dinámico de 6 dígitos generado por aplicaciones de autenticación estándar (como Google Authenticator), fortaleciendo la barrera contra el acceso no autorizado y el robo de identidad.

# Principal

<p align="center">
<img src="https://raw.githubusercontent.com/code-epic/sandra-enterprise/main/img/home.png" width="600px">
</p>

# Redes Informáticas

Red de computadoras (también llamada red de ordenadores o red informática) es un conjunto de equipos nodos y [software](https://es.wikipedia.org/wiki/Software) conectados entre sí por medio de dispositivos físicos o inalámbricos que envían y reciben impulsos eléctricos, ondas electromagnéticas o cualquier otro medio para el transporte de datos, con la finalidad de compartir información, recursos y ofrecer servicios.

## Comunicaciones

Como en todo proceso de [comunicación](https://es.wikipedia.org/wiki/Comunicaci%C3%B3n), se requiere de un emisor, un mensaje, un medio y un receptor. La finalidad principal para la creación de una red de ordenadores es compartir los recursos y la información en la distancia, asegurar la confiabilidad y la disponibilidad de la información, aumentar la velocidad de transmisión de los datos y reducir el costo. Un ejemplo es Internet, el cual es una gran red de millones de ordenadores ubicados en distintos puntos del planeta interconectados básicamente para compartir información y recursos. La estructura y el modo de funcionamiento de las redes informáticas actuales están definidos en varios estándares, siendo el más importante y extendido de todos ellos el modelo TCP/IP utilizado como base para el modelo de referencia OSI. Este último, concibe cada red como estructurada en siete capas con funciones concretas pero relacionadas entre sí (en TCP/IP se habla de cuatro capas). Debe recordarse que el modelo de referencia OSI es una abstracción teórica, que facilita la comprensión del tema, si bien se permiten ciertos desvíos respecto a dicho modelo.

## Conexiones

Acceso o conexión entre equipos es un sistema de enlace con que el computador, dispositivo móvil o red de computadoras cuenta para conectarse entre si, lo que les permite visualizar otros equipos desde un navegador o los diferentes protocolos y/o puertos para acceder a otros servicios que se ofrecen, como sitios web, base de datos, mensajería instantánea, protocolo de transferencia de archivos (FTP), etcétera. Se puede acceder a Internet desde una conexión por línea conmutada (a través de cable coaxial, cables de fibra óptica o cobre), vía satélite, banda ancha móvil y teléfonos celulares o móviles con tecnología 2G/3G/4G/5G. Las empresas que otorgan acceso reciben el nombre de proveedores de servicios (Service Provider).

## Monitoreo de Red y Observabilidad

El módulo de **Monitoreo de Red** de Sandra proporciona una visibilidad profunda del flujo de datos y la salud del sistema:

- **Heartbeat & Latency**: Detección en tiempo real de la latencia entre nodos del clúster y el cliente, con alertas automáticas ante degradaciones de servicio.
- **Análisis de Tráfico**: Visualización de métricas de red a través de gRPC, permitiendo identificar cuellos de botella en la transferencia de grandes volúmenes de datos.
- **Salud de Nodos**: Supervisión constante del estado de los servicios backend (Sandra Server), asegurando que el Balanceo de Carga distribuya las peticiones de manera óptima.

# Bitácora (Logging y Trazabilidad)

La **Bitácora de Sandra** es el componente crítico para el cumplimiento auditivo y el diagnóstico técnico:

- **Trazabilidad de Transacciones**: Cada operación realizada en la consola genera un registro único e inmutable, rastreando quién, cuándo y qué acción se ejecutó.
- **Logs de Auditoría**: Cumplimiento con controles de integridad, donde los logs son firmados digitalmente para prevenir manipulaciones una vez escritos.
- **Visualización de Logs**: Interfaz intuitiva con capacidades de filtrado dinámico por módulo, nivel de error (INFO, WARN, ERROR, FATAL) y tiempo de ejecución.
- **Debugging en Caliente**: Los desarrolladores y administradores pueden inspeccionar el flujo de mensajes entre el cliente y el servidor en tiempo real para resolver incidencias con un tiempo de respuesta (MTTR) reducido.

# Orquestación de Procesos (Fnx Engine)

Sandra DC utiliza un motor de orquestación propietario para manejar tareas de larga duración y alta intensidad computacional:

- **Gestión de PIDs**: Cada instrucción pesada (como escaneos de red o migraciones) se ejecuta en segundo plano, devolviendo un Identificador de Proceso (**PID**) único.
- **Notificaciones Asíncronas**: Mediante WebSockets y un sistema de _polling_ recursivo inteligente, el frontend monitorea el estado del proceso hasta su finalización (`PROCESADO`), garantizando una experiencia de usuario fluida sin bloqueos de interfaz.
- **Escaneo de Infraestructura**: Integración nativa con **Nmap** para el descubrimiento automático de activos de red, identificando dispositivos (Servidores, Routers, Switches, Biométricos) y sus puertos abiertos de forma automatizada.

# Inteligencia Artificial y Soporte

### Sandra IA (Asistente Virtual)

La consola integra un **Asistente Virtual basado en IA** diseñado para facilitar la interacción del usuario con la plataforma:

- **Soporte Contextual**: Respuestas dinámicas a consultas operativas, ayudando a los usuarios a navegar por los módulos de recaudación y auditoría.
- **Interfaz Fluida**: Chat interactivo con efectos de "máquina de escribir" y scroll automático, proporcionando una experiencia de usuario moderna y cercana.
- **Conectividad BackEnd**: Integración directa con funciones de procesamiento de lenguaje natural (NLP) en el backend para resolver dudas complejas en tiempo real.

# Normativas y Estándares Internacionales

El desarrollo y la operación de Sandra están alineados con los marcos más estrictos de la industria:

### ISO/IEC 27001: Gestión de la Seguridad de la Información

Implementamos un **SGSI (Sistema de Gestión de Seguridad de la Información)** que garantiza la Triada de la Seguridad:

- **Confidencialidad**: Solo usuarios autorizados acceden a la información sensible.
- **Integridad**: Protección contra modificaciones no autorizadas.
- **Disponibilidad**: Aseguramos que el sistema esté listo cuando el negocio lo requiera.

### ISO 22301: Continuidad del Negocio

Diseñamos el sistema para la **Resiliencia Operativa**:

- **BIA (Business Impact Analysis)**: Identificamos procesos críticos y establecemos tiempos de recuperación (RTO) y puntos de recuperación (RPO) optimizados.
- **Gestión de Respaldos**: Herramientas integradas para la generación de **Dumps** y **Restores** de bases de datos, permitiendo la recuperación ante desastres en tiempos récord.
- **Alta Disponibilidad**: Arquitectura distribuida que soporta fallos en nodos sin interrupción del servicio al usuario final.

### ISO/IEC 25010: Calidad del Producto Software

Nos regimos por métricas de calidad que incluyen:

- **Adecuación Funcional**: Cubrimos todas las necesidades operativas de la recaudación centralizada.
- **Eficiencia de Desempeño**: Tiempos de respuesta ultra-rápidos gracias al uso de Rust y Go.
- **Mantenibilidad**: Código limpio y modular que permite evoluciones constantes sin riesgo de regresión.

# Referencias Técnicas y Bibliografía

Para sustentar la robustez de **Sandra DC**, se han integrado conceptos y prácticas de las siguientes fuentes:

1.  **Martin, R. C. (2008).** _Clean Code: A Handbook of Agile Software Craftsmanship_. Pearson Education. (Fundamento para la mantenibilidad y legibilidad del código).
2.  **Beyer, B., Jones, C., Petoff, J., & Murphy, N. R. (2016).** _Site Reliability Engineering: How Google Runs Production Systems_. O'Reilly Media. (Principios aplicados en el monitoreo y resiliencia).
3.  **Kleppmann, M. (2017).** _Designing Data-Intensive Applications_. O'Reilly Media. (Arquitectura de sistemas distribuidos y streaming gRPC).
4.  **ISO/IEC 27001.** _Information technology — Security techniques — Information security management systems — Requirements_.
5.  **OWASP Top 10.** _Critical Web Application Security Risks_. (Referencia para la implementación del WAF y seguridad en el Login).
6.  **The Rust Programming Language.** _Documentation and Efficiency Patterns_. (Base para el desarrollo del core de alto rendimiento).
