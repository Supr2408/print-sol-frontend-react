import React, { useEffect, useRef } from "react";

const ScannerOverlay = ({ open, onClose, onScanned }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const startScanner = async () => {
      if (!window.Instascan) {
        console.error("Instascan not loaded");
        return;
      }
      const video = videoRef.current;
      const scanner = new window.Instascan.Scanner({
        video,
        mirror: false,
        backgroundScan: false,
      });

      scannerRef.current = scanner;

      scanner.addListener("scan", (content) => {
        const match = content.match(/https?:\/\/[^\s]+/);
        const url = match?.[0];
        if (url) {
          scanner.stop();
          scannerRef.current = null;
          onScanned(url);
        } else {
          console.error("Invalid QR content");
        }
      });

      try {
        const cameras = await window.Instascan.Camera.getCameras();
        if (cancelled) return;
        if (cameras.length === 0) {
          console.error("No cameras found");
          return;
        }
        const backCam =
          cameras.find((c) =>
            (c.name || "").toLowerCase().includes("back")
          ) || cameras[0];
        await scanner.start(backCam);
      } catch (e) {
        console.error("Camera error", e);
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current = null;
      }
    };
  }, [open, onScanned]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 bg-black/80 flex flex-col items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-300 hover:text-white"
      >
        <i className="fas fa-times text-lg" />
      </button>
      <div className="text-center mb-4">
        <h3 className="text-sm font-semibold">Scan Printer QR Code</h3>
        <p className="text-xs text-slate-400">
          Point your camera at the QR code displayed on the printer.
        </p>
      </div>
      <div className="w-72 max-w-full rounded-xl overflow-hidden border border-slate-700 bg-black">
        <video ref={videoRef} className="w-full h-64 object-cover" />
      </div>
    </div>
  );
};

export default ScannerOverlay;
