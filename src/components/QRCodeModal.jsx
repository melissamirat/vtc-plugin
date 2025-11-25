// src/components/QRCodeModal.jsx
"use client";

import { QRCodeSVG } from 'qrcode.react';
import { useState, useRef } from 'react';

export default function QRCodeModal({ isOpen, onClose, url, companyName = "VTC Service" }) {
  const [downloaded, setDownloaded] = useState(false);
  const qrRef = useRef(null);

  if (!isOpen) return null;

  const downloadQRCode = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 1000;
    canvas.height = 1000;
    
    img.onload = () => {
      // Fond blanc
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 1000, 1000);
      
      // QR code centré
      ctx.drawImage(img, 100, 100, 800, 800);
      
      // Télécharger
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'qr-code-vtc.png';
      downloadLink.href = pngFile;
      downloadLink.click();
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${companyName} - Réservation VTC`,
          text: 'Scannez ce QR code pour réserver',
          url: url,
        });
      } catch (err) {
        console.log('Partage annulé');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec gradient */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">QR Code</h2>
                  <p className="text-sm text-white/80">{companyName}</p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* QR Code avec design moderne */}
        <div className="p-8">
          <div className="bg-gradient-to-br from-stone-50 to-white p-6 rounded-3xl border-2 border-stone-200 shadow-inner relative overflow-hidden">
            {/* Motif de fond subtil */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] opacity-50"></div>
            
            <div ref={qrRef} className="relative bg-white p-4 rounded-2xl shadow-lg">
              <QRCodeSVG
                value={url}
                size={256}
                level="H"
                includeMargin={false}
                className="w-full h-auto"
                fgColor="#1c1917"
                bgColor="#ffffff"
                imageSettings={{
                  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%231c1917'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3EV%3C/text%3E%3C/svg%3E",
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-stone-900 mb-1">Scannez pour réserver</p>
            <p className="text-xs text-stone-500">Partagez ce QR code avec vos clients</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={downloadQRCode}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 active:scale-95 transition shadow-lg"
          >
            {downloaded ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Téléchargé !
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger le QR Code
              </>
            )}
          </button>

          {navigator.share && (
            <button
              onClick={shareQRCode}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-stone-100 text-stone-900 rounded-2xl font-semibold hover:bg-stone-200 active:scale-95 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Partager
            </button>
          )}
        </div>
      </div>
    </div>
  );
}