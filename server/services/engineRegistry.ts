import { ConversionEngine } from './conversion/engineInterface.js';
import { SharpImageEngine } from './conversion/image/sharpEngine.js';
import { NodeDocumentEngine } from './conversion/document/nodeDocEngine.js';
import { LibreOfficeEngine } from './conversion/document/libreOfficeEngine.js';
import {
  AudioEnginePlaceholder,
  VideoEnginePlaceholder,
  ArchiveEnginePlaceholder,
} from './conversion/placeholders/futureEngines.js';
import {
  FormatDefinition,
  DiagnosticsResponse,
  ConversionPair,
  FileCategory,
} from '../../shared/types/index.js';
import { CONFIG } from '../config.js';

export class EngineRegistry {
  private sharpEngine: SharpImageEngine;
  private nodeDocEngine: NodeDocumentEngine;
  private libreOfficeEngine: LibreOfficeEngine;
  private audioEngine: AudioEnginePlaceholder;
  private videoEngine: VideoEnginePlaceholder;
  private archiveEngine: ArchiveEnginePlaceholder;

  private engines: ConversionEngine[];

  constructor() {
    this.sharpEngine = new SharpImageEngine();
    this.nodeDocEngine = new NodeDocumentEngine();
    this.libreOfficeEngine = new LibreOfficeEngine();
    this.audioEngine = new AudioEnginePlaceholder();
    this.videoEngine = new VideoEnginePlaceholder();
    this.archiveEngine = new ArchiveEnginePlaceholder();

    this.engines = [
      this.sharpEngine,
      this.libreOfficeEngine,
      this.nodeDocEngine,
      this.audioEngine,
      this.videoEngine,
      this.archiveEngine,
    ];
  }

  /**
   * Finds the best active engine that can handle this conversion
   */
  findEngine(inputFormat: string, outputFormat: string): ConversionEngine | null {
    const inExt = inputFormat.toLowerCase().replace(/^\./, '');
    const outExt = outputFormat.toLowerCase().replace(/^\./, '');

    // Prefer Sharp for images
    if (this.sharpEngine.canConvert(inExt, outExt)) {
      return this.sharpEngine;
    }

    // If LibreOffice is installed and can convert, use it (especially for full office formats)
    if (this.libreOfficeEngine.canConvert(inExt, outExt)) {
      return this.libreOfficeEngine;
    }

    // Fallback to Native Node Document Engine
    if (this.nodeDocEngine.canConvert(inExt, outExt)) {
      return this.nodeDocEngine;
    }

    return null;
  }

