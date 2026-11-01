import React from 'react';
import {
  Bot,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Cpu,
  Activity,
  Fingerprint,
  Camera,
  Layers,
  FileCode,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ResultPanel';

export default function DeepfakeResultCard({ result }) {
  if (!result || (result.synthetic_probability === undefined && !result.frequency_analysis)) {
    return null;
  }

  const {
    verdict = 'SUSPICIOUS',
    synthetic_probability = 0.5,
    authenticity_score = 50.0,
    confidence = 0.8,
    risk_factors = [],
    image_properties = {},
    provenance = {},
    frequency_analysis = {},
    visual_forensics = {},
  } = result;

  const isAi = verdict === 'AI_GENERATED';
  const isAuthentic = verdict === 'AUTHENTIC_MEDIA';
  const synthPercent = Math.round(synthetic_probability * 100);

  return (
    <div className="border-b border-white/5 bg-slate-900/40 p-6 sm:p-8">
      {/* ── 1. Synthetic Media Primary Banner ─────────────────────────── */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <span className="w-1.5 h-3.5 bg-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(217,70,239,1)]" />
          AI Deepfake & Synthetic Media Forensics
        </h3>

        <div
          className={cn(
            'rounded-2xl p-5 border shadow-lg relative overflow-hidden',
            isAi
              ? 'bg-rose-950/40 border-rose-500/40'
              : isAuthentic
              ? 'bg-emerald-950/30 border-emerald-500/30'
              : 'bg-amber-950/30 border-amber-500/30'
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'p-3 rounded-xl shrink-0',
                isAi
                  ? 'bg-rose-500/20 text-rose-400'
                  : isAuthentic
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              )}
            >
              {isAi ? <Bot className="w-7 h-7" /> : isAuthentic ? <ShieldCheck className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4
                  className={cn(
                    'text-base font-extrabold tracking-tight',
                    isAi ? 'text-rose-300' : isAuthentic ? 'text-emerald-300' : 'text-amber-300'
                  )}
                >
                  {isAi
                    ? 'AI-GENERATED SYNTHETIC MEDIA DETECTED'
                    : isAuthentic
                    ? 'VERIFIED AUTHENTIC PHOTOGRAPHIC MEDIA'
                    : 'SUSPICIOUS / INCONCLUSIVE ARTIFACTS'}
                </h4>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
                  {synthPercent}% Synthetic Probability
                </span>
              </div>

              <p className="text-xs text-slate-300/80 leading-relaxed">
                {isAi
                  ? 'Spatial frequency spectrum and metadata provenance exhibit unmistakable generative AI synthesis signatures.'
                  : isAuthentic
                  ? 'Fourier spectral roll-off and noise distribution align with natural camera hardware physics.'
                  : 'Image presents mixed spectral and metadata signals requiring manual analyst review.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Synthetic Probability Gauge ────────────────────────────── */}
      <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-fuchsia-400" />
              Generative Model Likelihood Index
            </h4>
            <p className="text-[11px] text-slate-500">Synthesized from 2D FFT spectral slope, EXIF provenance, and noise variance</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-white">
              {synthPercent}%
            </span>
            <span className="text-xs text-slate-500 ml-1">AI</span>
          </div>
        </div>

        <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${synthPercent}%` }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full transition-all duration-700',
              isAi
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600'
                : isAuthentic
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-teal-500 to-amber-500'
            )}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span>0% (Natural Photo)</span>
          <span>50% (Inconclusive)</span>
          <span>100% (Definitive AI Generator)</span>
        </div>
      </div>

      {/* ── 3. Forensic Grid: FFT Frequency vs Camera Provenance ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column: 2D FFT Spatial Frequency Analysis */}
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            2D FFT Spatial Frequency Spectrum
          </h4>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            {frequency_analysis.fft_heatmap_base64 && (
              <div className="w-28 h-28 bg-black rounded-xl p-1 border border-cyan-500/30 shrink-0 relative group shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <img
                  src={frequency_analysis.fft_heatmap_base64}
                  alt="2D FFT Log Magnitude Spectrogram"
                  className="w-full h-full object-cover rounded-lg"
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono text-cyan-300 px-1.5 py-0.5 rounded">
                  FFT 2D
                </span>
              </div>
            )}

            <div className="flex-1 w-full space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Spectral Slope (α):</span>
                <span className={cn('font-bold', frequency_analysis.spectral_slope > -0.6 || frequency_analysis.spectral_slope < -1.4 ? 'text-amber-400' : 'text-emerald-400')}>
                  {frequency_analysis.spectral_slope ?? 'N/A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">High-Freq Energy Ratio:</span>
                <span className="font-bold text-slate-200">
                  {frequency_analysis.high_frequency_ratio ?? 0}%
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Periodic Grid Spikes:</span>
                <span className={cn('font-bold', frequency_analysis.periodic_artifacts_detected ? 'text-rose-400' : 'text-emerald-400')}>
                  {frequency_analysis.periodic_artifacts_detected ? 'DETECTED (Upsampling)' : 'None (Natural)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Spectral Anomaly Score:</span>
                <span className="font-bold text-fuchsia-400">
                  {frequency_analysis.fft_anomaly_score ?? 0}/100
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Authentic photographs adhere to Field’s 1/f² power-law falloff. Generative diffusion and GAN models
            introduce unnatural high-frequency plateaus or discrete checkerboard peaks in Fourier space.
          </p>
        </div>

        {/* Right Column: Provenance & Hardware EXIF */}
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-purple-400" />
            Hardware Provenance & Generator Signatures
          </h4>

          <div className="space-y-2.5 text-xs font-mono mb-4">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Camera Sensor EXIF:</span>
              <span className={cn('font-bold', provenance.has_camera_hardware ? 'text-emerald-400' : 'text-slate-400')}>
                {provenance.has_camera_hardware
                  ? `${provenance.camera_make} ${provenance.camera_model}`
                  : 'No Camera Profile (Generic Canvas)'}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Canvas Dimensions:</span>
              <span className={cn('font-bold', provenance.is_standard_diffusion_dim ? 'text-rose-400' : 'text-slate-200')}>
                {image_properties.width} × {image_properties.height} {provenance.is_standard_diffusion_dim && '(Native AI Canvas)'}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">C2PA Content Credentials:</span>
              <span className={cn('font-bold', provenance.c2pa_manifest_detected ? 'text-cyan-400' : 'text-slate-500')}>
                {provenance.c2pa_manifest_detected ? 'Present' : 'Not Detected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Noise Uniformity Score:</span>
              <span className="font-bold text-amber-300">
                {visual_forensics.noise_uniformity_score ?? 0}/100
              </span>
            </div>
          </div>

          {/* Extracted Prompt Snippet (if AI generated) */}
          {provenance.extracted_prompt_snippet && (
            <div className="bg-black/60 border border-fuchsia-500/30 rounded-xl p-3 text-xs">
              <div className="flex items-center gap-1.5 text-fuchsia-400 font-bold mb-1">
                <FileCode className="w-3.5 h-3.5" />
                <span>Extracted Generation Prompt / Parameters:</span>
              </div>
              <p className="text-slate-300 font-mono text-[11px] max-h-20 overflow-y-auto leading-relaxed">
                {provenance.extracted_prompt_snippet}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

