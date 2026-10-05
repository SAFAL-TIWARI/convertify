import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as docx from 'docx';
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { ConversionEngine, ConversionResult } from '../engineInterface.js';

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item: any) => item.str || '')
      .filter(Boolean);
    pageTexts.push(strings.join(' '));
  }

  return pageTexts.join('\n\n');
}

export class NodeDocumentEngine implements ConversionEngine {
  readonly name = 'Native Node Document Engine';

  private supportedConversions: Record<string, string[]> = {
    txt: ['pdf', 'docx', 'md', 'html'],
    md: ['pdf', 'docx', 'txt', 'html'],
    docx: ['txt', 'html', 'md', 'pdf'], // note: docx->pdf when libreoffice is missing can output formatted text PDF
    pdf: ['txt', 'docx', 'html'],
    html: ['txt', 'md', 'pdf'],
    xlsx: ['csv', 'html', 'txt', 'json'],
    xls: ['csv', 'html', 'txt', 'xlsx'],
    csv: ['xlsx', 'html', 'txt', 'json'],
  };

  isAvailable(): boolean {
    return true; // Native libraries are always available
  }

  canConvert(inputFormat: string, outputFormat: string): boolean {
    const normIn = inputFormat.toLowerCase().replace(/^\./, '');
    const normOut = outputFormat.toLowerCase().replace(/^\./, '');
    if (normIn === normOut) return false;

    const available = this.supportedConversions[normIn];
    return Boolean(available && available.includes(normOut));
  }

