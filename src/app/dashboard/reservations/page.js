"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserWidgets, getUserBookings } from "@/lib/firestore";
import SetupWizard from "@/components/SetupWizard";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
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
  const [setupCompleted, setSetupCompleted] = useState(true); // Par défaut true pour éviter flash
  const [currentWidgetId, setCurrentWidgetId] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState(null); // Config du widget pour l'aperçu

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
      
      // Le widget est créé automatiquement à l'inscription
      // Donc on devrait toujours en avoir un
      if (widgetsResult.data.length === 0) {
        // Cas rare : pas de widget (ancien compte ou bug)
        console.error('❌ Aucun widget trouvé pour cet utilisateur');
        setLoading(false);
        return;
      }
      
      const widget = widgetsResult.data[0];
      setCurrentWidgetId(widget.id);
      setWidgetConfig(widget.config); // Stocker la config pour l'aperçu
      
      console.log('📦 Widget chargé:', widget.id);
      console.log('🔧 Setup complété:', widget.setupCompleted);
      
      // Vérifier si le wizard doit être affiché
      if (widget.setupCompleted === true) {
        setSetupCompleted(true);
      } else {
        // Vérifier si l'utilisateur a déjà des véhicules configurés (ancien utilisateur)
        const hasExistingConfig = widget.config?.vehicleCategories?.length > 0;
        if (hasExistingConfig) {
          // Ancien utilisateur avec config existante → pas de wizard
          setSetupCompleted(true);
        } else {
          // Nouveau utilisateur ou config vide → wizard
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

  // Callback quand le wizard est terminé
  const handleWizardComplete = () => {
    setSetupCompleted(true);
    setShowSuccessToast(true);
    loadDashboardData(); // Recharger les données
    
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // ==========================================
  // AFFICHER LE WIZARD SI SETUP NON COMPLÉTÉ
  // ==========================================
  if (!setupCompleted) {
    return (
      <SetupWizard
        widgetId={currentWidgetId}
        userId={user.uid}
        onComplete={handleWizardComplete}
      />
    );
  }

  const menuItems = [
    {
      title: "Véhicules",
      description: "Catégories et tarifs",
      icon: "🚗",
      path: "/dashboard/vehicles",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Majorations",
      description: "Suppléments horaires",
      icon: "⏰",
      path: "/dashboard/surcharges",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Forfaits",
      description: "Trajets à prix fixe",
      icon: "📦",
      path: "/dashboard/packages",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Codes Promo",
      description: "Réductions et offres",
      icon: "🎟️",
      path: "/dashboard/promo",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
    },
    {
      title: "Zones",
      description: "Secteurs couverts",
      icon: "📍",
      path: "/dashboard/zones",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
    {
      title: "Paiement",
      description: "Modes acceptés",
      icon: "💳",
      path: "/dashboard/payment",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      title: "Mode Vacances",
      description: "Fermeture temporaire",
      icon: "🏖️",
      path: "/dashboard/vacation",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      title: "Réservations",
      description: "Toutes les courses",
      icon: "📋",
      path: "/dashboard/reservations",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Paramètres",
      description: "Personnaliser le widget",
      icon: "⚙️",
      path: "/dashboard/settings",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      
      {/* Toast de succès après le wizard */}
      {showSuccessToast && (
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
      )}

      {/* Header moderne */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">V</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  VTC Dashboard
                </h1>
                <p className="text-sm text-gray-600">Bienvenue, {user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - CLIQUABLES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            onClick={() => router.push('/dashboard/reservations')}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition cursor-pointer hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Réservations
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => router.push('/dashboard/reservations?filter=pending')}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition cursor-pointer hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.pending}
                </p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => router.push('/dashboard/reservations?filter=confirmed')}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition cursor-pointer hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmées</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.confirmed}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.revenue.toFixed(0)}€
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* SECTION MON FORMULAIRE - SIMPLE */}
        {/* ============================================ */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Mon Formulaire de Réservation</h2>
                  <p className="text-sm text-gray-600">Partagez-le avec vos clients</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  🎨 Personnaliser
                </button>
                <a
                  href={currentWidgetId ? `/widget/${currentWidgetId}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  👁️ Voir
                </a>
              </div>
            </div>

            {/* URL */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">🔗 Lien de votre formulaire</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentWidgetId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/widget/${currentWidgetId}` : 'Chargement...'}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-700"
                />
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/widget/${currentWidgetId}`;
                    navigator.clipboard.writeText(url);
                    alert('✅ Lien copié !');
                  }}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  📋 Copier
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push('/dashboard/settings#export')}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                📦 Code iFrame
              </button>
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/widget/${currentWidgetId}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: 'Réservation VTC', url });
                    } catch (err) {
                      if (err.name !== 'AbortError') {
                        navigator.clipboard.writeText(url);
                        alert('✅ Lien copié !');
                      }
                    }
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('✅ Lien copié !');
                  }
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                📤 Partager
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Réservez votre VTC ici : ${typeof window !== 'undefined' ? `${window.location.origin}/widget/${currentWidgetId}` : ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Menu de gestion */}
        {/* Section titre */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
          <p className="text-gray-600 mt-1">
            Gérez tous les paramètres de votre service VTC
          </p>
        </div>

        {/* Menu Grid moderne */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className={`group relative bg-white rounded-2xl shadow-lg p-6 border-2 ${item.borderColor} hover:shadow-2xl hover:scale-105 transition-all duration-300`}
            >
              {/* Gradient background au hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
              ></div>

              <div className="relative">
                {/* Icon */}
                <div
                  className={`w-16 h-16 ${item.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-4xl">{item.icon}</span>
                </div>

                {/* Texte */}
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>

                {/* Flèche */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    ></path>
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Dernières réservations */}
        {bookings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Dernières Réservations
              </h2>
              <button
                onClick={() => router.push("/dashboard/reservations")}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
              >
                Voir tout
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        booking.status === "confirmed"
                          ? "bg-green-100"
                          : booking.status === "pending"
                          ? "bg-orange-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {booking.status === "confirmed"
                        ? "✓"
                        : booking.status === "pending"
                        ? "⏳"
                        : "○"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.customer?.name || "Client"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.trip?.departure?.substring(0, 30)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {booking.pricing?.priceEstimate?.toFixed(2)}€
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.trip?.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}