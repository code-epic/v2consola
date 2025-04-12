import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('terminalContainer') terminalContainer!: ElementRef;
  @ViewChild('terminalElement') terminalElement!: ElementRef;

  private term!: Terminal;
  private fitAddon = new FitAddon();
  private commandBuffer = '';

  ngAfterViewInit(): void {
    this.initializeTerminal();
    setTimeout(() => this.fitTerminal(), 100);
  }

  ngOnDestroy(): void {
    this.term?.dispose();
  }

  private initializeTerminal(): void {
    this.term = new Terminal({
      theme: {
        background: '#1E1E1E',
        foreground: '#E0E0E0',  // Color más brillante para mejor visibilidad
        cursor: '#FFFFFF',
      },
      fontSize: 14,
      fontFamily: '"Courier New", monospace',
      cursorBlink: true,
      convertEol: true,         // Conversión de fin de línea
      disableStdin: false       // Asegurar que la entrada está habilitada
    });

    this.term.loadAddon(this.fitAddon);
    this.term.open(this.terminalElement.nativeElement);

    // Mensaje de bienvenida con color
    this.term.writeln('\x1b[1;33mBienvenido a Sandra Server!\x1b[0m');
    this.writePrompt();

    // Manejo de entrada de teclado
    this.term.onData((data) => {
      if (data === '\r') { // Enter
        this.handleCommand();
      } else if (data === '\u007f') { // Backspace
        this.handleBackspace();
      } else if (data >= ' ' && data <= '~') { // Caracteres imprimibles
        this.handleCharacter(data);
      }
    });
  }

  private writePrompt(): void {
    this.term.write('\x1b[1;32muser@server:~$\x1b[0m ');
  }

  private handleCommand(): void {
    this.term.writeln(''); // Nueva línea
    if (this.commandBuffer.trim()) {
      this.term.writeln(`\x1b[1;36mEjecutando: ${this.commandBuffer}\x1b[0m`);
    }
    this.commandBuffer = '';
    this.writePrompt();
  }

  private handleBackspace(): void {
    if (this.commandBuffer.length > 0) {
      this.commandBuffer = this.commandBuffer.slice(0, -1);
      this.term.write('\b \b');
    }
  }

  private handleCharacter(char: string): void {
    this.commandBuffer += char;
    this.term.write(char);
  }

  private fitTerminal(): void {
    try {
      if (this.terminalElement?.nativeElement && this.terminalContainer?.nativeElement) {
        this.fitAddon.fit();
        // Forzar repintado de toda la pantalla
        this.term?.refresh(0, this.term.rows - 1);
      }
    } catch (e) {
      console.error('Error ajustando terminal:', e);
    }
  }
}