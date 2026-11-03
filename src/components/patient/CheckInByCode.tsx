import { useState } from 'react';
import { QrCode, Hash, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Ingresa el código PIN o QR mostrado en la pantalla.');
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

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-slide-up space-y-4">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-blue-700" />
        Check-in por Código Rotatorio
      </h2>
      <p className="text-sm text-slate-500">
        Ingresa el código PIN de 4 dígitos o el código QR que aparece en la pantalla de la sala de espera.
        El código cambia cada 5 minutos.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('pin')}
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
          onClick={() => setMode('qr')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            mode === 'qr'
              ? 'bg-blue-700 text-white shadow-sm shadow-blue-200'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Código QR
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'pin' ? (
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
        ) : (
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            placeholder="Ej. A1B2C3D4E5F6"
            className="w-full text-center text-lg font-bold uppercase tracking-wider py-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800"
          />
        )}

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
    </div>
  );
}
