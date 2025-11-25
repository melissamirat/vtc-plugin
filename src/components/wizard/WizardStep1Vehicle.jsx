import React, { useState } from 'react';

export default function WizardStep1Vehicle({ wizardData, onNext, onBack, saving }) {
  // Structure compatible avec config.vehicleCategories et vehiclePricing dans page.js
  const [vehicle, setVehicle] = useState(wizardData.vehicle || {
    id: `vehicle-${Date.now()}`,
    name: '',
    icon: '🚗',
    maxPassengers: 4,
    luggage: {
      included: 2,
      max: 4,
      pricePerExtra: 5,
    },
    pricing: {
      minPrice: 15,      // Utilisé comme basePrice et minPrice dans vehiclePricing
      kmThreshold: 5,    // Seuil en km avant application du prix/km
      perKm: 1.8,        // Prix par kilomètre (pricePerKm dans vehiclePricing)
    },
    enabled: true,
  });

  const [errors, setErrors] = useState({});

  // Calcul dynamique du supplément bagages
  const paidLuggage = Math.max(0, vehicle.luggage.max - vehicle.luggage.included);
  const exampleLuggagePrice = paidLuggage * vehicle.luggage.pricePerExtra;

  const handleUpdate = (field, value) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleLuggageUpdate = (field, value) => {
    const numValue = parseInt(value) || 0;
    setVehicle(prev => ({
      ...prev,
      luggage: { ...prev.luggage, [field]: numValue }
    }));
  };

  const handlePricingUpdate = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setVehicle(prev => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: numValue }
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!vehicle.name.trim()) {
      newErrors.name = 'Le nom du véhicule est obligatoire';
    }
    if (vehicle.maxPassengers < 1) {
      newErrors.maxPassengers = 'Minimum 1 passager';
    }
    if (vehicle.luggage.max < vehicle.luggage.included) {
      newErrors.luggage = 'La capacité max doit être ≥ aux bagages inclus';
    }
    if (vehicle.pricing.minPrice < 0) {
      newErrors.minPrice = 'Le prix minimum ne peut pas être négatif';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext({ vehicle });
    }
  };

  // Icônes de véhicules suggérées
  const vehicleIcons = ['🚗', '🚐', '🚙', '🏎️', '🚕', '🚖'];

  const canContinue = vehicle.name.trim() && vehicle.maxPassengers >= 1 && 
                     vehicle.luggage.max >= vehicle.luggage.included && 
                     vehicle.pricing.minPrice >= 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête modernisé */}
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-stone-600 to-stone-700 rounded-full flex items-center justify-center shadow-xl shadow-stone-900/20">
            <span className="text-4xl">🚗</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          Configurez votre véhicule
        </h2>
        <p className="text-stone-600">
          Définissez les caractéristiques et les tarifs de base
        </p>
      </div>

      {/* PARTIE A : Identité & Capacité */}
      <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/10 p-6 mb-6 border border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-stone-600 to-stone-700 rounded-full flex items-center justify-center text-sm text-white shadow-md">A</span>
          Identité & Capacité
        </h3>

        {/* Nom et Icône */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-2">
            <label className="flex items-center gap-1 text-sm font-semibold text-stone-700 mb-2">
              Nom du véhicule 
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vehicle.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              placeholder="Ex: Berline Confort, Van Famille..."
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-stone-200'
              }`}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">⚠️ {errors.name}</p>}
          </div>
          
          
        </div>

        {/* Passagers */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            👥 Nombre de passagers maximum
          </label>
          <div className="flex items-center gap-4 justify-center">
            <button
              type="button"
              onClick={() => handleUpdate('maxPassengers', Math.max(1, vehicle.maxPassengers - 1))}
              className="w-12 h-12 bg-stone-100 hover:bg-stone-200 rounded-xl text-2xl font-bold transition-all hover:scale-110 shadow-sm"
            >
              −
            </button>
            <div className="w-24 text-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-stone-700 to-amber-600 bg-clip-text text-transparent">{vehicle.maxPassengers}</span>
            </div>
            <button
              type="button"
              onClick={() => handleUpdate('maxPassengers', Math.min(9, vehicle.maxPassengers + 1))}
              className="w-12 h-12 bg-stone-100 hover:bg-stone-200 rounded-xl text-2xl font-bold transition-all hover:scale-110 shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Bagages */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 shadow-sm">
          <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🧳</span>
            Gestion des Bagages
          </h4>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Inclus */}
            <div className="text-center">
              <label className="block text-xs font-bold text-stone-700 mb-2">
                ✅ INCLUS
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLuggageUpdate('included', Math.max(0, vehicle.luggage.included - 1))}
                  className="w-8 h-8 bg-emerald-100 rounded-lg text-lg font-bold hover:bg-emerald-200 transition-all hover:scale-110"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-emerald-600 w-10 text-center">
                  {vehicle.luggage.included}
                </span>
                <button
                  type="button"
                  onClick={() => handleLuggageUpdate('included', Math.min(vehicle.luggage.max, vehicle.luggage.included + 1))}
                  className="w-8 h-8 bg-emerald-100 rounded-lg text-lg font-bold hover:bg-emerald-200 transition-all hover:scale-110"
                >
                  +
                </button>
              </div>
            </div>

            {/* Prix supplément */}
            <div className="text-center">
              <label className="block text-xs font-bold text-stone-700 mb-2">
                💰 Prix / bagage supp.
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={vehicle.luggage.pricePerExtra}
                  onChange={(e) => handleLuggageUpdate('pricePerExtra', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg text-center text-xl font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">€</span>
              </div>
            </div>

            {/* Max */}
            <div className="text-center">
              <label className="block text-xs font-bold text-stone-700 mb-2">
                📦 CAPACITÉ MAX
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLuggageUpdate('max', Math.max(vehicle.luggage.included, vehicle.luggage.max - 1))}
                  className="w-8 h-8 bg-orange-100 rounded-lg text-lg font-bold hover:bg-orange-200 transition-all hover:scale-110"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-orange-600 w-10 text-center">
                  {vehicle.luggage.max}
                </span>
                <button
                  type="button"
                  onClick={() => handleLuggageUpdate('max', vehicle.luggage.max + 1)}
                  className="w-8 h-8 bg-orange-100 rounded-lg text-lg font-bold hover:bg-orange-200 transition-all hover:scale-110"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Feedback visuel */}
          <div className="bg-white rounded-lg p-3 border border-amber-200 shadow-sm">
            <p className="text-sm text-stone-700 text-center">
              <strong>💡 Exemple :</strong> Si un client a <strong>{vehicle.luggage.max}</strong> bagages,
              il paiera <strong className="text-amber-700">{exampleLuggagePrice.toFixed(2)}€</strong> de supplément
              <span className="text-stone-500 text-xs block mt-1">
                ({vehicle.luggage.included} inclus, {paidLuggage} payants × {vehicle.luggage.pricePerExtra}€)
              </span>
            </p>
          </div>
          
          {errors.luggage && <p className="text-sm text-red-600 mt-2 text-center flex items-center justify-center gap-1">⚠️ {errors.luggage}</p>}
        </div>
      </div>

      {/* PARTIE B : Tarification */}
      <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/10 p-6 mb-6 border border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-2 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-sm text-white shadow-md">B</span>
          Tarification par défaut
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Ce tarif sera appliqué par défaut, sauf si vous définissez des prix spécifiques par zone.
        </p>

        <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-xl p-4 border-2 border-stone-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Forfait minimum */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                🎯 Forfait Minimum
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={vehicle.pricing.minPrice}
                  onChange={(e) => handlePricingUpdate('minPrice', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-stone-200 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">€</span>
              </div>
              <p className="text-xs text-stone-500 mt-1 text-center">Prix min. par course</p>
            </div>

            {/* Seuil km */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                📏 Seuil Kilométrique
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={vehicle.pricing.kmThreshold}
                  onChange={(e) => handlePricingUpdate('kmThreshold', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-stone-200 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">km</span>
              </div>
              <p className="text-xs text-stone-500 mt-1 text-center">En dessous = forfait min</p>
            </div>

            {/* Prix au km */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                💵 Prix au Kilomètre
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={vehicle.pricing.perKm}
                  onChange={(e) => handlePricingUpdate('perKm', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-stone-200 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">€/km</span>
              </div>
              <p className="text-xs text-stone-500 mt-1 text-center">Au-delà du seuil</p>
            </div>
          </div>

          {/* Exemple de calcul */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-stone-200 shadow-sm space-y-2">
            <p className="text-xs font-semibold text-stone-600 mb-2">💡 Exemples de calcul :</p>
            
            {/* Exemple 1 : En dessous du seuil */}
            <div className="text-sm text-stone-700">
              <span className="font-semibold">Course de 3 km :</span> {' '}
              <strong className="text-emerald-600">
                {3 <= vehicle.pricing.kmThreshold
                  ? vehicle.pricing.minPrice.toFixed(2)
                  : (3 * vehicle.pricing.perKm).toFixed(2)
                }€
              </strong>
              <span className="text-xs text-stone-500 block ml-4">
                {3 <= vehicle.pricing.kmThreshold 
                  ? `→ Forfait minimum (≤ ${vehicle.pricing.kmThreshold} km)`
                  : `→ ${3} km × ${vehicle.pricing.perKm}€/km`
                }
              </span>
            </div>

            {/* Exemple 2 : Au-dessus du seuil */}
            <div className="text-sm text-stone-700">
              <span className="font-semibold">Course de 20 km :</span> {' '}
              <strong className="text-amber-700">
                {20 <= vehicle.pricing.kmThreshold
                  ? vehicle.pricing.minPrice.toFixed(2)
                  : (20 * vehicle.pricing.perKm).toFixed(2)
                }€
              </strong>
              <span className="text-xs text-stone-500 block ml-4">
                {20 <= vehicle.pricing.kmThreshold 
                  ? `→ Forfait minimum (≤ ${vehicle.pricing.kmThreshold} km)`
                  : `→ ${20} km × ${vehicle.pricing.perKm}€/km`
                }
              </span>
            </div>
          
        
</div>
        </div>

        
      </div>

      {/* Boutons de navigation */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-all border border-stone-200"
        >
          ← Retour
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !canContinue}
          className="group relative px-8 py-4 bg-gradient-to-r from-stone-700 via-amber-600 to-stone-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative">
            {saving ? 'Sauvegarde...' : 'Continuer →'}
          </span>
        </button>
      </div>
    </div>
  );
}