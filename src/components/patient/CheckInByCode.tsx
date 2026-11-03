import { useState, useRef, useEffect, useCallback } from 'react';
import { QrCode, Hash, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Camera, CameraOff, RefreshCw } from 'lucide-react';
import { useActiveCheckinCode } from '@/hooks/useCheckinCode';
import { useApp } from '@/context/AppContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { User as AppUser } from '@/types';

interface CheckInByCodeProps {
  user: AppUser;
  onCheckedIn: () => void;
}

export function CheckInByCode({ user, onCheckedIn }: CheckInByCodeProps) {
  const { isValid, loading: validating } = useActiveCheckinCode();
  const { checkIn } = useApp();
  const { data } = useApp();
  const { result } = useGeolocation(data.sede.lat, data.sede.lng, data.sede.allowSameDayBooking);

  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'pin' | 'qr'>('pin');

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Ingresa el código PIN de 4 dígitos.');
      return;
    }

    setBusy(true);
    setError('');

    const valid = await isValid(trimmed);
    if (!valid) {
      setError('El código no es válido o ya expiró. Revisa la pantalla en la sala de espera.');
      setBusy(false);
      return;
    }

    const gpsDistance = result.distance ?? 0;
    const apt = await checkIn(user.cedula, user.name, gpsDistance);
    setBusy(false);

    if (apt) {
      onCheckedIn();
    } else {
      setError('No se pudo registrar el check-in. Intenta de nuevo.');
    }
  };

  const handleQrSuccess = useCallback(async (scannedToken: string) => {
    if (busy) return;
    setBusy(true);
    setError('');

    const valid = await isValid(scannedToken);
    if (!valid) {
      setError('El código QR no es válido o ya expiró. Revisa la pantalla en la sala de espera.');
      setBusy(false);
      return;
    }

    const gpsDistance = result.distance ?? 0;
    const apt = await checkIn(user.cedula, user.name, gpsDistance);
    setBusy(false);

    if (apt) {
      onCheckedIn();
    } else {
      setError('No se pudo registrar el check-in. Intenta de nuevo.');
    }
  }, [busy, isValid, result.distance, checkIn, user.cedula, user.name, onCheckedIn]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-slide-up space-y-4">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-blue-700" />
        Check-in por Código Rotatorio
      </h2>
      <p className="text-sm text-slate-500">
        Escanea el código QR de la pantalla en la sala de espera o ingresa el PIN de 4 dígitos.
        El código cambia cada 5 minutos.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('pin'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            mode === 'pin'
              ? 'bg-blue-700 text-white shadow-sm shadow-blue-200'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Hash className="w-4 h-4" />
          Código PIN
        </button>
        <button
          onClick={() => { setMode('qr'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            mode === 'qr'
              ? 'bg-blue-700 text-white shadow-sm shadow-blue-200'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Escanear QR
        </button>
      </div>

      {mode === 'pin' ? (
        <form onSubmit={handlePinSubmit} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={input}
            onChange={(e) => {
              setInput(e.target.value.replace(/\D/g, '').slice(0, 4));
              setError('');
            }}
            placeholder="0000"
            className="w-full text-center text-3xl font-extrabold tracking-[0.5em] font-mono py-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800"
          />

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || validating || !input.trim()}
            className="w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-xl
                       hover:bg-emerald-600 active:scale-[0.98] transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
          >
            {busy ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {busy ? 'Validando...' : 'Confirmar Check-in'}
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      ) : (
        <QrScannerView
          busy={busy}
          error={error}
          onScanSuccess={handleQrSuccess}
          onSwitchToPin={() => { setMode('pin'); setError(''); }}
        />
      )}
    </div>
  );
}

interface QrScannerViewProps {
  busy: boolean;
  error: string;
  onScanSuccess: (token: string) => void;
  onSwitchToPin: () => void;
}

type ScannerState = 'idle' | 'starting' | 'scanning' | 'error' | 'denied';

function QrScannerView({ busy, error: parentError, onScanSuccess, onSwitchToPin }: QrScannerViewProps) {
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const containerId = 'qr-reader-container';
  const handledRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setScannerState('starting');
    setCameraError('');
    handledRef.current = false;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      // Create a fresh instance each time
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch { /* ignore */ }
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode(containerId, { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        (decodedText: string) => {
          if (handledRef.current) return;
          handledRef.current = true;
          // Extract token from JSON payload if applicable
          let token = decodedText;
          try {
            const parsed = JSON.parse(decodedText);
            if (parsed && typeof parsed.qr === 'string') token = parsed.qr;
          } catch {
            // not JSON, use raw text
          }
          stopScanner();
          setScannerState('idle');
          onScanSuccess(token);
        },
        () => {
          // per-frame decode failure — ignore
        },
      );

      setScannerState('scanning');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('notallowed')) {
        setScannerState('denied');
        setCameraError('No se pudo acceder a la cámara. Revisa los permisos de tu navegador.');
      } else {
        setScannerState('error');
        setCameraError('No se pudo iniciar la cámara: ' + msg);
      }
    }
  }, [onScanSuccess, stopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Auto-start when entering QR mode
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleRetry = () => {
    startScanner();
  };

  const handleStop = async () => {
    await stopScanner();
    setScannerState('idle');
  };

  const displayError = parentError || cameraError;

  return (
    <div className="space-y-3">
      {/* Scanner container */}
      {scannerState !== 'idle' && (
        <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-square">
          <div id={containerId} className="w-full h-full" />

          {/* Overlay frame */}
          {scannerState === 'scanning' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-white/70 rounded-2xl shadow-lg" />
            </div>
          )}

          {scannerState === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-white/80">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium">Iniciando cámara...</p>
              </div>
            </div>
          )}

          {scannerState === 'scanning' && (
            <button
              onClick={handleStop}
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-2 text-sm font-semibold text-white hover:bg-black/70 transition-colors"
            >
              <CameraOff className="w-4 h-4" />
              Detener
            </button>
          )}
        </div>
      )}

      {/* Idle state — button to start camera */}
      {scannerState === 'idle' && !busy && (
        <button
          onClick={startScanner}
          className="w-full bg-blue-700 text-white font-semibold py-3.5 rounded-xl
                     hover:bg-blue-800 active:scale-[0.98] transition-all
                     flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
        >
          <Camera className="w-5 h-5" />
          Activar cámara para escanear
        </button>
      )}

      {/* Busy state after scan */}
      {busy && scannerState === 'idle' && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-700" />
          <span className="text-sm font-semibold text-slate-600">Validando código...</span>
        </div>
      )}

      {/* Error states */}
      {(scannerState === 'error' || scannerState === 'denied') && (
        <div className="space-y-3">
          <div className="bg-red-50 rounded-xl p-4 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">{cameraError}</p>
              <p className="text-xs text-red-500 mt-1">
                Puedes intentar de nuevo o usar el PIN de 4 dígitos.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-700 text-white font-semibold py-2.5 rounded-xl
                         hover:bg-blue-800 active:scale-[0.98] transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
            <button
              onClick={onSwitchToPin}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl
                         hover:bg-slate-200 active:scale-[0.98] transition-all text-sm"
            >
              <Hash className="w-4 h-4" />
              Usar PIN
            </button>
          </div>
        </div>
      )}

      {/* Parent error (from validation) */}
      {displayError && scannerState !== 'error' && scannerState !== 'denied' && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          {displayError}
        </p>
      )}

      {/* Hint */}
      {scannerState === 'scanning' && (
        <p className="text-xs text-slate-400 text-center">
          Apunta la cámara hacia el código QR de la pantalla en la sala de espera.
        </p>
      )}
    </div>
  );
}
