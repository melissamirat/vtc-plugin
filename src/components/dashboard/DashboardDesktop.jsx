// src/components/dashboard/DashboardDesktop.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import QRCodeModal from "@/components/QRCodeModal";
import BookingDetailsModal from "@/components/BookingDetailsModal";
import { updateBookingStatus } from "@/lib/firestore";

export default function DashboardDesktop({
  user,
  stats,
  currentWidgetId,
  bookings,
  config, // ✅ AJOUTÉ : config pour récupérer le nom de la société
  onLogout,
  onRefresh,
}) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // ✅ CORRIGÉ : Nom de la société depuis la config
  const companyName = config?.branding?.companyName || "VTC Service";

  // Sécurité : vérifier que user existe
  if (!user) return null;

  const handleConfirmBooking = async (booking) => {
    try {
      // 1. Mettre à jour le statut dans Firestore (direct)
      const updateResult = await updateBookingStatus(booking.id, "confirmed");

      if (!updateResult.success) {
        throw new Error("Erreur mise à jour statut");
      }

      // 2. Envoyer l'email de confirmation
      const emailResponse = await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking: {
            id: booking.id,
            customer: {
              name: booking.customer?.name,
              email: booking.customer?.email,
              phone: booking.customer?.phone,
            },
            departure: {
              address: booking.trip?.departure,
            },
            arrival: {
              address: booking.trip?.destination || booking.trip?.arrival,
            },
            date: booking.trip?.date,
            time: booking.trip?.time,
            passengers: booking.passengers || booking.details?.passengers,
            luggage: booking.luggage || booking.details?.luggage,
            vehicle: booking.vehicle?.name
              ? booking.vehicle
              : { name: booking.details?.vehicleType || booking.vehicle },
            distance: booking.pricing?.distanceKm,
            pricing: {
              priceEstimate: booking.pricing?.priceEstimate,
            },
            paymentMethod:
              booking.payment?.method === "driver"
                ? "Paiement au chauffeur"
                : "Paiement en ligne",
          },
          config: {
            branding: {
              companyName: companyName, // ✅ CORRIGÉ : Utilise le nom dynamique
            },
          },
        }),
      });

      if (emailResponse.ok) {
        alert("✓ Réservation confirmée et email envoyé !");
        if (onRefresh) onRefresh();
      } else {
        throw new Error("Erreur envoi email");
      }
    } catch (error) {
      console.error("Erreur confirmation:", error);
      alert("Erreur lors de la confirmation: " + error.message);
    }
  };

  const handleCancelBooking = async (booking, reason) => {
    try {
      // 1. Envoyer l'email d'annulation AVANT de supprimer
      const emailResponse = await fetch("/api/send-cancellation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking: {
            id: booking.id,
            customer: {
              name: booking.customer?.name,
              email: booking.customer?.email,
              phone: booking.customer?.phone,
            },
            departure: {
              address: booking.trip?.departure,
            },
            arrival: {
              address: booking.trip?.destination || booking.trip?.arrival,
            },
            date: booking.trip?.date,
            time: booking.trip?.time,
            passengers: booking.passengers || booking.details?.passengers,
            vehicle: booking.vehicle || { name: booking.details?.vehicleType },
            pricing: {
              priceEstimate: booking.pricing?.priceEstimate,
            },
          },
          config: {
            branding: {
              companyName: companyName, // ✅ CORRIGÉ : Utilise le nom dynamique
            },
          },
          reason: reason || "Autre motif",
        }),
      });

      if (emailResponse.ok) {
        // 2. Update la réservation de Firestore
        const updateResult = await updateBookingStatus(booking.id, "cancelled");

        if (updateResult.success) {
          alert("✓ Réservation annulée et email envoyé");
          if (onRefresh) onRefresh();
        }
      } else {
        throw new Error("Erreur envoi email");
      }
    } catch (error) {
      console.error("Erreur annulation:", error);
      alert("Erreur lors de l'annulation: " + error.message);
    }
  };

  const copyWidgetUrl = () => {
    const url = `${window.location.origin}/widget/${currentWidgetId}`;
    navigator.clipboard.writeText(url);
    alert("✅ Lien copié !");
  };

  const menuItems = [
    {
      title: "Véhicules",
      description: "Catégories et tarifs",
      icon: "🚗",
      path: "/dashboard/vehicles",
      color: "from-stone-700 to-stone-900",
      bgColor: "bg-stone-50",
      borderColor: "border-stone-200",
    },
    {
      title: "Réservations",
      description: "Toutes les courses",
      icon: "📋",
      path: "/dashboard/reservations",
      color: "from-stone-700 to-stone-900",
      bgColor: "bg-stone-50",
      borderColor: "border-stone-200",
    },
    {
      title: "Majorations",
      description: "Suppléments horaires",
      icon: "⏰",
      path: "/dashboard/surcharges",
      color: "from-orange-700 to-orange-900",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Zones",
      description: "Secteurs couverts",
      icon: "📍",
      path: "/dashboard/zones",
      color: "from-emerald-700 to-emerald-900",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      title: "Forfaits",
      description: "Trajets à prix fixe",
      icon: "📦",
      path: "/dashboard/packages",
      color: "from-amber-700 to-amber-900",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      title: "Paiement",
      description: "Modes acceptés",
      icon: "💳",
      path: "/dashboard/payment",
      color: "from-green-700 to-green-900",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Codes Promo",
      description: "Réductions et offres",
      icon: "🎟️",
      path: "/dashboard/promo",
      color: "from-yellow-700 to-yellow-900",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    
    {
      title: "Disponibilités",
      description: "Fermeture temporaire",
      icon: "🏖️",
      path: "/dashboard/vacation",
      color: "from-orange-600 to-orange-800",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    
    {
      title: "Paramètres",
      description: "Personnaliser le widget",
      icon: "⚙️",
      path: "/dashboard/settings",
      color: "from-stone-600 to-stone-800",
      bgColor: "bg-stone-50",
      borderColor: "border-stone-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50">
      {/* Header Desktop */}
      <header className="bg-white shadow-lg border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-stone-800 to-stone-950 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {companyName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900">
                  {companyName}
                </h1>
                <p className="text-sm text-stone-600">
                  Bienvenue, {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition"
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
        {/* Stats Cards Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/reservations" className="block">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-stone-700 hover:shadow-xl transition cursor-pointer hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">
                    Total Réservations
                  </p>
                  <p className="text-3xl font-bold text-stone-900 mt-2">
                    {stats.total}
                  </p>
                </div>
                <div className="w-14 h-14 bg-stone-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/reservations?filter=pending" className="block">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition cursor-pointer hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">
                    En Attente
                  </p>
                  <p className="text-3xl font-bold text-stone-900 mt-2">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/reservations?filter=confirmed"
            className="block"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition cursor-pointer hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">
                    Confirmées
                  </p>
                  <p className="text-3xl font-bold text-stone-900 mt-2">
                    {stats.confirmed}
                  </p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-stone-800 to-stone-950 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-300">
                  Chiffre d'affaires
                </p>
                <p className="text-3xl font-bold mt-2">
                  {stats.revenue.toFixed(0)}€
                </p>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Réservations du jour */}
        {(() => {
const today = new Date().toLocaleDateString('fr-CA'); // Format YYYY-MM-DD en heure locale
          const todayBookings = bookings.filter((booking) => {
            if (!booking.trip?.date) return false;
            if (booking.status === "cancelled") return false; // ← AJOUTE CETTE LIGNE
            const bookingDate = booking.trip.date.split("T")[0];
            return bookingDate === today;
          });

          if (todayBookings.length === 0) return null;

          return (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 shadow-lg mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🕒</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">
                      Réservations du jour
                    </h2>
                    <p className="text-sm text-stone-600">
                      {new Date().toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-lg">
                  {todayBookings.length} course
                  {todayBookings.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full text-left bg-white rounded-xl p-5 border border-amber-200 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Heure */}
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 bg-stone-900 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                          <span className="text-lg font-bold">
                            {booking.trip?.time?.split(":")[0] || "00"}
                          </span>
                          <span className="text-sm opacity-80">
                            h{booking.trip?.time?.split(":")[1] || "00"}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-stone-900 text-lg">
                              {booking.customer?.name || "Client"}
                            </h3>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                booking.status === "confirmed"
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                  : booking.status === "pending"
                                  ? "bg-orange-100 text-orange-700 border border-orange-300"
                                  : "bg-stone-100 text-stone-700 border border-stone-300"
                              }`}
                            >
                              {booking.status === "confirmed"
                                ? "✓ Confirmée"
                                : booking.status === "pending"
                                ? "⏳ En attente"
                                : "Annulée"}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-stone-900">
                              {booking.pricing?.priceEstimate?.toFixed(2)}€
                            </p>
                            <p className="text-xs text-stone-500">
                              {booking.vehicle?.name || "Véhicule standard"}
                            </p>
                          </div>
                        </div>

                        {/* Trajet */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-lg mt-0.5">📍</span>
                            <div>
                              <p className="text-xs font-semibold text-green-800 mb-1">
                                Départ
                              </p>
                              <p className="text-sm text-stone-700">
                                {booking.trip?.departure || "Adresse de départ"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                            <span className="text-lg mt-0.5">📍</span>
                            <div>
                              <p className="text-xs font-semibold text-red-800 mb-1">
                                Arrivée
                              </p>
                              <p className="text-sm text-stone-700">
                                {booking.trip?.destination ||
                                  "Adresse d'arrivée"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Infos supplémentaires */}
                        {(booking.customer?.phone ||
                          booking.customer?.email) && (
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100">
                            {booking.customer?.phone && (
                              <a
                                href={`tel:${booking.customer.phone}`}
                                className="text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1"
                              >
                                <span>📞</span> {booking.customer.phone}
                              </a>
                            )}
                            {booking.customer?.email && (
                              <a
                                href={`mailto:${booking.customer.email}`}
                                className="text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1"
                              >
                                <span>✉️</span> {booking.customer.email}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Modal de détails de réservation */}
        <BookingDetailsModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelBooking}
        />

        {/* Section Formulaire Desktop */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-stone-800 to-stone-950 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Mon Formulaire de Réservation
                  </h2>
                  <p className="text-sm text-stone-600">
                    Partagez-le avec vos clients
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => (window.location.href = "/dashboard/settings")}
                  className="px-4 py-2.5 bg-gradient-to-r from-stone-800 to-stone-950 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  🎨 Personnaliser
                </button>
                <a
                  href={currentWidgetId ? `/widget/${currentWidgetId}` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-all flex items-center gap-2"
                >
                  👁️ Voir
                </a>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-stone-700 mb-2 block">
                🔗 Lien de votre formulaire
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    currentWidgetId
                      ? `${
                          typeof window !== "undefined"
                            ? window.location.origin
                            : ""
                        }/widget/${currentWidgetId}`
                      : "Chargement..."
                  }
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm text-stone-700"
                />
                <button
                  onClick={copyWidgetUrl}
                  className="px-5 py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 transition-colors"
                >
                  📋 Copier
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  (window.location.href = "/dashboard/settings#export")
                }
                className="px-4 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors flex items-center gap-2"
              >
                📦 Code iFrame
              </button>
              <button
                onClick={() => setShowQRCode(true)}
                className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
              >
                📱 QR Code
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Réservez votre VTC ici : ${
                    typeof window !== "undefined"
                      ? `${window.location.origin}/widget/${currentWidgetId}`
                      : ""
                  }`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        <QRCodeModal
          isOpen={showQRCode}
          onClose={() => setShowQRCode(false)}
          url={`${
            typeof window !== "undefined" ? window.location.origin : ""
          }/widget/${currentWidgetId}`}
          companyName={companyName} // ✅ CORRIGÉ : Utilise le nom dynamique
        />

        {/* Menu de gestion Desktop */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-900">Configuration</h2>
          <p className="text-stone-600 mt-1">
            Gérez tous les paramètres de votre service VTC
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => (window.location.href = item.path)}
              className={`group relative bg-white rounded-2xl shadow-lg p-6 border-2 ${item.borderColor} hover:shadow-2xl hover:scale-105 transition-all duration-300`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
              ></div>

              <div className="relative">
                <div
                  className={`w-16 h-16 ${item.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-4xl">{item.icon}</span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-600">{item.description}</p>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-6 h-6 text-stone-700"
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

        {/* Dernières réservations Desktop */}
        {bookings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-900">
                Dernières Réservations
              </h2>
              <Link
                href="/dashboard/reservations"
                className="text-stone-600 hover:text-stone-900 font-semibold text-sm flex items-center gap-1"
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
              </Link>
            </div>

            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        booking.status === "confirmed"
                          ? "bg-green-100"
                          : booking.status === "pending"
                          ? "bg-orange-100"
                          : booking.status === "cancelled"
                          ? "bg-red-100"
                          : "bg-stone-100"
                      }`}
                    >
                      {booking.status === "confirmed"
                        ? "✅"
                        : booking.status === "pending"
                        ? "⏳"
                        : booking.status === "cancelled"
                        ? "❌"
                        : "○"}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">
                        {booking.customer?.name || "Client"}
                      </p>
                      <p className="text-sm text-stone-600">
                        {booking.trip?.departure?.substring(0, 30)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-stone-900">
                      {booking.pricing?.priceEstimate?.toFixed(2)}€
                    </p>
                    <p className="text-xs text-stone-500">
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