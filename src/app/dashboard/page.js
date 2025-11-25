"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserWidgets, getUserBookings } from "@/lib/firestore";
import { useIsMobile } from "@/hooks/useIsMobile";
import SetupWizard from "@/components/SetupWizard";
import DashboardMobile from "@/components/dashboard/DashboardMobile";
import DashboardDesktop from "@/components/dashboard/DashboardDesktop";
import DevTools from '@/components/DevTools';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile(768);
  
  const [widgets, setWidgets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // États pour le Wizard
  const [setupCompleted, setSetupCompleted] = useState(true);
  const [currentWidgetId, setCurrentWidgetId] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    if (!user) return;

    const widgetsResult = await getUserWidgets(user.uid);
    if (widgetsResult.success) {
      setWidgets(widgetsResult.data);
      
      if (widgetsResult.data.length === 0) {
        console.error('❌ Aucun widget trouvé pour cet utilisateur');
        setLoading(false);
        return;
      }
      
      const widget = widgetsResult.data[0];
      setCurrentWidgetId(widget.id);
      setWidgetConfig(widget.config);
      
      // ✅ CORRECTION ICI : Respecter le setupCompleted de Firebase
      if (widget.setupCompleted === false) {
        // Si setupCompleted est explicitement false, on lance le wizard
        console.log('🔄 setupCompleted est false, lancement du wizard');
        setSetupCompleted(false);
      } else if (widget.setupCompleted === true) {
        // Si setupCompleted est true, on affiche le dashboard
        console.log('✅ setupCompleted est true, affichage du dashboard');
        setSetupCompleted(true);
      } else {
        // Si setupCompleted n'existe pas, on vérifie s'il y a une config
        const hasExistingConfig = widget.config?.vehicleCategories?.length > 0;
        if (hasExistingConfig) {
          console.log('✅ Config existante trouvée, affichage du dashboard');
          setSetupCompleted(true);
        } else {
          console.log('⚠️ Pas de config, lancement du wizard');
          setSetupCompleted(false);
        }
      }
    }

    const bookingsResult = await getUserBookings(user.uid, 10);
    if (bookingsResult.success) {
      setBookings(bookingsResult.data);

      const total = bookingsResult.data.length;
      const pending = bookingsResult.data.filter(
        (b) => b.status === "pending"
      ).length;
      const confirmed = bookingsResult.data.filter(
        (b) => b.status === "confirmed"
      ).length;
      const revenue = bookingsResult.data
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.pricing?.priceEstimate || 0), 0);

      setStats({ total, pending, confirmed, revenue });
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handleWizardComplete = () => {
    setSetupCompleted(true);
    setShowSuccessToast(true);
    loadDashboardData();
    
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-stone-800 border-t-transparent"></div>
      </div>
    );
  }

  if (!setupCompleted) {
    return (
      <SetupWizard
        widgetId={currentWidgetId}
        userId={user?.uid}
        onComplete={handleWizardComplete}
      />
    );
  }

  if (!user) {
    return null;
  }

  // Toast de succès
  const successToast = showSuccessToast && (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <div>
          <p className="font-bold">Configuration terminée !</p>
          <p className="text-sm opacity-90">Votre espace VTC est prêt.</p>
        </div>
        <button 
          onClick={() => setShowSuccessToast(false)}
          className="ml-4 text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <>
      {successToast}
      {isMobile ? (
        <DashboardMobile
          user={user}
          stats={stats}
          currentWidgetId={currentWidgetId}
          bookings={bookings}
          config={widgetConfig}
          onLogout={handleLogout}
          onRefresh={loadDashboardData}
        />
      ) : (
        <DashboardDesktop
          user={user}
          stats={stats}
          currentWidgetId={currentWidgetId}
          bookings={bookings}
          config={widgetConfig}
          onLogout={handleLogout}
          onRefresh={loadDashboardData}
        />
      )}
      <DevTools widgetId={currentWidgetId} />
    </>
  );
}