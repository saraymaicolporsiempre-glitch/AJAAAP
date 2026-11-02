import { useState, useEffect, useCallback } from 'react';
import { FlaskConical, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_SEDE } from '@/data/mockData';

interface SedeConfigRow {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  consultation_minutes: number;
  same_day_booking: boolean;
  allow_weekend_booking: boolean;
}

const DEFAULT_ROW: SedeConfigRow = {
  id: 1,
  name: DEFAULT_SEDE.name,
  address: DEFAULT_SEDE.address,
  lat: DEFAULT_SEDE.lat,
  lng: DEFAULT_SEDE.lng,
  consultation_minutes: DEFAULT_SEDE.consultationMinutes,
  same_day_booking: false,
  allow_weekend_booking: false,
};

async function ensureSedeRow(): Promise<void> {
  const { data } = await supabase
    .from('sede_config')
    .select('id')
    .eq('id', 1)
    .maybeSingle();
  if (!data) {
    await supabase.from('sede_config').insert({
      id: 1,
      name: DEFAULT_SEDE.name,
      address: DEFAULT_SEDE.address,
      lat: DEFAULT_SEDE.lat,
      lng: DEFAULT_SEDE.lng,
      consultation_minutes: DEFAULT_SEDE.consultationMinutes,
      same_day_booking: false,
      allow_weekend_booking: false,
    });
  }
}

interface TestSwitchProps {
  title: string;
  description: string;
  statusOn: string;
  statusOff: string;
  field: 'same_day_booking' | 'allow_weekend_booking';
}

function TestSwitch({ title, description, statusOn, statusOff, field }: TestSwitchProps) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from('sede_config')
      .select('same_day_booking, allow_weekend_booking')
      .eq('id', 1)
      .maybeSingle();
    const row = data as { same_day_booking: boolean; allow_weekend_booking: boolean } | null;
    setEnabled(row ? row[field] : false);
    setLoaded(true);
  }, [field]);

  useEffect(() => {
    (async () => {
      await ensureSedeRow();
      await refresh();
    })();
  }, [refresh]);

  const handleClick = async () => {
    if (busy) return;
    const next = !enabled;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from('sede_config')
        .update({ [field]: next, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select('same_day_booking, allow_weekend_booking')
        .maybeSingle();

      if (error || !data) {
        setEnabled(!next);
        return;
      }

      const row = data as { same_day_booking: boolean; allow_weekend_booking: boolean };
      setEnabled(row[field]);
    } catch {
      setEnabled(!next);
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        <Loader2 className="w-5 h-5 text-slate-300 animate-spin flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={handleClick}
          disabled={busy}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
            enabled ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-slate-400">{enabled ? statusOn : statusOff}</p>
    </div>
  );
}

export function TestModeTab() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-slide-up space-y-5">
      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-blue-700" />
        Prueba Test
      </h3>
      <TestSwitch
        title="Agendar citas para hoy"
        description="Desactiva temporalmente la regla de un día de anticipación para demostraciones en vivo."
        statusOn="Activo: la secretaria puede agendar citas para el día de hoy."
        statusOff="Inactivo: se requiere al menos un día de anticipación."
        field="same_day_booking"
      />
      <TestSwitch
        title="Permitir citas en fines de semana"
        description="Habilita o deshabilita el agendamiento los sábados y domingos."
        statusOn="Activo: se pueden agendar citas los sábados y domingos."
        statusOff="Inactivo: solo se agendan citas de lunes a viernes."
        field="allow_weekend_booking"
      />
    </div>
  );
}
