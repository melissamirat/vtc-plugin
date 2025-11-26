'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserWidgets, updateVehicleCategories } from '@/lib/firestore';
import { defaultVehicleCategories } from '@/config/vehicleConfig';

export default function VehiclesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [widgets, setWidgets] = useState([]);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
    if (widgetsResult.success && widgetsResult.data.length > 0) {
      setWidgets(widgetsResult.data);
      const widget = widgetsResult.data[0];
      setCurrentWidget(widget);
      
      // Normaliser les véhicules pour s'assurer que luggage et pricing existent
      const loadedVehicles = widget.config?.vehicleCategories || defaultVehicleCategories;
      const normalizedVehicles = loadedVehicles.map(v => ({
        ...v,
        luggage: v.luggage || { included: 2, max: 4, pricePerExtra: 5 },
        pricing: v.pricing || {
          mode: 'km',
          perKm: 0,
          perMinute: 0,
          perHour: 0,
          minPrice: 0,
          kmThreshold: 0
        }
      }));
      
      setVehicles(normalizedVehicles);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentWidget) return;
    
    setSaving(true);
    const result = await updateVehicleCategories(currentWidget.id, vehicles);
    
    if (result.success) {
      setMessage({ type: 'success', text: '✓ Véhicules sauvegardés avec succès !' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
    
    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleAddVehicle = () => {
    const newVehicle = {
      id: `vehicle-${Date.now()}`,
      name: 'Nouveau véhicule',
      description: 'Description',
      maxPassengers: 4,
      luggage: {
        included: 2,
        max: 4,
        pricePerExtra: 5.0
      },
      enabled: true,
      pricing: {
        mode: 'km',
        perKm: 1.5,
        perMinute: 0,
        perHour: 0,
        minPrice: 15.0,
        kmThreshold: 5
      }
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (confirm('Supprimer ce véhicule ?')) {
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      setMessage({ type: 'success', text: 'Véhicule supprimé ! N\'oubliez pas de sauvegarder.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleUpdateVehicle = (vehicleId, field, value) => {
    setVehicles(vehicles.map(v => 
      v.id === vehicleId ? { ...v, [field]: value } : v
    ));
  };

  const handleUpdateLuggage = (vehicleId, field, value) => {
    setVehicles(vehicles.map(v => 
      v.id === vehicleId 
        ? { ...v, luggage: { ...v.luggage, [field]: parseFloat(value) || 0 } }
        : v
    ));
  };

  const handleUpdatePricing = (vehicleId, field, value) => {
    setVehicles(vehicles.map(v => 
      v.id === vehicleId 
        ? { ...v, pricing: { ...v.pricing, [field]: parseFloat(value) || 0 } }
        : v
    ));
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-gray-50 to-gray-100">
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-700 to-stone-600 bg-clip-text text-transparent">
                Gestion des Véhicules
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {vehicles.length} catégorie{vehicles.length !== 1 ? 's' : ''} de véhicule{vehicles.length !== 1 ? 's' : ''}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg border-2 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-stone-50 border-stone-400 text-stone-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <button
            onClick={handleAddVehicle}
            className="px-6 py-3 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Ajouter un véhicule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {vehicles.map((vehicle) => {
            // Initialiser luggage avec des valeurs par défaut AVANT tout usage
            const luggage = vehicle.luggage || { included: 2, max: 4, pricePerExtra: 5 };
            const paidLuggage = luggage.max - luggage.included;
            
            // S'assurer que pricing existe aussi
            const pricing = vehicle.pricing || {
              mode: 'km',
              perKm: 0,
              perMinute: 0,
              perHour: 0,
              minPrice: 0,
              kmThreshold: 0
            };
            
            return (
              <div key={vehicle.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-stone-300 shadow-lg hover:shadow-2xl hover:border-stone-400 transition-all p-6">
              
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={vehicle.name || ''}
                        onChange={(e) => handleUpdateVehicle(vehicle.id, 'name', e.target.value)}
                        className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-stone-300 focus:border-stone-500 outline-none transition-colors w-full mb-0.5"
                      />
                      <input
                        type="text"
                        value={vehicle.description || ''}
                        onChange={(e) => handleUpdateVehicle(vehicle.id, 'description', e.target.value)}
                        className="text-xs text-gray-600 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-stone-500 outline-none w-full transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      vehicle.enabled 
                        ? 'bg-stone-100 text-stone-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <input
                        type="checkbox"
                        checked={vehicle.enabled}
                        onChange={(e) => handleUpdateVehicle(vehicle.id, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-stone-600 focus:ring-stone-500"
                      />
                      <span className="text-xs font-semibold">
                        {vehicle.enabled ? '✓ Actif' : '○ Inactif'}
                      </span>
                    </label>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Configuration de base */}
                <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-5 mb-3 border-2 border-stone-300">
                  <h4 className="font-bold text-lg text-stone-900 mb-4">⚙️ Configuration</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">👥 Passagers max</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={vehicle.maxPassengers || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleUpdateVehicle(vehicle.id, 'maxPassengers', value === '' ? 0 : parseInt(value));
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="4"
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                    />
                  </div>
                </div>

                {/* SECTION BAGAGES - CLAIRE ET EXPLICITE */}
                <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-5 mb-3 border-2 border-stone-300">
                  <h4 className="font-bold text-lg text-stone-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">🧳</span>
                    Bagages
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    
                    {/* Bagages gratuits */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ✅ Gratuits
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={luggage.included || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          handleUpdateLuggage(vehicle.id, 'included', value === '' ? 0 : parseInt(value));
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="2"
                        className="w-full px-3 py-2 border-2 border-stone-300 rounded-xl text-base font-bold text-center focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                      />
                      <p className="text-xs text-gray-600 mt-1 text-center">
                        Inclus
                      </p>
                    </div>

                    {/* Bagages max */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📦 Max total
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={luggage.max || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          handleUpdateLuggage(vehicle.id, 'max', value === '' ? 0 : parseInt(value));
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="4"
                        className="w-full px-3 py-2 border-2 border-stone-300 rounded-xl text-base font-bold text-center focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                      />
                      <p className="text-xs text-gray-600 mt-1 text-center">
                        Capacité
                      </p>
                    </div>

                    {/* Prix bagage supplémentaire */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        💰 Prix/bagage
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={luggage.pricePerExtra || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            handleUpdateLuggage(vehicle.id, 'pricePerExtra', value === '' ? 0 : parseFloat(value));
                          }}
                          onFocus={(e) => e.target.select()}
                          placeholder="5"
                          className="w-full px-3 py-2 pr-8 border-2 border-stone-300 rounded-xl text-base font-bold text-center focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">€</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">
                        Supplément
                      </p>
                    </div>
                  </div>

                  {/* Récapitulatif visuel */}
                  <div className="mt-4 p-3 bg-white border border-stone-200 rounded-lg">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-lg mb-0.5">✅</div>
                        <div className="font-bold text-stone-700 text-sm">
                          {luggage.included}
                        </div>
                        <div className="text-xs text-gray-600">GRATUIT</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg mb-0.5">💰</div>
                        <div className="font-bold text-stone-700 text-sm">
                          {paidLuggage}
                        </div>
                        <div className="text-xs text-gray-600">
                          {luggage.pricePerExtra}€
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg mb-0.5">📦</div>
                        <div className="font-bold text-stone-700 text-sm">
                          {luggage.max}
                        </div>
                        <div className="text-xs text-gray-600">MAX</div>
                      </div>
                    </div>

                    {/* Exemple de calcul */}
                    <div className="mt-2 pt-2 border-t border-stone-200">
                      <p className="text-xs text-center text-gray-700">
                        <strong>Ex:</strong> {luggage.max} bagages = <strong className="text-stone-700">{(paidLuggage * luggage.pricePerExtra).toFixed(2)}€</strong> supp.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tarification */}
                <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-5 mb-3 border-2 border-stone-300">
                  <h4 className="font-bold text-lg text-stone-900 mb-4">💵 Tarification</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Forfait min (€)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={pricing.minPrice || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          handleUpdatePricing(vehicle.id, 'minPrice', value === '' ? 0 : parseFloat(value));
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="15"
                        className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Seuil km</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={pricing.kmThreshold || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          handleUpdatePricing(vehicle.id, 'kmThreshold', value === '' ? 0 : parseInt(value));
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="5"
                        className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Prix/km (€)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={pricing.perKm || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          handleUpdatePricing(vehicle.id, 'perKm', value === '' ? 0 : parseFloat(value));
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="1.8"
                        className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bouton sauvegarder fixe */}
        {vehicles.length > 0 && (
          <div className="sticky bottom-4 bg-white border border-stone-300 rounded-xl p-2.5 shadow-lg">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-5 py-2.5 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-lg hover:shadow-lg font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </span>
              ) : (
                '💾 Sauvegarder'
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}