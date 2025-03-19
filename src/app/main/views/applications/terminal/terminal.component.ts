import { Component, OnInit } from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  // styleUrls: ['./terminal.component.scss']
  styles: [`
    #terminal {
      width: 100%;
      height: 100%;
      padding: 10px;
      background-color: black; /* Fondo negro */
    }
  `],
})
export class TerminalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {

    const term = new Terminal({
      theme: {
        background: '#000000', // Fondo negro
        foreground: '#FFFFFF', // Texto blanco
        cursor: '#FFFFFF',     // Cursor blanco
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    const terminalElement = document.getElementById('terminal');
    if (terminalElement) {
      // Limpia el contenido del contenedor antes de inicializar la terminal
      terminalElement.innerHTML = '';

      term.open(terminalElement);
      fitAddon.fit(); // Ajusta el tamaño de la terminal al contenedor

      term.writeln('Bienvenido a la terminal en Sandra Server!');

      term.onData((data) => {
        term.write(data); // Aquí puedes enviar los datos a un servidor
      });

      // Ajustar el tamaño de la terminal cuando la ventana cambie de tamaño
      window.addEventListener('resize', () => {
        fitAddon.fit();
      });
    }

  }

}
