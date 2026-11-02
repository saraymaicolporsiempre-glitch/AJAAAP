import { Radio, MapPin } from 'lucide-react';
import type { SedeConfig } from '@/types';
import { useDoctorLiveLocation } from '@/hooks/useDoctorLiveLocation';
import { usePatientLiveLocation } from '@/hooks/usePatientLiveLocation';
import { useOwnPosition } from '@/hooks/useOwnPosition';
import { calculateDistance, formatDistance } from '@/lib/distance';

interface PatientDistanceNoticeProps {
  doctorCedula: string;
  patientCedula: string;
  sede: SedeConfig;
}

export function PatientDistanceNotice({ doctorCedula, patientCedula, sede }: PatientDistanceNoticeProps) {
  const doctorLive = useDoctorLiveLocation(doctorCedula);
  const sharing = doctorLive !== null;
  const patientLive = usePatientLiveLocation(sharing ? patientCedula : undefined);
  const own = useOwnPosition(true, sede.allowSameDayBooking);

  const target = sharing ? patientLive : sede;
  const distance =
    own.position && target
      ? calculateDistance(own.position.lat, own.position.lng, target.lat, target.lng)
      : null;

  let text: string;
  if (distance !== null) {
    text = formatDistance(distance);
  } else if (sharing && !patientLive) {
    text = 'Esperando la ubicación en vivo del paciente...';
  } else {
    text = own.error || 'Obteniendo tu ubicación...';
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-blue-50 rounded-xl px-3 py-2.5 mt-3">
      <p className="flex items-center gap-1.5 text-xs text-slate-600">
        {sharing ? (
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        ) : (
          <MapPin className="w-3.5 h-3.5 text-blue-700" />
        )}
        {sharing ? 'Distancia al paciente (en vivo)' : 'Distancia al centro de atención'}
      </p>
      <p className="text-sm font-semibold text-slate-800 text-right">{text}</p>
    </div>
  );
}
