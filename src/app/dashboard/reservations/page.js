'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserBookings, updateBookingStatus } from '@/lib/firestore';

export default function ReservationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadBookings();
  }, [user, router]);

  const loadBookings = async () => {
    if (!user) return;

    const result = await getUserBookings(user.uid, 100);
    if (result.success) {
      setBookings(result.data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      // Mettre à jour localement
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'cancelled': return 'Annulée';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
              <p className="text-sm text-gray-600">
                {filteredBookings.length} réservation(s) trouvée(s)
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente ({bookings.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'confirmed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmées ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'cancelled' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Annulées ({bookings.filter(b => b.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Liste des réservations */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-600 text-lg mb-2">Aucune réservation trouvée</p>
            <p className="text-gray-500 text-sm">
              {filter !== 'all' 
                ? 'Essayez de changer le filtre' 
                : 'Les réservations apparaîtront ici une fois que des clients utiliseront votre widget'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
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
                      <p className="text-2xl font-bold text-blue-600">
                        {booking.pricing?.priceEstimate || '0'} €
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.pricing?.distanceKm || 0} km
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
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
                        {booking.details?.vehicleType || '-'} - {booking.details?.passengers || 0} passager(s)
                      </p>
                    </div>
                  </div>

                  {booking.details?.luggage > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                      🧳 {booking.details.luggage} bagage(s) supplémentaire(s)
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Reçue le {formatDate(booking.createdAt)}
                    </p>
                    
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            ✓ Confirmer
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            ✗ Annuler
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          ✗ Annuler
                        </button>
                      )}
                      {booking.status === 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'pending')}
                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          ↺ Remettre en attente
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
