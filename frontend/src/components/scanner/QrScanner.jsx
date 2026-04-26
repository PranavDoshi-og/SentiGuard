import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Camera, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import jsQR from 'jsqr';

export default function QrScanner({ onScan, isLoading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraStatus, setCameraStatus] = useState('Initializing...');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  useEffect(() => {
    if (useCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [useCamera]);

  const startCamera = async () => {
    setCameraError('');
    setCameraStatus('Requesting camera access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraStatus('Scanning for QR code...');
        scanFrame();
      }
    } catch (err) {
      setCameraError('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !jsQR) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    if (video.readyState >= video.HAVE_FUTURE_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setCameraStatus('QR Found! Initiating Scan...');
        stopCamera();
        onScan(code.data, 'url');
        return;
      }
    }
    animationRef.current = requestAnimationFrame(scanFrame);
  };

  return (
    <motion.div 
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="glass-panel rounded-3xl p-10 relative overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
      <div className="flex justify-between items-center mb-8 relative z-10">
        <label className="flex items-center gap-3 text-sm font-bold text-slate-300 uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          {useCamera ? 'Camera Scanner' : 'Upload QR Code'}
        </label>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setUseCamera(!useCamera)}
          className="text-xs font-bold bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-700 shadow-inner"
        >
          {useCamera ? <UploadCloud className="w-4 h-4 text-cyan-400" /> : <Camera className="w-4 h-4 text-cyan-400" />}
          {useCamera ? 'Upload File' : 'Use Camera'}
        </motion.button>
      </div>

      <div className="relative z-10">
        {useCamera ? (
          <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-inner">
            {cameraError ? (
              <div className="text-red-500 text-sm font-bold">{cameraError}</div>
            ) : (
              <>
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none" />
                <div className="w-64 h-64 border-2 border-cyan-400/50 rounded-3xl relative shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,1)] animate-[scanLine_2.5s_linear_infinite]" />
                </div>
                <div className="absolute bottom-6 bg-slate-950/80 backdrop-blur-md border border-white/10 text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  {cameraStatus}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {!file ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 rounded-2xl p-16 text-center transition-all cursor-pointer group backdrop-blur-sm"
                onClick={() => document.getElementById('qrFile').click()}
              >
                <UploadCloud className="w-16 h-16 text-slate-600 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] mx-auto mb-6 transition-all duration-300" />
                <p className="text-slate-200 font-bold text-xl mb-2">Drag & drop a QR code image</p>
                <p className="text-slate-500 text-sm mb-6">or click to browse from your device</p>
                <span className="inline-block bg-slate-800 border border-slate-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm group-hover:border-cyan-500/50 transition-colors">
                  Browse Files
                </span>
                <input type="file" id="qrFile" accept="image/*" className="hidden" onChange={handleFileChange} />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8 shadow-2xl"
              >
                <div className="w-40 h-40 bg-slate-950 rounded-2xl shadow-inner p-3 relative border border-slate-800">
                  <img src={preview} alt="QR Preview" className="w-full h-full object-contain rounded-xl" />
                  <button
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-white text-lg mb-2 truncate max-w-[250px]">{file.name}</h4>
                  <p className="text-sm font-mono text-slate-400 mb-6">{(file.size / 1024).toFixed(1)} KB</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onScan(file, 'qr')}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg rounded-xl px-8 py-4 flex items-center gap-3 w-full sm:w-auto justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isLoading ? 'Analyzing QR...' : 'Scan Image Now'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
