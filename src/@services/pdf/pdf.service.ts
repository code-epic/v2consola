import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { UtilService } from '../util/util.service';

@Injectable({
  providedIn: 'root'
})

export class PdfService {

  ListadoDeApis(data: any) {
    const tableData = data.map(item => [item.funcion, item.estatus ? 'ACTIVO' : 'INACTIVO', item.version, item.distribucion ? 'COMPARTIDA' : 'PRIVADA', item.metodo]);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // Obtener la longitud del título
    const fontSize = 20;
    const txt = "LISTA DE APIS";
    const textWidth = doc.getStringUnitWidth(txt) * fontSize / doc.internal.scaleFactor;

    // Calcular la posición para centrar el título
    const x = (pageWidth - textWidth) / 2;
    const y = 15; // Altura deseada

    // Agregar el título al documento
    doc.text(txt, x, y);

    doc.setProperties({
      title: "LISTA DE APIS",
      subject: "https://github.com/elpoloxrodriguez",
      author: "SANDRA SERVER",
      keywords: "generated, javascript, web 2.0, ajax",
      creator: "SANDRA SERVER - CODE EPIC TECHNOLOGIES",
    });

    autoTable(doc, {
      head: [['FUNCION', 'ESTATUS', 'DRIVER', 'DISTRIBUCIÓN', 'METODO']],
      body: tableData,
      startY: 20,
      styles: { fillColor: [153, 153, 153], halign: 'center', overflow: "linebreak", fontSize: 9, valign: "middle" },
      columnStyles: { 0: { halign: 'justify' } }
    });

    doc.save("Lista-de-Apis.pdf");
  }

  ListadoDeUsers(data: any) {
    const tableData = data.map(item => [item.nombre, item.login, item.cargo , item.correo, item.sistema]);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // Obtener la longitud del título
    const fontSize = 20;
    const txt = "LISTA DE USUARIOS";
    const textWidth = doc.getStringUnitWidth(txt) * fontSize / doc.internal.scaleFactor;

    // Calcular la posición para centrar el título
    const x = (pageWidth - textWidth) / 2;
    const y = 15; // Altura deseada

    // Agregar el título al documento
    doc.text(txt, x, y);

    doc.setProperties({
      title: "LISTA DE USUARIOS",
      subject: "https://github.com/elpoloxrodriguez",
      author: "SANDRA SERVER",
      keywords: "generated, javascript, web 2.0, ajax",
      creator: "SANDRA SERVER - CODE EPIC TECHNOLOGIES",
    });

    autoTable(doc, {
      head: [['USUARIO', 'LOGIN', 'CARGO', 'CORREO', 'SISTEMA', ]],
      body: tableData,
      startY: 20,
      styles: { fillColor: [153, 153, 153], halign: 'center', overflow: "linebreak", fontSize: 9, valign: "middle" },
      columnStyles: { 0: { halign: 'justify' } }
    });

    doc.save("Lista-de-Usuarios.pdf");
  }

  generarPDF(data: any) {
    console.log(data)
    const pdf = new jsPDF({
      orientation: 'landscape',
      // unit: 'cm',
      // format: [30, 30]
    });


    pdf.html(document.getElementById('tuHTML'))
      .then(() => {
        pdf.save('tu-archivo.pdf');
      })
      .catch(() => {
        console.log('Algo salio mal')
      })
  }

}