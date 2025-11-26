// src/components/dashboard/DashboardMobile.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import QRCodeModal from "@/components/QRCodeModal";
import BookingDetailsModal from "@/components/BookingDetailsModal";
import { updateBookingStatus } from "@/lib/firestore";

export default function DashboardMobile({
  user,
  stats,
  currentWidgetId,
  bookings,
  config, // ✅ AJOUTÉ : config pour récupérer le nom de la société
  onLogout,
  onRefresh,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // ✅ CORRIGÉ : Nom de la société depuis la config
  const companyName = config?.branding?.companyName || "VTC Service";

  // Sécurité : vérifier que user existe
  if (!user) return null;

  const handleConfirmBooking = async (booking) => {
    try {
      // 1. Mettre à jour le statut dans Firestore
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
        // Toast succès
        const toast = document.createElement("div");
        toast.className =
          "fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50";
        toast.textContent = "✓ Réservation confirmée et email envoyé !";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        // Rafraîchir
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
        // 2. Supprimer la réservation de Firestore
        const updateResult = await updateBookingStatus(booking.id, "cancelled");

        if (updateResult.success) {
          // Toast succès
          const toast = document.createElement("div");
          toast.className =
            "fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50";
          toast.textContent = "✓ Réservation annulée et email envoyé";
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);

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

    // Toast moderne
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 animate-in slide-in-from-top-2";
    toast.textContent = "✓ Lien copié";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const menuItems = [
    {
      title: "Réservations",
      icon: "📋",
      path: "/dashboard/reservations",
      badge: null,
    },
    {
      title: "Véhicules",
      icon: "🚗",
      path: "/dashboard/vehicles",
      badge: null,
    },
    {
      title: "Majorations",
      icon: "⏰",
      path: "/dashboard/surcharges",
      badge: null,
    },
    { title: "Forfaits", icon: "📦", path: "/dashboard/packages", badge: null },
    { title: "Codes Promo", icon: "🎟️", path: "/dashboard/promo", badge: null },
    { title: "Zones", icon: "📍", path: "/dashboard/zones", badge: null },
    { title: "Paiement", icon: "💳", path: "/dashboard/payment", badge: null },
    { title: "Vacances", icon: "🏖️", path: "/dashboard/vacation", badge: null },
    {
      title: "Paramètres",
      icon: "⚙️",
      path: "/dashboard/settings",
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header fixe professionnel */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Logo + Titre */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold">
                {companyName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              {/* ✅ CORRIGÉ : Utilise le nom dynamique */}
              <h1 className="text-base font-bold text-stone-900">{companyName}</h1>
              <p className="text-xs text-stone-500">Dashboard</p>
            </div>
          </div>

          {/* Bouton Menu Hamburger */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-stone-100 active:bg-stone-200 transition"
          >
            <svg
              className="w-6 h-6 text-stone-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showMenu ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Menu slide-in */}
      {showMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
            onClick={() => setShowMenu(false)}
          />

          {/* Panneau menu */}
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6">
              {/* En-tête menu */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-stone-900 text-lg">Menu</h2>
                  <p className="text-xs text-stone-500">{user.email}</p>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Items menu */}
              <nav className="space-y-1 mb-6">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition group"
                    onClick={() => setShowMenu(false)}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium text-stone-700 group-hover:text-stone-900">
                      {item.title}
                    </span>
                    <svg
                      className="w-4 h-4 ml-auto text-stone-400 group-hover:text-stone-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ))}
              </nav>

              {/* Bouton déconnexion */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 text-white rounded-xl font-semibold active:scale-95 transition"
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
                  />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </>
      )}

      {/* Contenu principal */}
      <main className="px-4 pt-6 space-y-6">
        {/* Stats - Design professionnel */}
        <div>
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">
            Aperçu
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Total */}
            <Link href="/dashboard/reservations" className="block group">
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center group-hover:bg-stone-900 transition">
                    <span className="text-xl group-hover:invert">📋</span>
                  </div>
                  <svg
                    className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-stone-900 mb-1">
                  {stats.total}
                </p>
                <p className="text-xs font-medium text-stone-500">
                  Total réservations
                </p>
              </div>
            </Link>

            {/* En attente */}
            <Link
              href="/dashboard/reservations?filter=pending"
              className="block group"
            >
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center">
                    <span className="text-xl">⏳</span>
                  </div>
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-orange-900 mb-1">
                  {stats.pending}
                </p>
                <p className="text-xs font-medium text-orange-700">
                  En attente
                </p>
              </div>
            </Link>

            {/* Confirmées */}
            <Link
              href="/dashboard/reservations?filter=confirmed"
              className="block group"
            >
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center">
                    <span className="text-xl">✓</span>
                  </div>
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-emerald-900 mb-1">
                  {stats.confirmed}
                </p>
                <p className="text-xs font-medium text-emerald-700">
                  Confirmées
                </p>
              </div>
            </Link>

            {/* Chiffre d'affaires */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {stats.revenue.toFixed(0)}€
              </p>
              <p className="text-xs font-medium text-stone-300">
                Chiffre d'affaires
              </p>
            </div>
          </div>
        </div>

        {/* Réservations du jour */}
        {(() => {
const today = new Date().toLocaleDateString('fr-CA'); // Format YYYY-MM-DD en heure locale
          const todayBookings = bookings.filter((booking) => {
            if (!booking.trip?.date) return false;
            if (booking.status === "cancelled") return false;
            const bookingDate = booking.trip.date.split("T")[0];
            return bookingDate === today;
          });

          if (todayBookings.length === 0) return null;

          return (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                  Aujourd'hui ({todayBookings.length})
                </h2>
                <span className="text-xs text-stone-400">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>

              <div className="space-y-2">
                {todayBookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full text-left bg-white rounded-xl p-3 border-2 border-amber-200 shadow-sm relative overflow-hidden active:scale-98 transition"
                  >
                    {/* Badge "Aujourd'hui" */}
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        🕒 Aujourd'hui
                      </span>
                    </div>

                    <div className="flex items-start gap-3 mt-6">
                      {/* Heure */}
                      <div className="flex-shrink-0 text-center">
                        <div className="w-12 h-12 bg-stone-900 rounded-xl flex flex-col items-center justify-center text-white">
                          <span className="text-xs font-bold">
                            {booking.trip?.time?.split(":")[0] || "00"}
                          </span>
                          <span className="text-xs opacity-80">
                            h{booking.trip?.time?.split(":")[1] || "00"}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-stone-900 text-sm">
                            {booking.customer?.name || "Client"}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-700"
                                : booking.status === "pending"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {booking.status === "confirmed"
                              ? "✓ Confirmée"
                              : booking.status === "pending"
                              ? "⏳ En attente"
                              : "Annulée"}
                          </span>
                        </div>

                        {/* Trajet */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-start gap-1">
                            <span className="text-green-600 mt-0.5">📍</span>
                            <p className="text-stone-600 line-clamp-1">
                              {booking.trip?.departure || "Adresse de départ"}
                            </p>
                          </div>
                          <div className="flex items-start gap-1">
                            <span className="text-red-600 mt-0.5">📍</span>
                            <p className="text-stone-600 line-clamp-1">
                              {booking.trip?.destination || "Adresse d'arrivée"}
                            </p>
                          </div>
                        </div>

                        {/* Prix et véhicule */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                          <span className="text-xs text-stone-500">
                            {booking.vehicle?.name || "Véhicule standard"}
                          </span>
                          <span className="font-bold text-stone-900 text-sm">
                            {booking.pricing?.priceEstimate?.toFixed(0)}€
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Widget - Carte professionnelle */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                <span className="text-lg">🔗</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-900 text-sm">
                  Lien de réservation
                </h3>
                <p className="text-xs text-stone-500">
                  Partagez avec vos clients
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* URL */}
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${
                  typeof window !== "undefined" ? window.location.origin : ""
                }/widget/${currentWidgetId}`}
                className="flex-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-mono"
              />
              <button
                onClick={copyWidgetUrl}
                className="px-4 py-2.5 bg-stone-900 text-white rounded-xl font-semibold active:scale-95 transition flex items-center gap-2"
              >
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/dashboard/settings"
                className="px-3 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-medium text-center active:bg-stone-200 transition"
              >
                Modifier
              </Link>
              <a
                href={`/widget/${currentWidgetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-medium text-center active:bg-stone-200 transition"
              >
                Prévisualiser
              </a>
              <button
                onClick={() => setShowQRCode(true)}
                className="px-3 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-medium text-center active:bg-stone-800 transition"
              >
                QR Code
              </button>
            </div>

            {/* WhatsApp button full width */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Réservez : ${
                  typeof window !== "undefined"
                    ? `${window.location.origin}/widget/${currentWidgetId}`
                    : ""
                }`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-3 py-2.5 bg-green-600 text-white rounded-xl text-xs font-medium text-center active:bg-green-700 transition"
            >
              💬 Partager sur WhatsApp
            </a>
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

        {/* Réservations récentes */}
        {bookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                Activité récente
              </h2>
              <Link
                href="/dashboard/reservations"
                className="text-xs font-semibold text-stone-900"
              >
                Voir tout →
              </Link>
            </div>

            <div className="space-y-2">
              {bookings.slice(0, 4).map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {/* Status badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        booking.status === "confirmed"
                          ? "bg-emerald-100"
                          : booking.status === "pending"
                          ? "bg-orange-100"
                          : booking.status === "cancelled"
                          ? "bg-red-100"
                          : "bg-stone-100"
                      }`}
                    >
                      <span className="text-base">
                        {booking.status === "confirmed"
                          ? "✅"
                          : booking.status === "pending"
                          ? "⏳"
                          : booking.status === "cancelled"
                          ? "❌"
                          : "○"}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-stone-900 text-sm">
                          {booking.customer?.name || "Client"}
                        </p>
                        <p className="font-bold text-stone-900 text-sm flex-shrink-0">
                          {booking.pricing?.priceEstimate?.toFixed(0)}€
                        </p>
                      </div>
                      <p className="text-xs text-stone-500 truncate mb-1">
                        {booking.trip?.departure}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : booking.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {booking.status === "confirmed"
                            ? "Confirmée"
                            : booking.status === "pending"
                            ? "En attente"
                            : "Annulée"}
                        </span>
                        <span className="text-xs text-stone-400">
                          {booking.trip?.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accès rapide */}
        <div>
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">
            Accès rapide
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <Link
              href="/dashboard/vehicles"
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 active:scale-95 transition"
            >
              <span className="text-2xl">🚗</span>
              <span className="text-xs font-medium text-stone-700 text-center">
                Véhicules
              </span>
            </Link>
            <Link
              href="/dashboard/packages"
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 active:scale-95 transition"
            >
              <span className="text-2xl">📦</span>
              <span className="text-xs font-medium text-stone-700 text-center">
                Forfaits
              </span>
            </Link>
            <Link
              href="/dashboard/zones"
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 active:scale-95 transition"
            >
              <span className="text-2xl">📍</span>
              <span className="text-xs font-medium text-stone-700 text-center">
                Zones
              </span>
            </Link>
            <Link
              href="/dashboard/promo"
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 active:scale-95 transition"
            >
              <span className="text-2xl">🎟️</span>
              <span className="text-xs font-medium text-stone-700 text-center">
                Promo
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* Modal de détails de réservation */}
      <BookingDetailsModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
      />
    </div>
  );
}