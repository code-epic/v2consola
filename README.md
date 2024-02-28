# Panel de Control - Consola
Una vez instalada la plataforma podra acceder al **Panel** mediante la siguiente URL.

`https://localhost/panel`

En informática y ciencias de la computación, en particular en análisis y diseño orientado a objetos, el término lógica de negocio es la parte de un sistema que se encarga de codificar las reglas de negocio del mundo real que determinan cómo la información puede ser creada, almacenada y cambiada. En programación es una de las capas del modelo MVC Modelo–vista–controlador separando así la complejidad del desarrollo en capas independientes.

Son rutinas que realizan entradas de datos, consultas a los datos, generación de informes y más específicamente todo el procesamiento que se realiza detrás de la aplicación visible para el usuario (Backend).

En el contexto de la orientación a objetos, la lógica del negocio es tomada como aquella funcionalidad ofrecida por el software. El software se comunica de manera amigable con el usuario a partir de la interfaz, pero el procesamiento de los datos capturados como entrada y la posterior entrega de resultados al usuario por medio de la interfaz, es conocido como la Lógica de Negocio.

_A fines de implementar un modelo que ayude al mismo tiempo que regule las empresas descentralizadas a una recaudación centralizada de la misma estableciendo sus parámetros de negocio analizando sus productos._

***

## Navegación
1. Login
1. Principal
1. Redes Informaticas
1. Herramientas
1. Aplicaciones
1. Seguridad
1. Opciones

## Plugins - Tools
* Escanear Archivos (sandra_scanf)
* Descargar Archivos seguros (sandra_dwl)

## Extras - Tesis
* Core
* WorkFlow
* ORM (Proximamente)

## Referencias
* Desarrollo de codigo limpio
* UML 2.0


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

* LLave secreta: Es una llave que permite validar la información del token
* Issuer: Es quien genera el token, por lo general es la URL del servidor que contiene los servicios
* Audience: Sirve para identificar quienes puedes conectarse a tus servicios, por ejemplo quieres que tus servicios solo sean accesibles con la audiencia www.tusistema.com
* La información adicional que guardas en el token como el id del usuario se conoce como Claims o Reclamaciones. El funcionamiento es el siguiente:
* El usuario inicia sesión ya sea en una aplicación móvil o en navegador. Internamente se envía una petición POST con el usuario y contraseña.
* El servidor valida el usuario y contraseña enviados y genera un token, el cual es básicamente una cadena codificada donde agrega información como el Id del usuario, los roles que tiene el usuario, y el tiempo en el cual es token es válido por ejemplo 1 hora, 2 horas, 1 día, una vez caducado el token el usuario debe volver a iniciar sesión o pedir una renovación del token.
* El navegador o la aplicación recibe el token y lo guarda. Se puede guardar el token en el local storage de la página si es una aplicación web o en los datos tu aplicación móvil. Por motivos de seguridad si guardas el token en el local storage o en un cookie puedes agregar otra validación como por ejemplo la ip de la cual el usuario realizó el login, para que si un hacker obtiene el token e intenta acceder desde otra ciudad o país notificar al usuario para cancelar el token.
* El usuario consulta información del sistema, como por ejemplo la lista de clientes. En el servicio GET para la lista de clientes, en el header se envía el token que el servidor regreso en el paso 2.
* El servidor válida el token si es válido y el usuario tiene permiso para consultar la información regresa la información, si no regresa un código de error (401) No autorizado.

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

