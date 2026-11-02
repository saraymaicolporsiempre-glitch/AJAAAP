import { useState, useEffect, useRef, Component, type ReactNode } from 'react';
import { LogOut, ArrowRight, AlertCircle, RefreshCw, MessageCircle, X } from 'lucide-react';
import { AppLogoMark } from '@/components/FastyTurnLogo';
import { AppProvider, useApp } from '@/context/AppContext';
import { LoginScreen } from '@/components/LoginScreen';
import { MyAppointments } from '@/components/patient/MyAppointments';
import { DoctorPanel } from '@/components/doctor/DoctorPanel';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { SecretaryPanel } from '@/components/secretary/SecretaryPanel';
import { UpdateBanner } from '@/components/UpdateBanner';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import type { Role } from '@/types';

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
          <h1 className="text-2xl font-extrabold text-slate-800 mb-4">Algo salió mal</h1>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <p className="font-semibold text-slate-800 mb-1">Error al cargar</p>
            <p className="text-sm text-slate-500 mb-5">
              {this.state.error?.message ?? 'Ocurrió un error inesperado'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl
                         hover:opacity-90 active:scale-[0.98] transition-all"
              style={{ backgroundColor: '#21638b' }}
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentUser, data, logout, loading } = useApp();
  const [showSplash, setShowSplash] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show splash on login (not on session restore)
  useEffect(() => {
    if (currentUser) {
      setShowSplash(true);
      splashTimerRef.current = setTimeout(() => setShowSplash(false), 2000);
    } else {
      setShowSplash(false);
      setHasCheckedIn(false);
    }

    return () => {
      if (splashTimerRef.current) {
        clearTimeout(splashTimerRef.current);
        splashTimerRef.current = null;
      }
    };
  }, [currentUser?.cedula]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/70 to-white/70 flex flex-col items-center justify-center px-6">
        <AppLogoMark size={80} className="mb-4 animate-pulse" />
        <p className="text-slate-500 text-sm">Cargando...</p>
      </div>
    );
  }

  const dismissSplash = () => {
    if (splashTimerRef.current) {
      clearTimeout(splashTimerRef.current);
      splashTimerRef.current = null;
    }
    setShowSplash(false);
  };

  if (!currentUser) {
    return <LoginScreen />;
  }

  // Splash / welcome screen (auto-dismisses after 2s, or via button)
  if (showSplash) {
    const sedeName = currentUser.sedeName || data.sede.name;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-bounce-in" style={{ background: 'linear-gradient(135deg, rgba(33,99,139,0.92), rgba(26,82,120,0.92))' }}>
        <div className="text-center text-white flex-1 flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/15 mb-5">
            <AppLogoMark size={56} className="mb-0" />
          </div>
          <p className="text-lg text-white/80 mb-1">Bienvenido/a a</p>
          <h1 className="text-2xl font-extrabold mb-2 text-balance leading-tight max-w-sm">{sedeName}</h1>
          <p className="text-xl font-bold">{currentUser.name}</p>
        </div>

        <div className="w-full max-w-xs pb-12">
          {/* Progress indicator */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-white/80 rounded-full animate-splash-fill" />
          </div>
          <button
            onClick={dismissSplash}
            className="w-full bg-white font-bold py-3.5 rounded-xl
                       hover:bg-white/90 active:scale-[0.98] transition-all
                       flex items-center justify-center gap-2 shadow-lg"
            style={{ color: '#21638b' }}
          >
            Ingresar a mi Panel
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 backdrop-blur-[2px] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 safe-bottom">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/aja_app_logo.svg" alt="AJA' APP" className="h-10 w-auto object-contain" />
              <h1 className="text-lg font-extrabold text-slate-800 leading-tight">
                {roleLabel(currentUser.role)} · {currentUser.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-600">En vivo</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                           text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {currentUser.role === 'patient' ? (
          <MyAppointments
            user={currentUser}
            onCheckedIn={() => setHasCheckedIn(true)}
          />
        ) : currentUser.role === 'doctor' ? (
          <DoctorPanel user={currentUser} />
        ) : currentUser.role === 'secretary' ? (
          <SecretaryPanel user={currentUser} />
        ) : (
          <AdminPanel user={currentUser} />
        )}
      </main>

      {/* WhatsApp floating button — visible for patients */}
      {currentUser.role === 'patient' && <WhatsAppFloatingButton />}
    </div>
  );
}

function roleLabel(role: Role): string {
  if (role === 'doctor') return 'Médico';
  if (role === 'admin') return 'Administrador';
  if (role === 'secretary') return 'Secretaría';
  return 'Paciente';
}

const WHATSAPP_NUMBER = '573233386530';
const WHATSAPP_MESSAGE = encodeURIComponent('Hola, necesito agendar una cita');
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

function WhatsAppFloatingButton() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2.5">
      {expanded && (
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setExpanded(false)}
          className="flex items-center gap-3 bg-white rounded-2xl pl-4 pr-5 py-3.5 shadow-xl shadow-emerald-200/50 border border-emerald-100
                     hover:shadow-2xl hover:shadow-emerald-200/60 active:scale-[0.98] transition-all animate-slide-up
                     max-w-[calc(100vw-2.5rem)]"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 leading-tight">¡Necesitas apartar una cita!</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Oprime aquí para escribirnos por WhatsApp</p>
          </div>
        </a>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label="Contactar por WhatsApp"
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white
                   shadow-lg shadow-emerald-300/50 hover:shadow-xl hover:shadow-emerald-300/60
                   active:scale-95 transition-all flex items-center justify-center"
      >
        {!expanded && (
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
        )}
        {expanded ? (
          <X className="w-6 h-6 relative" />
        ) : (
          <MessageCircle className="w-7 h-7 relative" />
        )}
      </button>
    </div>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <InteractiveBackground />
      <AppProvider>
        <AppContent />
        <UpdateBanner />
      </AppProvider>
    </AppErrorBoundary>
  );
}

export default App;