  /**
   * Central formats catalog showing both active and planned formats
   */
  getFormatsCatalog(): {
    activeCategories: FileCategory[];
    inactiveCategories: FileCategory[];
    formats: Record<string, FormatDefinition>;
    popularPairs: ConversionPair[];
  } {
    const formats: Record<string, FormatDefinition> = {
      // Active Documents
      pdf: {
        ext: 'pdf',
        name: 'Portable Document Format',
        category: 'document',
        mimeType: 'application/pdf',
        isActive: true,
        outputs: this.getOutputsFor('pdf'),
        description: 'Standard digital document format preserving fonts and vector formatting.',
      },
      docx: {
        ext: 'docx',
        name: 'Microsoft Word Document',
        category: 'document',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        isActive: true,
        outputs: this.getOutputsFor('docx'),
        description: 'Office Open XML word processing document with rich styles.',
      },
      txt: {
        ext: 'txt',
        name: 'Plain Text Document',
        category: 'document',
        mimeType: 'text/plain',
        isActive: true,
        outputs: this.getOutputsFor('txt'),
        description: 'Universal unformatted plain text file.',
      },
      md: {
        ext: 'md',
        name: 'Markdown Document',
        category: 'document',
        mimeType: 'text/markdown',
        isActive: true,
        outputs: this.getOutputsFor('md'),
        description: 'Lightweight markup language with plain text formatting syntax.',
      },
      html: {
        ext: 'html',
        name: 'HyperText Markup Language',
        category: 'document',
        mimeType: 'text/html',
        isActive: true,
        outputs: this.getOutputsFor('html'),
        description: 'Standard markup language for documents designed to be displayed in a web browser.',
      },
      xlsx: {
        ext: 'xlsx',
        name: 'Microsoft Excel Spreadsheet',
        category: 'document',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        isActive: true,
        outputs: this.getOutputsFor('xlsx'),
        description: 'Spreadsheet format containing data in rows and columns.',
      },
      csv: {
        ext: 'csv',
        name: 'Comma-Separated Values',
        category: 'document',
        mimeType: 'text/csv',
        isActive: true,
        outputs: this.getOutputsFor('csv'),
        description: 'Delimited text file using commas to separate tabular values.',
      },

      // Active Images
      jpg: {
        ext: 'jpg',
        name: 'JPEG Image',
        category: 'image',
        mimeType: 'image/jpeg',
        isActive: true,
        outputs: this.getOutputsFor('jpg'),
        description: 'Standard lossy photographic image format with high compression.',
      },
      png: {
        ext: 'png',
        name: 'Portable Network Graphics',
        category: 'image',
        mimeType: 'image/png',
        isActive: true,
        outputs: this.getOutputsFor('png'),
        description: 'Lossless raster-graphics format with full alpha transparency support.',
      },
      webp: {
        ext: 'webp',
        name: 'WebP Image',
        category: 'image',
        mimeType: 'image/webp',
        isActive: true,
        outputs: this.getOutputsFor('webp'),
        description: 'Modern image format providing superior lossless and lossy compression for web.',
      },
      avif: {
        ext: 'avif',
        name: 'AV1 Image File Format',
        category: 'image',
        mimeType: 'image/avif',
        isActive: true,
        outputs: this.getOutputsFor('avif'),
        description: 'Next-generation open image compression format based on AV1 video coding.',
      },
      tiff: {
        ext: 'tiff',
        name: 'Tagged Image File Format',
        category: 'image',
        mimeType: 'image/tiff',
        isActive: true,
        outputs: this.getOutputsFor('tiff'),
        description: 'Flexible, adaptable file format for handling high color-depth images.',
      },
      gif: {
        ext: 'gif',
        name: 'Graphics Interchange Format',
        category: 'image',
        mimeType: 'image/gif',
        isActive: true,
        outputs: this.getOutputsFor('gif'),
        description: 'Bitmap image format supporting 256 colors and frames animation.',
      },

      // Coming Soon Categories & Formats
      mp3: {
        ext: 'mp3',
        name: 'MPEG-1 Audio Layer III',
        category: 'audio',
        mimeType: 'audio/mpeg',
        isActive: false,
        outputs: [],
        description: 'Coming soon. Audio processing pipeline scheduled in future updates.',
      },
      wav: {
        ext: 'wav',
        name: 'Waveform Audio File',
        category: 'audio',
        mimeType: 'audio/wav',
        isActive: false,
        outputs: [],
        description: 'Coming soon. Uncompressed audio format.',
      },
      flac: {
        ext: 'flac',
        name: 'Free Lossless Audio Codec',
        category: 'audio',
        mimeType: 'audio/flac',
        isActive: false,
        outputs: [],
        description: 'Coming soon. Lossless audio compression format.',
      },
      mp4: {
        ext: 'mp4',
        name: 'MPEG-4 Part 14 Video',
        category: 'video',
        mimeType: 'video/mp4',
        isActive: false,
        outputs: [],
        description: 'Coming soon. FFmpeg integration placeholder.',
      },
      webm: {
        ext: 'webm',
        name: 'WebM Video',
        category: 'video',
        mimeType: 'video/webm',
        isActive: false,
        outputs: [],
        description: 'Coming soon. Open media container format.',
      },
      zip: {
        ext: 'zip',
        name: 'ZIP Archive',
        category: 'archive',
        mimeType: 'application/zip',
        isActive: false,
        outputs: [],
        description: 'Coming soon. Archive file format supporting lossless data compression.',
      },
      tar: {
        ext: 'tar',
        name: 'Tape Archive',
        category: 'archive',
        mimeType: 'application/x-tar',
        isActive: false,
        outputs: [],
        description: 'Coming soon. Consolidated multi-file archive.',
      },
      epub: {
        ext: 'epub',
        name: 'Electronic Publication',
        category: 'ebook',
        mimeType: 'application/epub+zip',
        isActive: false,
        outputs: [],
        description: 'Coming soon. E-reader standard digital book format.',
      },
      ttf: {
        ext: 'ttf',
        name: 'TrueType Font',
        category: 'font',
        mimeType: 'font/ttf',
        isActive: false,
        outputs: [],
        description: 'Coming soon. Outline font standard.',
      },
      dwg: {
        ext: 'dwg',
        name: 'AutoCAD Drawing',
        category: 'cad',
        mimeType: 'application/acad',
        isActive: false,
        outputs: [],
        description: 'Coming soon. Computer-aided design format.',
      },
      svg: {
        ext: 'svg',
        name: 'Scalable Vector Graphics',
        category: 'vector',
        mimeType: 'image/svg+xml',
        isActive: false,
        outputs: [],
        description: 'Coming soon. XML-based vector graphics.',
      },
    };

    // If LibreOffice is detected, dynamically enable full Office formats
    if (this.libreOfficeEngine.isAvailable()) {
      const officeExtras: Array<{ ext: string; name: string; mime: string; desc: string }> = [
        { ext: 'doc', name: 'Legacy Microsoft Word', mime: 'application/msword', desc: 'Binary format for Word 97-2003.' },
        { ext: 'ppt', name: 'Legacy Microsoft PowerPoint', mime: 'application/vnd.ms-powerpoint', desc: 'Presentation format for PowerPoint 97-2003.' },
        { ext: 'pptx', name: 'Microsoft PowerPoint Presentation', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', desc: 'XML-based presentation slides format.' },
        { ext: 'odt', name: 'OpenDocument Text', mime: 'application/vnd.oasis.opendocument.text', desc: 'Open standard word processing document.' },
        { ext: 'rtf', name: 'Rich Text Format', mime: 'application/rtf', desc: 'Cross-platform document interchange format.' },
      ];

      for (const item of officeExtras) {
        formats[item.ext] = {
          ext: item.ext,
          name: item.name,
          category: 'document',
          mimeType: item.mime,
          isActive: true,
          outputs: this.getOutputsFor(item.ext),
          description: item.desc,
        };
      }
    }

    const popularPairs: ConversionPair[] = [
      { from: 'pdf', to: 'docx', label: 'PDF to Word', category: 'document', description: 'Reconstruct document content into editable DOCX format.' },
      { from: 'docx', to: 'pdf', label: 'Word to PDF', category: 'document', description: 'Generate publication-ready PDF with clean text and typography.' },
      { from: 'txt', to: 'pdf', label: 'Text to PDF', category: 'document', description: 'Transform raw notes and code into paginated A4 PDF documents.' },
      { from: 'xlsx', to: 'csv', label: 'Excel to CSV', category: 'document', description: 'Export spreadsheet tables to universal comma-separated data.' },
      { from: 'jpg', to: 'png', label: 'JPG to PNG', category: 'image', description: 'Convert photographic images to lossless graphics with crisp lines.' },
      { from: 'png', to: 'webp', label: 'PNG to WebP', category: 'image', description: 'Dramatically reduce web image size while retaining transparency.' },
      { from: 'webp', to: 'jpg', label: 'WebP to JPG', category: 'image', description: 'Ensure universal device compatibility for modern WebP captures.' },
      { from: 'png', to: 'avif', label: 'PNG to AV1 Image', category: 'image', description: 'Next-gen AVIF compression delivering pristine visual fidelity.' },
    ];

    return {
      activeCategories: ['document', 'image'],
      inactiveCategories: ['audio', 'video', 'archive', 'ebook', 'cad', 'font', 'vector'],
      formats,
      popularPairs,
    };
  }

  private getOutputsFor(inputExt: string): string[] {
    const norm = inputExt.toLowerCase().replace(/^\./, '');
    const validOutputs: string[] = [];

    // Check potential output formats
    const candidateOutputs = [
      'pdf', 'docx', 'txt', 'html', 'md', 'xlsx', 'csv', 'json',
      'png', 'jpg', 'webp', 'avif', 'tiff', 'gif'
    ];

    for (const out of candidateOutputs) {
      if (out === norm) continue;
      if (
        this.sharpEngine.canConvert(norm, out) ||
        this.libreOfficeEngine.canConvert(norm, out) ||
        this.nodeDocEngine.canConvert(norm, out)
      ) {
        validOutputs.push(out);
      }
    }

    return validOutputs;
  }

  getDiagnostics(): DiagnosticsResponse {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      engines: {
        sharp: {
          name: 'Sharp Image Processing Engine',
          version: '0.33.5',
          status: 'READY',
          description: 'High-performance libvips image pipeline (JPG, PNG, WEBP, AVIF, TIFF, GIF)',
          requiredFor: ['jpg', 'png', 'webp', 'avif', 'tiff', 'gif', 'bmp'],
        },
        nodeDocument: {
          name: 'Native Node Document Engine',
          version: '1.0.0',
          status: 'READY',
          description: 'Local PDF-Lib, Mammoth, Docx, and SheetJS processor with zero external binaries',
          requiredFor: ['txt', 'md', 'docx', 'pdf', 'xlsx', 'csv', 'html'],
        },
        libreOffice: {
          name: 'LibreOffice Headless Suite',
          version: this.libreOfficeEngine.isAvailable() ? 'Detected' : undefined,
          status: this.libreOfficeEngine.isAvailable() ? 'READY' : 'NOT_INSTALLED',
          description: this.libreOfficeEngine.isAvailable()
            ? `Active binary: ${this.libreOfficeEngine.getBinaryPath()}`
            : 'External office suite. Optional: install LibreOffice to unlock legacy PPT, ODT, and DOC conversions.',
          requiredFor: ['doc', 'ppt', 'pptx', 'odt', 'rtf'],
        },
        ffmpeg: {
          name: 'FFmpeg Audio / Video Engine',
          status: 'COMING_SOON',
          description: 'Future media transcoding subsystem. Currently disabled as requested.',
          requiredFor: ['mp3', 'wav', 'flac', 'mp4', 'webm'],
        },
      },
      limits: {
        maxFileSizeBytes: CONFIG.MAX_FILE_SIZE_BYTES,
        maxFileSizeMb: CONFIG.MAX_FILE_SIZE_MB,
      },
    };
  }
}

export const engineRegistry = new EngineRegistry();
