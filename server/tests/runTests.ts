import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import xlsx from 'xlsx';
import { SharpImageEngine } from '../services/conversion/image/sharpEngine.js';
import { NodeDocumentEngine } from '../services/conversion/document/nodeDocEngine.js';
import { validateUploadedFile } from '../services/validation/fileValidator.js';
import { initTempDirectories } from '../utils/tempDir.js';

async function runAllTests() {
  console.log('====================================================');
  console.log('           CONVERTIFY LOCAL CONVERSION SUITE        ');
  console.log('====================================================\n');

  initTempDirectories();
  const testDir = path.resolve(process.cwd(), 'temp', 'test_scratch');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  // --- TEST 1: IMAGE CONVERSIONS (SHARP) ---
  console.log('\n--- 1. Testing Image Engine (Sharp) ---');
  const sharpEngine = new SharpImageEngine();

  // Create a synthetic PNG image (100x100 green rectangle)
  const samplePngPath = path.join(testDir, 'sample-input.png');
  await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 4,
      background: { r: 4, g: 102, b: 52, alpha: 1 }, // HH green
    },
  })
    .png()
    .toFile(samplePngPath);

  assert(fs.existsSync(samplePngPath), 'Generate test source PNG');

  // Test PNG -> JPG
  const outJpgPath = path.join(testDir, 'out-sample.jpg');
  const resJpg = await sharpEngine.convert(samplePngPath, outJpgPath, 'png', 'jpg', { quality: 90 });
  assert(resJpg.success && fs.existsSync(outJpgPath) && resJpg.bytesWritten > 0, 'Convert PNG -> JPG');

  // Test PNG -> WEBP
  const outWebpPath = path.join(testDir, 'out-sample.webp');
  const resWebp = await sharpEngine.convert(samplePngPath, outWebpPath, 'png', 'webp', { quality: 85 });
  assert(resWebp.success && fs.existsSync(outWebpPath) && resWebp.bytesWritten > 0, 'Convert PNG -> WEBP');

  // Test WEBP -> JPG
  const outWebpToJpg = path.join(testDir, 'out-webp-to-jpg.jpg');
  const resW2J = await sharpEngine.convert(outWebpPath, outWebpToJpg, 'webp', 'jpg');
  assert(resW2J.success && fs.existsSync(outWebpToJpg) && resW2J.bytesWritten > 0, 'Convert WEBP -> JPG');

  // Test PNG -> AVIF
  const outAvifPath = path.join(testDir, 'out-sample.avif');
  const resAvif = await sharpEngine.convert(samplePngPath, outAvifPath, 'png', 'avif', { quality: 75 });
  assert(resAvif.success && fs.existsSync(outAvifPath) && resAvif.bytesWritten > 0, 'Convert PNG -> AVIF');

  // --- TEST 2: DOCUMENT CONVERSIONS (NODE DOC ENGINE) ---
  console.log('\n--- 2. Testing Document Engine (Native Node) ---');
  const docEngine = new NodeDocumentEngine();

  // Test TXT -> PDF
  const sampleTxtPath = path.join(testDir, 'sample-doc.txt');
  const sampleText = `# Convertify Report\nLocal-first file conversion designed for builders.\nZero cloud dependencies, maximum privacy.\nAll files stay securely on your workstation.\n`;
  await fs.promises.writeFile(sampleTxtPath, sampleText, 'utf8');

  const outPdfPath = path.join(testDir, 'out-text.pdf');
  const resPdf = await docEngine.convert(sampleTxtPath, outPdfPath, 'txt', 'pdf');
  assert(resPdf.success && fs.existsSync(outPdfPath) && resPdf.bytesWritten > 0, 'Convert TXT -> PDF');

  // Test TXT -> DOCX
  const outDocxPath = path.join(testDir, 'out-text.docx');
  const resDocx = await docEngine.convert(sampleTxtPath, outDocxPath, 'txt', 'docx');
  assert(resDocx.success && fs.existsSync(outDocxPath) && resDocx.bytesWritten > 0, 'Convert TXT -> DOCX');

  // Test DOCX -> TXT
  const outDocxToTxt = path.join(testDir, 'out-docx-extracted.txt');
  const resDocxToTxt = await docEngine.convert(outDocxPath, outDocxToTxt, 'docx', 'txt');
  const extractedText = await fs.promises.readFile(outDocxToTxt, 'utf8');
  assert(
    resDocxToTxt.success && extractedText.includes('Convertify Report'),
    'Convert DOCX -> TXT (Extraction)'
  );

  // Test DOCX -> HTML
  const outDocxToHtml = path.join(testDir, 'out-docx.html');
  const resDocxToHtml = await docEngine.convert(outDocxPath, outDocxToHtml, 'docx', 'html');
  assert(resDocxToHtml.success && fs.existsSync(outDocxToHtml), 'Convert DOCX -> HTML');

  // Test PDF -> TXT
  const outPdfToTxt = path.join(testDir, 'out-pdf-extracted.txt');
  const resPdfToTxt = await docEngine.convert(outPdfPath, outPdfToTxt, 'pdf', 'txt');
  const pdfExtracted = await fs.promises.readFile(outPdfToTxt, 'utf8');
  assert(
    resPdfToTxt.success && pdfExtracted.includes('Convertify Report'),
    'Convert PDF -> TXT (Text Extraction)'
  );

  // Test PDF -> DOCX
  const outPdfToDocx = path.join(testDir, 'out-pdf-to-docx.docx');
  const resPdfToDocx = await docEngine.convert(outPdfPath, outPdfToDocx, 'pdf', 'docx');
  assert(resPdfToDocx.success && fs.existsSync(outPdfToDocx), 'Convert PDF -> DOCX');

  // Test XLSX -> CSV
  const sampleXlsxPath = path.join(testDir, 'sample-data.xlsx');
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet([
    ['Product', 'Category', 'Status'],
    ['Convertify', 'Local Utility', 'Active'],
    ['HH Goa 2026', 'Community', 'Inspired'],
  ]);
  xlsx.utils.book_append_sheet(wb, ws, 'Data');
  xlsx.writeFile(wb, sampleXlsxPath);

  const outCsvPath = path.join(testDir, 'out-data.csv');
  const resCsv = await docEngine.convert(sampleXlsxPath, outCsvPath, 'xlsx', 'csv');
  const csvContent = await fs.promises.readFile(outCsvPath, 'utf8');
  assert(
    resCsv.success && csvContent.includes('Convertify,Local Utility,Active'),
    'Convert XLSX -> CSV'
  );

  // --- TEST 3: FILE VALIDATION & SECURITY ---
  console.log('\n--- 3. Testing File Validation & Security ---');

  // Valid PNG file validation
  const validCheck = await validateUploadedFile(samplePngPath, 'sample.png', 'image/png');
  assert(validCheck.isValid && validCheck.detectedFormat === 'png', 'Validate genuine PNG file');

  // Empty file validation
  const emptyFilePath = path.join(testDir, 'empty.txt');
  await fs.promises.writeFile(emptyFilePath, Buffer.alloc(0));
  const emptyCheck = await validateUploadedFile(emptyFilePath, 'empty.txt', 'text/plain');
  assert(!emptyCheck.isValid && emptyCheck.errorCode === 'EMPTY_FILE', 'Reject empty file');

  // Clean up test scratch
  try {
    const files = await fs.promises.readdir(testDir);
    for (const f of files) {
      await fs.promises.unlink(path.join(testDir, f));
    }
    await fs.promises.rmdir(testDir);
  } catch {
    // ignore cleanup error
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
