import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { UtilService } from '../util/util.service';

@Injectable({
  providedIn: 'root'
})

export class PdfService {

  public rowsAPIS = []

  ListadoDeApis(data: any) {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    doc.setProperties({
      title: "LISTA DE APIS",
      subject: "https://github.com/elpoloxrodriguez",
      author: "SANDRA SERVER",
      keywords: "generated, javascript, web 2.0, ajax",
      creator: "SANDRA SERVER - CODE EPIC TECHNOLOGIES",
    });

    // doc.addImage('assets/images/pdf/sunad.png', "PNG", 10, 10, 20, 25);
    // doc.addImage('assets/images/pdf/fona.png', "PNG", 180, 10, 20, 25);
    // doc.addImage(Qr, "PNG", 170, 255, 30, 30);



    autoTable(doc, {
      styles: { fillColor: [128, 24, 24], halign: 'center' },
      columnStyles: { 0: { halign: 'center', fillColor: [153, 153, 153] } }, // Cells in first column centered and green
      margin: { top: 0 },
      head: [['LISTA DE API-REST']],
      startY: 20,
    })
    this.rowsAPIS.push(data)

    console.log(this.rowsAPIS)


    autoTable(doc, {})
    doc.setFontSize(10);
    doc.setFont(undefined, "");
    autoTable(doc, {
      head: [['FUNCION', 'DRIVER', 'METODO']],
      body: [data[0], data[0], data[0]]
    });



    // autoTable(doc, {
    //   styles: { fillColor: [153, 153, 153], halign: 'center', overflow: "linebreak", fontSize: 9, valign: "middle", },
    //   columnStyles: { 0: { halign: 'justify', } }, // Cells in first column centered and green
    //   head: [['CONCEPTO', 'PERÍODO', 'MONTO', 'DEPÓSITO', 'FECHA']],
    //   body: this.rowsAPIS,
    //   startY: 30,
    // })




    doc.save("Lista-de-Apis.pdf");
    // doc.autoPrint();
    // doc.output("dataurlnewwindow", { filename: 'Certificado.pdf' });
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