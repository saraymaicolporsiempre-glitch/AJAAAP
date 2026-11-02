import { useState } from 'react';
import { FlaskConical } from 'lucide-react';

interface TestModeTabProps {
  sameDayEnabled: boolean;
  onToggleSameDay: (next: boolean) => Promise<void>;
  weekendEnabled: boolean;
  onToggleWeekend: (next: boolean) => Promise<void>;
}

interface TestSwitchProps {
  title: string;
  description: string;
  statusOn: string;
  statusOff: string;
  enabled: boolean;
  onToggle: (next: boolean) => Promise<void>;
}

function TestSwitch({ title, description, statusOn, statusOff, enabled, onToggle }: TestSwitchProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await onToggle(!enabled);
    } finally {
      setBusy(false);
    }
  };

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

export function TestModeTab({ sameDayEnabled, onToggleSameDay, weekendEnabled, onToggleWeekend }: TestModeTabProps) {
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
        enabled={sameDayEnabled}
        onToggle={onToggleSameDay}
      />
      <TestSwitch
        title="Permitir citas en fines de semana"
        description="Habilita o deshabilita el agendamiento los sábados y domingos."
        statusOn="Activo: se pueden agendar citas los sábados y domingos."
        statusOff="Inactivo: solo se agendan citas de lunes a viernes."
        enabled={weekendEnabled}
        onToggle={onToggleWeekend}
      />
    </div>
  );
}
