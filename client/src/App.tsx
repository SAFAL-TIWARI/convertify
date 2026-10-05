import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/layout/Header.js';
import { Footer } from './components/layout/Footer.js';
import { NoticeBanner } from './components/layout/NoticeBanner.js';
import { HowItWorks } from './components/layout/HowItWorks.js';
import { FileDropzone } from './components/uploader/FileDropzone.js';
import { ConversionWorkspace } from './components/converter/ConversionWorkspace.js';
import { ProgressIndicator } from './components/converter/ProgressIndicator.js';
import { ResultCard } from './components/result/ResultCard.js';
import { FormatCatalog } from './components/catalog/FormatCatalog.js';
import { DiagnosticsDrawer } from './components/diagnostics/DiagnosticsDrawer.js';
import { PalmIcon, WaveMotif, GridCross } from './components/common/TropicalMotif.js';

import {
  fetchFormatsCatalog,
  fetchDiagnostics,
  uploadAndConvert,
  CatalogResponse,
} from './lib/api.js';
import {
  JobStatus,
  FormatDefinition,
  ConversionPair,
  ImageConversionOptions,
  ConversionJobResult,
  DiagnosticsResponse,
} from '@shared/types/index.js';
import { getFileExtension } from './lib/formatUtils.js';

export function App() {
  // App state
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResponse | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isDiagLoading, setIsDiagLoading] = useState(false);

  // Conversion Workflow State Machine
  const [status, setStatus] = useState<JobStatus>('IDLE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [stageMessage, setStageMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedJob, setCompletedJob] = useState<ConversionJobResult | null>(null);
  const [imageOptions, setImageOptions] = useState<ImageConversionOptions>({
    quality: 85,
    preserveAspectRatio: true,
  });

  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // Load formats and diagnostics on initial mount
  useEffect(() => {
    loadCatalogAndDiagnostics();
  }, []);

  const loadCatalogAndDiagnostics = async () => {
    try {
      setIsDiagLoading(true);
      const [catData, diagData] = await Promise.all([
        fetchFormatsCatalog(),
        fetchDiagnostics(),
      ]);
      setCatalog(catData);
      setDiagnostics(diagData);
    } catch (err) {
      console.error('Failed loading backend capabilities:', err);
    } finally {
      setIsDiagLoading(false);
    }
  };

  // Determine available output formats for currently selected file
  const allowedOutputs = useMemo(() => {
    if (!selectedFile || !catalog) return [];
    const ext = getFileExtension(selectedFile.name).toLowerCase();
    const formatDef = catalog.formats[ext];
    if (!formatDef || !formatDef.outputs) {
      // If extension not directly registered, check if it's an image or text
      if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'].includes(ext)) {
        return ['png', 'jpg', 'webp', 'avif', 'tiff', 'gif'].filter((o) => o !== ext);
      }
      return [];
    }
    return formatDef.outputs;
  }, [selectedFile, catalog]);

  // Handle file selection from dropzone or quick tools
  const handleFileSelect = (file: File, preselectedTargetFormat?: string) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setCompletedJob(null);
    setStatus('FILE_SELECTED');

    const ext = getFileExtension(file.name).toLowerCase();
    const formatDef = catalog?.formats[ext];
    const available = formatDef?.outputs || [];

    if (preselectedTargetFormat && available.includes(preselectedTargetFormat.toLowerCase())) {
      setTargetFormat(preselectedTargetFormat.toLowerCase());
      setStatus('READY_TO_CONVERT');
    } else if (available.length > 0) {
      setTargetFormat(available[0]);
      setStatus('READY_TO_CONVERT');
    } else {
      setTargetFormat('');
      setStatus('FILE_SELECTED');
    }

    // Scroll smoothly to converter workspace
    const el = document.getElementById('converter');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle conversion trigger
  const handleStartConversion = async () => {
    if (!selectedFile || !targetFormat) return;

    setStatus('CONVERTING');
    setStageMessage('Transferring to local converter engine...');
    setErrorMessage(null);

    try {
      const result = await uploadAndConvert(selectedFile, targetFormat, imageOptions);

      if (result.status === 'COMPLETED') {
        setStatus('COMPLETED');
        setCompletedJob(result);
        setStageMessage('Ready');
      } else {
        setStatus('FAILED');
        setErrorMessage(result.error || 'Conversion failed during execution.');
        setStageMessage('Conversion failed');
      }
    } catch (err: any) {
      setStatus('FAILED');
      setErrorMessage(err.message || "We couldn't finish that conversion. Try another file.");
      setStageMessage('Conversion failed');
    }
  };

  // Reset converter state
  const handleResetFile = () => {
    setSelectedFile(null);
    setTargetFormat('');
    setCompletedJob(null);
    setErrorMessage(null);
    setStatus('IDLE');
  };

  // Handle shortcut tool card click
  const handleSelectQuickTool = (fromExt: string, toExt: string) => {
    setTargetFormat(toExt);
    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.setAttribute('data-target-format', toExt);
      hiddenFileInputRef.current.click();
    }
  };

  const handleHiddenFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const preselected = hiddenFileInputRef.current?.getAttribute('data-target-format') || undefined;
      handleFileSelect(file, preselected);
    }
  };

  const isConverting = status === 'CONVERTING' || status === 'VERIFYING';

  return (
    <div className="min-h-screen flex flex-col bg-hh-cream text-hh-black">
      {/* Hidden file input for tool card shortcuts */}
      <input
        ref={hiddenFileInputRef}
        type="file"
        className="hidden"
        onChange={handleHiddenFileInputChange}
      />

      {/* Top Notice Banner */}
      <NoticeBanner />

      {/* Primary Header */}
      <Header
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        engineStatusText={
          diagnostics?.engines.sharp.status === 'READY'
            ? 'Local Engine Active'
            : 'Connecting...'
        }
        isEngineReady={diagnostics?.engines.sharp.status === 'READY'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-16">
        {/* HERO / UTILITY HEADING */}
        <section id="converter" className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-hh-black shadow-hh-sm text-xs font-technical uppercase text-hh-green">
            <PalmIcon className="w-3.5 h-3.5 text-hh-green" />
            <span>Local File Processing • 500 MB Max</span>
            <span className="w-1.5 h-1.5 rounded-full bg-hh-pink"></span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-hh-black tracking-tight leading-tight">
            Convert any file.
          </h1>

          <p className="text-sm sm:text-base text-hh-muted font-sans max-w-xl mx-auto leading-relaxed">
            Drop a file. Choose what you want it to become and convert it locally. Files never leave your machine.
          </p>
        </section>

        {/* PRIMARY CONVERTER WORKSPACE / DROPZONE / RESULT */}
        <section className="max-w-4xl mx-auto">
          {/* State 1: COMPLETED RESULT */}
          {status === 'COMPLETED' && completedJob ? (
            <ResultCard job={completedJob} onConvertAnother={handleResetFile} />
          ) : status === 'CONVERTING' || status === 'VERIFYING' ? (
            /* State 2: CONVERTING IN PROGRESS */
            <div className="space-y-4">
              {selectedFile && (
                <ConversionWorkspace
                  file={selectedFile}
                  selectedFormat={targetFormat}
                  onFormatChange={setTargetFormat}
                  onResetFile={handleResetFile}
                  onStartConvert={handleStartConversion}
                  status={status}
                  allFormats={catalog?.formats || {}}
                  allowedOutputs={allowedOutputs}
                  imageOptions={imageOptions}
                  onImageOptionsChange={setImageOptions}
                />
              )}
              <ProgressIndicator
                status={status}
                stageMessage={stageMessage}
                errorMessage={errorMessage || undefined}
              />
            </div>
          ) : status === 'FAILED' ? (
            /* State 3: FAILED ERROR STATE */
            <div className="space-y-4">
              {selectedFile && (
                <ConversionWorkspace
                  file={selectedFile}
                  selectedFormat={targetFormat}
                  onFormatChange={setTargetFormat}
                  onResetFile={handleResetFile}
                  onStartConvert={handleStartConversion}
                  status={status}
                  allFormats={catalog?.formats || {}}
                  allowedOutputs={allowedOutputs}
                  imageOptions={imageOptions}
                  onImageOptionsChange={setImageOptions}
                />
              )}
              <ProgressIndicator
                status={status}
                stageMessage={stageMessage}
                errorMessage={errorMessage || undefined}
              />
            </div>
          ) : selectedFile ? (
            /* State 4: FILE SELECTED / READY TO CONVERT */
            <ConversionWorkspace
              file={selectedFile}
              selectedFormat={targetFormat}
              onFormatChange={setTargetFormat}
              onResetFile={handleResetFile}
              onStartConvert={handleStartConversion}
              status={status}
              allFormats={catalog?.formats || {}}
              allowedOutputs={allowedOutputs}
              imageOptions={imageOptions}
              onImageOptionsChange={setImageOptions}
            />
          ) : (
            /* State 5: EMPTY STATE DROPZONE */
            <FileDropzone onFileSelect={(file) => handleFileSelect(file)} maxSizeMb={500} />
          )}
        </section>

        {/* FORMAT CATALOG & TOOL SHORTCUTS */}
        {catalog && (
          <FormatCatalog
            formats={catalog.formats}
            popularPairs={catalog.popularPairs}
            onSelectQuickTool={handleSelectQuickTool}
          />
        )}

        {/* HOW IT WORKS SECTION */}
        <HowItWorks />
      </main>

      {/* DIAGNOSTICS MODAL / DRAWER */}
      <DiagnosticsDrawer
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        diagnostics={diagnostics}
        isLoading={isDiagLoading}
        onRefresh={loadCatalogAndDiagnostics}
      />

      {/* FOOTER */}
      <Footer onOpenDiagnostics={() => setIsDiagnosticsOpen(true)} />
    </div>
  );
}

export default App;
