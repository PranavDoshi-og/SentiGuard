import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does SentiGuard detect synthetic AI media without external cloud APIs?',
      a: 'SentiGuard converts uploaded media into 2D spatial frequency spectrograms using the Fast Fourier Transform (2D-FFT). Generative diffusion and GAN models exhibit a distinct radial power spectrum decay slope (α) and periodic high-frequency checkerboard grid artifacts from convolutional upsampling layers that natural camera optical sensors never produce. We also parse binary C2PA Content Credentials and camera EXIF sensor noise profiles.'
    },
    {
      q: 'Does SentiGuard transmit confidential customer or invoice files to external servers?',
      a: 'Never. SentiGuard is strictly architected for air-gapped zero-cloud environments. All incoming byte streams (URLs, images, PDF files) are processed in-memory directly on your local host or private Docker container. No samples, hashes, or metadata are ever transmitted to third-party public clouds.'
    },
    {
      q: 'How does weaponized PDF inspection protect against zero-day exploits without executing malware?',
      a: 'Traditional PDF viewers can be exploited when rendering embedded JavaScript or executing launch routines. SentiGuard does not render the visual PDF; instead, it parses low-level PDF object trees and dictionary streams (using pypdf) to identify dangerous keys like /JavaScript, /Launch, /OpenAction, /EmbeddedFiles, and /SubmitForm, neutralizing payload execution before it can reach your operating system.'
    },
    {
      q: 'Can SentiGuard be integrated with enterprise SIEM or SOAR platforms?',
      a: 'Yes. SentiGuard provides asynchronous REST API endpoints (OpenAPI 3.1 compliant) returning standardized JSON payloads. Verdicts include numerical Safety Indices (0-100), MITRE ATT&CK categorized exploit types, extracted indicators of compromise (IOCs), and remediation playbooks ready for immediate ingestion into Splunk, Microsoft Sentinel, or custom webhooks.'
    },
    {
      q: 'How does the Visual Brand Phishing engine detect deceptive logos and screenshots?',
      a: 'SentiGuard uses a multi-tier pipeline: first, high-accuracy OCR (leveraging native Windows OCR engine with Tesseract fallback) decodes visible textual copy and contact numbers. Next, RapidFuzz fuzzy ratio matching benchmarks the layout against Fortune 500 brand signatures. Finally, our domain discrepancy engine checks whether the rendered brand claims match the origin FQDN, catching lures hosted on untrusted CDNs.'
    }
  ];

  return (
    <section id="faq" className="py-24 px-6 md:px-12 max-w-4xl mx-auto relative z-10 border-t border-white/5">
      <div className="text-center mb-16 space-y-4">
        <div className="pearl-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium">
          <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
          FREQUENTLY ASKED QUESTIONS
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Everything You Need to Know
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Technical specifications, cryptographic guarantees, and integration blueprints.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="pearl-badge rounded-2xl overflow-hidden transition-all duration-200 border border-white/10"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer hover:text-violet-300 transition-colors"
              >
                <span className="font-semibold text-white text-sm sm:text-base">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-violet-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 font-normal">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
