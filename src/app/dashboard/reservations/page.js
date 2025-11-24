'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserBookings, updateBookingStatus, getUserWidgets, deleteBooking } from '@/lib/firestore';

// Popup de confirmation
function ConfirmationModal({ isOpen, onClose, onConfirm, booking, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-3">
          Confirmer cette réservation ?
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Client :</strong> {booking?.customer?.name || 'Client'}
          </p>
          <p className="text-sm text-blue-800 mb-2">
            <strong>Date :</strong> {booking?.trip?.date} à {booking?.trip?.time}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Montant :</strong> {booking?.pricing?.priceEstimate || 0} €
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Attention :</strong> Un email de confirmation sera envoyé au client. 
            Veuillez vous assurer de pouvoir assurer cette course avant de confirmer.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Retour
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Envoi...
              </>
            ) : (
              '✓ Confirmer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Popup d'annulation avec sélection du motif
function CancellationModal({ isOpen, onClose, onConfirm, booking, isLoading }) {
  const [selectedReason, setSelectedReason] = useState('');
  
  const cancellationReasons = [
    { id: 'zone_not_served', label: 'Zone non desservie', icon: '📍' },
    { id: 'driver_unavailable', label: 'Chauffeur indisponible', icon: '👨‍✈️' },
    { id: 'vehicle_unavailable', label: 'Véhicule indisponible', icon: '🚗' },
    { id: 'client_request', label: 'Demande du client', icon: '👤' },
    { id: 'other', label: 'Autre motif', icon: '📝' },
  ];

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedReason) return;
    const reason = cancellationReasons.find(r => r.id === selectedReason);
    onConfirm(reason?.label || selectedReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-3">
          Annuler cette réservation ?
        </h2>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800 mb-2">
            <strong>Client :</strong> {booking?.customer?.name || 'Client'}
          </p>
          <p className="text-sm text-red-800 mb-2">
            <strong>Date :</strong> {booking?.trip?.date} à {booking?.trip?.time}
          </p>
          <p className="text-sm text-red-800">
            <strong>Montant :</strong> {booking?.pricing?.priceEstimate || 0} €
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Sélectionnez le motif d'annulation :
          </label>
          <div className="space-y-2">
            {cancellationReasons.map((reason) => (
              <label
                key={reason.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedReason === reason.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                <span className="text-sm font-medium text-gray-700">{reason.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-yellow-800">
            <strong>⚠️</strong> Un email d'annulation sera envoyé au client avec le motif sélectionné.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Retour
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !selectedReason}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Envoi...
              </>
            ) : (
              '✗ Annuler la réservation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Popup de succès/erreur
function ResultModal({ isOpen, onClose, isSuccess, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          )}
        </div>

        <h2 className={`text-xl font-bold text-center mb-3 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
          {isSuccess ? 'Réservation confirmée !' : 'Erreur'}
        </h2>

        <p className="text-gray-700 text-center mb-6">
          {message}
        </p>

        <button
          onClick={onClose}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Pour le popup de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  // Pour le popup d'annulation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Pour le popup de résultat
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  
  // Pour les véhicules (pour afficher le vrai nom)
  const [vehicles, setVehicles] = useState([]);
  const [widgetConfig, setWidgetConfig] = useState(null);

  // Lire le filtre depuis l'URL au chargement
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter && ['all', 'pending', 'confirmed'].includes(urlFilter)) {
      setFilter(urlFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;

    // Charger les réservations
    const bookingsResult = await getUserBookings(user.uid, 100);
    if (bookingsResult.success) {
      setBookings(bookingsResult.data);
    }
    
    // Charger les véhicules pour afficher les vrais noms
    const widgetsResult = await getUserWidgets(user.uid);
    if (widgetsResult.success && widgetsResult.data.length > 0) {
      const widget = widgetsResult.data[0];
      setWidgetConfig(widget.config);
      setVehicles(widget.config?.vehicleCategories || []);
    }
    
    setLoading(false);
  };

  // Trouver le nom du véhicule à partir de son ID
  const getVehicleName = (vehicleId) => {
    if (!vehicleId) return '-';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.icon || '🚗'} ${vehicle.name}` : vehicleId;
  };

  // Ouvrir le popup de confirmation
  const handleConfirmClick = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);
  };

  // Ouvrir le popup d'annulation
  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  // Annuler la réservation avec motif, envoyer email et SUPPRIMER
  const handleCancelBooking = async (reason) => {
    if (!selectedBooking) return;
    
    setCancelLoading(true);
    
    try {
      // 1. Envoyer l'email d'annulation au client AVANT de supprimer
      try {
        const vehicle = vehicles.find(v => v.id === selectedBooking.details?.vehicleType);
        
        await fetch('/api/send-cancellation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking: {
              id: selectedBooking.id,
              customer: selectedBooking.customer,
              departure: { address: selectedBooking.trip?.departure },
              arrival: { address: selectedBooking.trip?.arrival },
              date: selectedBooking.trip?.date,
              time: selectedBooking.trip?.time,
              passengers: selectedBooking.details?.passengers,
              vehicle: vehicle || { name: selectedBooking.details?.vehicleType },
              pricing: {
                priceEstimate: selectedBooking.pricing?.priceEstimate,
              },
            },
            config: widgetConfig,
            reason: reason,
          }),
        });
        
        console.log('✅ Email d\'annulation envoyé');
      } catch (emailError) {
        console.error('⚠️ Erreur envoi email:', emailError);
      }
      
      // 2. Supprimer la réservation de Firestore
      const result = await deleteBooking(selectedBooking.id);
      
      if (result.success) {
        // 3. Supprimer localement de la liste
        setBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
        
        // 4. Afficher le message de succès
        setShowCancelModal(false);
        setResultSuccess(true);
        setResultMessage(`La réservation de ${selectedBooking.customer?.name || 'Client'} a été annulée et supprimée. Un email a été envoyé au client.`);
        setShowResultModal(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setShowCancelModal(false);
      setResultSuccess(false);
      setResultMessage('Une erreur est survenue lors de l\'annulation.');
      setShowResultModal(true);
    }
    
    setCancelLoading(false);
    setSelectedBooking(null);
  };

  // Confirmer la réservation et envoyer l'email
  const handleConfirmBooking = async () => {
    if (!selectedBooking) return;
    
    setConfirmLoading(true);
    
    try {
      // 1. Mettre à jour le statut dans Firestore
      const result = await updateBookingStatus(selectedBooking.id, 'confirmed');
      
      if (result.success) {
        // 2. Envoyer l'email de confirmation au client
        try {
          const vehicle = vehicles.find(v => v.id === selectedBooking.details?.vehicleType);
          
          await fetch('/api/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking: {
                id: selectedBooking.id,
                customer: selectedBooking.customer,
                departure: { address: selectedBooking.trip?.departure },
                arrival: { address: selectedBooking.trip?.arrival },
                date: selectedBooking.trip?.date,
                time: selectedBooking.trip?.time,
                passengers: selectedBooking.details?.passengers,
                luggage: selectedBooking.details?.luggage,
                vehicle: vehicle || { name: selectedBooking.details?.vehicleType },
                distance: selectedBooking.pricing?.distanceKm,
                pricing: {
                  priceEstimate: selectedBooking.pricing?.priceEstimate,
                },
                paymentMethod: selectedBooking.payment?.method === 'driver' ? 'Paiement au chauffeur' : 'Paiement en ligne',
              },
              config: widgetConfig,
            }),
          });
          
          console.log('✅ Email de confirmation envoyé');
        } catch (emailError) {
          console.error('⚠️ Erreur envoi email:', emailError);
        }
        
        // 3. Mettre à jour localement
        setBookings(prev => 
          prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'confirmed' } : b)
        );
        
        // 4. Afficher le message de succès
        setShowConfirmModal(false);
        setResultSuccess(true);
        setResultMessage(`La réservation de ${selectedBooking.customer?.name || 'Client'} a été confirmée. Un email de confirmation a été envoyé.`);
        setShowResultModal(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setShowConfirmModal(false);
      setResultSuccess(false);
      setResultMessage('Une erreur est survenue lors de la confirmation.');
      setShowResultModal(true);
    }
    
    setConfirmLoading(false);
    setSelectedBooking(null);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    // Pour annuler ou remettre en attente, pas besoin de popup
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'confirmed': return 'bg-green-100 text-green-800 border border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return '⏳ En attente';
      case 'confirmed': return '✅ Confirmée';
      case 'cancelled': return '❌ Annulée';
      default: return status;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Modals */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleConfirmBooking}
        booking={selectedBooking}
        isLoading={confirmLoading}
      />
      
      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleCancelBooking}
        booking={selectedBooking}
        isLoading={cancelLoading}
      />
      
      <ResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        isSuccess={resultSuccess}
        message={resultMessage}
      />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                📋 Réservations
              </h1>
              <p className="text-sm text-gray-600">
                {filteredBookings.length} réservation(s)
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⏳ En attente ({bookings.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'confirmed' 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✅ Confirmées ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
          </div>
        </div>

        {/* Liste des réservations */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <p className="text-gray-600 text-lg mb-2">Aucune réservation</p>
            <p className="text-gray-500 text-sm">
              {filter !== 'all' 
                ? 'Essayez de changer le filtre' 
                : 'Les réservations apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="p-6">
                  {/* En-tête */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {booking.customer?.name || 'Client inconnu'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        📧 {booking.customer?.email || '-'}
                      </p>
                      <p className="text-sm text-gray-600">
                        📞 {booking.customer?.phone || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">
                        {booking.pricing?.priceEstimate || '0'} €
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.pricing?.distanceKm || 0} km
                      </p>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">📍 Départ</p>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.trip?.departure || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">🎯 Arrivée</p>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.trip?.arrival || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">📅 Date & Heure</p>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.trip?.date || '-'} à {booking.trip?.time || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">🚗 Véhicule</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getVehicleName(booking.details?.vehicleType)} - {booking.details?.passengers || 0} passager(s)
                      </p>
                    </div>
                  </div>

                  {booking.details?.luggage > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                      🧳 {booking.details.luggage} bagage(s)
                    </p>
                  )}

                  {/* Pied de carte */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Reçue le {formatDate(booking.createdAt)}
                    </p>
                    
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmClick(booking)}
                            className="px-5 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                          >
                            ✓ Confirmer
                          </button>
                          <button
                            onClick={() => handleCancelClick(booking)}
                            className="px-5 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-semibold"
                          >
                            ✗ Annuler
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelClick(booking)}
                          className="px-5 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        >
                          ✗ Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}