  async convert(
    inputPath: string,
    outputPath: string,
    inputFormat: string,
    outputFormat: string
  ): Promise<ConversionResult> {
    const normIn = inputFormat.toLowerCase().replace(/^\./, '');
    const normOut = outputFormat.toLowerCase().replace(/^\./, '');

    try {
      // 1. TXT / MD -> PDF
      if ((normIn === 'txt' || normIn === 'md' || normIn === 'html') && normOut === 'pdf') {
        let content = await fs.promises.readFile(inputPath, 'utf8');
        if (normIn === 'html') {
          content = content.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ');
        }
        await this.convertTextToPdf(content, outputPath);
        return this.verifyOutput(outputPath);
      }

      // 2. TXT / MD -> DOCX
      if ((normIn === 'txt' || normIn === 'md') && normOut === 'docx') {
        const content = await fs.promises.readFile(inputPath, 'utf8');
        await this.convertTextToDocx(content, outputPath);
        return this.verifyOutput(outputPath);
      }

      // 3. DOCX -> TXT
      if (normIn === 'docx' && normOut === 'txt') {
        const result = await mammoth.extractRawText({ path: inputPath });
        await fs.promises.writeFile(outputPath, result.value, 'utf8');
        return this.verifyOutput(outputPath);
      }

      // 4. DOCX -> HTML
      if (normIn === 'docx' && normOut === 'html') {
        const result = await mammoth.convertToHtml({ path: inputPath });
        const htmlDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Converted Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #111; }
    h1, h2, h3 { font-family: serif; color: #046634; }
  </style>
</head>
<body>
${result.value}
</body>
</html>`;
        await fs.promises.writeFile(outputPath, htmlDoc, 'utf8');
        return this.verifyOutput(outputPath);
      }

      // 5. DOCX -> MD
      if (normIn === 'docx' && normOut === 'md') {
        const result = await mammoth.extractRawText({ path: inputPath });
        await fs.promises.writeFile(outputPath, result.value, 'utf8');
        return this.verifyOutput(outputPath);
      }

      // 6. DOCX -> PDF (Text reconstruction when LibreOffice is not installed)
      if (normIn === 'docx' && normOut === 'pdf') {
        const result = await mammoth.extractRawText({ path: inputPath });
        await this.convertTextToPdf(result.value, outputPath);
        return this.verifyOutput(outputPath);
      }

      // 7. PDF -> TXT
      if (normIn === 'pdf' && normOut === 'txt') {
        const dataBuffer = await fs.promises.readFile(inputPath);
        const text = await extractTextFromPdf(dataBuffer);
        await fs.promises.writeFile(outputPath, text || '', 'utf8');
        return this.verifyOutput(outputPath);
      }

      // 8. PDF -> DOCX
      if (normIn === 'pdf' && normOut === 'docx') {
        const dataBuffer = await fs.promises.readFile(inputPath);
        const text = await extractTextFromPdf(dataBuffer);
        await this.convertTextToDocx(text || '', outputPath);
        return this.verifyOutput(outputPath);
      }

      // 9. PDF -> HTML
      if (normIn === 'pdf' && normOut === 'html') {
        const dataBuffer = await fs.promises.readFile(inputPath);
        const text = await extractTextFromPdf(dataBuffer);
        const escaped = (text || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PDF Content</title>
  <style>
    body { font-family: sans-serif; white-space: pre-wrap; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.5; }
  </style>
</head>
<body>${escaped}</body>
</html>`;
        await fs.promises.writeFile(outputPath, html, 'utf8');
        return this.verifyOutput(outputPath);
      }

      // 10. Spreadsheets: XLSX / XLS / CSV conversions
      if (normIn === 'xlsx' || normIn === 'xls' || normIn === 'csv') {
        const workbook = xlsx.readFile(inputPath);
        const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
        const worksheet = workbook.Sheets[firstSheetName];

        if (normOut === 'csv') {
          const csvData = xlsx.utils.sheet_to_csv(worksheet);
          await fs.promises.writeFile(outputPath, csvData, 'utf8');
          return this.verifyOutput(outputPath);
        }

        if (normOut === 'html') {
          const htmlData = xlsx.utils.sheet_to_html(worksheet);
          const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${firstSheetName}</title>
  <style>
    table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
    th, td { border: 1px solid #ccc; padding: 6px 12px; text-align: left; }
    th { background: #f7f1dc; color: #046634; font-weight: bold; }
  </style>
</head>
<body>${htmlData}</body>
</html>`;
          await fs.promises.writeFile(outputPath, fullHtml, 'utf8');
          return this.verifyOutput(outputPath);
        }

        if (normOut === 'json') {
          const jsonData = xlsx.utils.sheet_to_json(worksheet);
          await fs.promises.writeFile(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');
          return this.verifyOutput(outputPath);
        }

        if (normOut === 'txt') {
          const csvData = xlsx.utils.sheet_to_csv(worksheet, { FS: '\t' });
          await fs.promises.writeFile(outputPath, csvData, 'utf8');
          return this.verifyOutput(outputPath);
        }

        if (normOut === 'xlsx' && (normIn === 'csv' || normIn === 'xls')) {
          xlsx.writeFile(workbook, outputPath, { bookType: 'xlsx' });
          return this.verifyOutput(outputPath);
        }
      }

      // 11. HTML -> TXT / MD
      if (normIn === 'html') {
        const content = await fs.promises.readFile(inputPath, 'utf8');
        const stripped = content
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\n\s*\n/g, '\n\n')
          .trim();
        await fs.promises.writeFile(outputPath, stripped, 'utf8');
        return this.verifyOutput(outputPath);
      }

      return {
        success: false,
        bytesWritten: 0,
        error: `Native document engine cannot convert ${normIn.toUpperCase()} to ${normOut.toUpperCase()}.`,
      };
    } catch (err: any) {
      console.error('[NodeDocumentEngine] Conversion failed:', err);
      return {
        success: false,
        bytesWritten: 0,
        error: err?.message || 'Document conversion error during processing.',
      };
    }
  }

  private async convertTextToPdf(text: string, outputPath: string): Promise<void> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 10;
    const lineHeight = 14;
    const margin = 50;
    const pageWidth = 595.28; // Standard A4 points
    const pageHeight = 841.89;
    const printableWidth = pageWidth - margin * 2;
    const maxLinesPerPage = Math.floor((pageHeight - margin * 2 - 20) / lineHeight);

    // Split text into words and wrap lines
    const rawLines = text.split(/\r?\n/);
    const wrappedLines: string[] = [];

    for (const rawLine of rawLines) {
      if (!rawLine.trim()) {
        wrappedLines.push('');
        continue;
      }
      const words = rawLine.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (textWidth < printableWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) wrappedLines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) wrappedLines.push(currentLine);
    }

    if (wrappedLines.length === 0) {
      wrappedLines.push('(Empty Document)');
    }

    let lineIndex = 0;
    let pageNum = 1;
    const totalPages = Math.ceil(wrappedLines.length / maxLinesPerPage) || 1;

    while (lineIndex < wrappedLines.length || pageNum === 1) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      // Draw lines directly without injecting any format title on top

      // Draw lines
      let linesOnPage = 0;
      while (lineIndex < wrappedLines.length && linesOnPage < maxLinesPerPage) {
        const line = wrappedLines[lineIndex];
        if (line) {
          // Check for basic Markdown headers
          if (line.startsWith('# ')) {
            page.drawText(line.replace('# ', ''), {
              x: margin,
              y,
              size: 12,
              font: fontBold,
              color: rgb(0.015, 0.4, 0.204),
            });
          } else {
            page.drawText(line, {
              x: margin,
              y,
              size: fontSize,
              font,
              color: rgb(0.067, 0.067, 0.067),
            });
          }
        }
        y -= lineHeight;
        lineIndex++;
        linesOnPage++;
      }

      // Subtle page number
      page.drawText(`Page ${pageNum} of ${totalPages}`, {
        x: margin,
        y: margin - 20,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      pageNum++;
      if (lineIndex >= wrappedLines.length) break;
    }

    const pdfBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, pdfBytes);
  }

  private async convertTextToDocx(text: string, outputPath: string): Promise<void> {
    const lines = text.split(/\r?\n/);
    const paragraphs: docx.Paragraph[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push(new docx.Paragraph({ text: '' }));
      } else if (trimmed.startsWith('# ')) {
        paragraphs.push(
          new docx.Paragraph({
            text: trimmed.replace('# ', ''),
            heading: docx.HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (trimmed.startsWith('## ')) {
        paragraphs.push(
          new docx.Paragraph({
            text: trimmed.replace('## ', ''),
            heading: docx.HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else {
        paragraphs.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: line,
                font: 'Calibri',
                size: 22, // 11pt
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }

    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await docx.Packer.toBuffer(doc);
    await fs.promises.writeFile(outputPath, buffer);
  }

  private async verifyOutput(outputPath: string): Promise<ConversionResult> {
    const stats = await fs.promises.stat(outputPath);
    if (stats.size === 0) {
      return {
        success: false,
        bytesWritten: 0,
        error: 'Output document was generated but is empty.',
      };
    }
    return {
      success: true,
      bytesWritten: stats.size,
    };
  }
}
