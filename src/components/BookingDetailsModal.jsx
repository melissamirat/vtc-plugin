// src/components/BookingDetailsModal.jsx
"use client";

import { useState } from 'react';

export default function BookingDetailsModal({ isOpen, onClose, booking, onConfirm, onCancel }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelReasons, setShowCancelReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  if (!isOpen || !booking) return null;

  const cancellationReasons = [
    { id: 'zone_not_served', label: 'Zone non desservie', icon: '📍' },
    { id: 'driver_unavailable', label: 'Chauffeur indisponible', icon: '👨‍✈️' },
    { id: 'vehicle_unavailable', label: 'Véhicule indisponible', icon: '🚗' },
    { id: 'client_request', label: 'Demande du client', icon: '👤' },
    { id: 'other', label: 'Autre motif', icon: '📝' },
  ];

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm(booking);
    setIsConfirming(false);
    onClose();
  };

  const handleCancelClick = () => {
    setShowCancelReasons(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedReason) {
      alert('Veuillez sélectionner un motif d\'annulation');
      return;
    }
    
    setIsCancelling(true);
    const reason = cancellationReasons.find(r => r.id === selectedReason);
    await onCancel(booking, reason?.label || 'Autre motif');
    setIsCancelling(false);
    setShowCancelReasons(false);
    setSelectedReason('');
    onClose();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          border: 'border-emerald-300',
          label: 'Confirmée',
          icon: '✓'
        };
      case 'pending':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-300',
          label: 'En attente',
          icon: '⏳'
        };
      default:
        return {
          bg: 'bg-stone-100',
          text: 'text-stone-800',
          border: 'border-stone-300',
          label: 'Annulée',
          icon: '✕'
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-4 sm:p-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold">Détails réservation</h2>
                <p className="text-xs text-white/70">#{booking.id?.substring(0, 8)}</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition border border-white/20"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Statut */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
              <span className="text-sm">{statusConfig.icon}</span>
              {statusConfig.label}
            </span>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-stone-900">{booking.pricing?.priceEstimate?.toFixed(2)}€</p>
              <p className="text-xs text-stone-500">Prix total</p>
            </div>
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
              <p className="text-xs font-medium text-stone-500 mb-1">📅 Date</p>
              <p className="text-sm font-semibold text-stone-900">
                {booking.trip?.date ? new Date(booking.trip.date).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                }) : 'Non définie'}
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
              <p className="text-xs font-medium text-stone-500 mb-1">🕐 Heure</p>
              <p className="text-sm font-semibold text-stone-900">{booking.trip?.time || 'Non définie'}</p>
            </div>
          </div>

          {/* Trajet */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-900">📍 Trajet</h3>
            
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-1">Départ</p>
              <p className="text-sm text-stone-900">
                {booking.trip?.departure || booking.departure || 'Non défini'}
              </p>
            </div>

            <div className="flex justify-center py-1">
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            <div className="bg-red-50 rounded-xl p-3 border border-red-200">
              <p className="text-xs font-medium text-red-700 mb-1">Arrivée</p>
              <p className="text-sm text-stone-900">
                {booking.trip?.destination || booking.destination || booking.trip?.arrival || 'Non définie'}
              </p>
            </div>
          </div>

          {/* Client */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 mb-2">👤 Client</h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 w-12">Nom</span>
                <span className="text-sm text-stone-900 font-medium">{booking.customer?.name || 'Non défini'}</span>
              </div>
              {booking.customer?.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 w-12">Tél</span>
                  <a href={`tel:${booking.customer.phone}`} className="text-sm text-stone-900 font-medium hover:text-stone-600">
                    {booking.customer.phone}
                  </a>
                </div>
              )}
              {booking.customer?.email && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 w-12">Email</span>
                  <a href={`mailto:${booking.customer.email}`} className="text-sm text-stone-900 font-medium hover:text-stone-600 truncate">
                    {booking.customer.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Véhicule */}
          {booking.vehicle?.name && (
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 mb-1">🚗 Véhicule</h3>
              <p className="text-sm text-stone-700">{booking.vehicle.name}</p>
            </div>
          )}

          {/* Passagers et bagages */}
          <div className="grid grid-cols-2 gap-3">
            {booking.passengers && (
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
                <p className="text-xs font-medium text-stone-500 mb-1">👥 Passagers</p>
                <p className="text-xl font-bold text-stone-900">{booking.passengers}</p>
              </div>
            )}
            {booking.luggage && (
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
                <p className="text-xs font-medium text-stone-500 mb-1">🧳 Bagages</p>
                <p className="text-xl font-bold text-stone-900">{booking.luggage}</p>
              </div>
            )}
          </div>

          {/* Commentaires */}
          {booking.comments && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <h3 className="text-sm font-bold text-stone-900 mb-1">💬 Commentaires</h3>
              <p className="text-sm text-stone-700">{booking.comments}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 border-t border-stone-200 space-y-2 sm:space-y-3">
          {!showCancelReasons ? (
            <>
              {booking.status === 'pending' && (
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
                >
                  {isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Confirmation...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confirmer la réservation</span>
                    </>
                  )}
                </button>
              )}

              {booking.status !== 'cancelled' && (
                <button
                  onClick={handleCancelClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 active:scale-95 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Annuler la réservation</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold text-sm hover:bg-stone-200 active:scale-95 transition"
              >
                Fermer
              </button>
            </>
          ) : (
            <>
              {/* Sélection du motif d'annulation */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-stone-900 mb-3">
                  Sélectionnez le motif d'annulation :
                </label>
                <div className="space-y-2">
                  {cancellationReasons.map((reason) => (
                    <label
                      key={reason.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedReason === reason.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancellationReason"
                        value={reason.id}
                        checked={selectedReason === reason.id}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xl">{reason.icon}</span>
                      <span className="text-sm font-medium text-stone-700">{reason.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Attention :</strong> Un email d'annulation sera envoyé au client.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCancelReasons(false);
                    setSelectedReason('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-semibold text-sm hover:bg-stone-200 transition"
                >
                  Retour
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={isCancelling || !selectedReason}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Annulation...</span>
                    </>
                  ) : (
                    '✓ Confirmer l\'annulation'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}