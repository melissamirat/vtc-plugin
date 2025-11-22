'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserWidgets, getUserBookings } from '@/lib/firestore';

export default function DashboardPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [widgets, setWidgets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;

    const widgetsResult = await getUserWidgets(user.uid);
    if (widgetsResult.success) {
      setWidgets(widgetsResult.data);
    }

    const bookingsResult = await getUserBookings(user.uid, 10);
    if (bookingsResult.success) {
      setBookings(bookingsResult.data);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
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
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenue {userData?.displayName || user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Widgets actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {widgets.length}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réservations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {bookings.length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan actuel</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 capitalize">
                  {userData?.plan || 'Basic'}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Configurer Widget */}
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="flex items-center p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Configurer mon widget</p>
                <p className="text-sm text-gray-600">Personnaliser couleurs, tarifs, etc.</p>
              </div>
            </button>

            {/* Voir Réservations */}
            <button
              onClick={() => router.push('/dashboard/reservations')}
              className="flex items-center p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all"
            >
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Voir mes réservations</p>
                <p className="text-sm text-gray-600">Gérer toutes les réservations</p>
              </div>
            </button>

            {/* Code d'intégration - NOUVEAU */}
            <button
              onClick={() => router.push('/dashboard/integration')}
              className="flex items-center p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
            >
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Obtenir le code d'intégration</p>
                <p className="text-sm text-gray-600">Code iframe pour votre site</p>
              </div>
            </button>

            {/* Gérer Abonnement - NOUVEAU */}
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="flex items-center p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all"
            >
              <div className="bg-orange-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Gérer mon abonnement</p>
                <p className="text-sm text-gray-600">Facturation et paiements</p>
              </div>
            </button>

          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Dernières réservations</h2>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-gray-600 text-lg mb-2">Aucune réservation pour le moment</p>
                <p className="text-gray-500 text-sm">Configurez votre widget pour commencer à recevoir des réservations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.customer?.name}</p>
                      <p className="text-sm text-gray-600">
                        {booking.trip?.departure} → {booking.trip?.arrival}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{booking.pricing?.priceEstimate} €</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}