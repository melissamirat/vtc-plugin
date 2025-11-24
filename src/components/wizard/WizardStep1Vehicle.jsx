import React, { useState, useEffect } from 'react';

export default function WizardStep1Vehicle({ wizardData, onNext, onBack, onSkip, saving }) {
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
      minPrice: 15,
      kmThreshold: 5,
      perKm: 1.8,
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl mb-4">
          <span className="text-4xl">🚗</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Configurez votre véhicule
        </h2>
        <p className="text-gray-600">
          Définissez les caractéristiques et les tarifs de base
        </p>
      </div>

      {/* PARTIE A : Identité & Capacité */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">A</span>
          Identité & Capacité
        </h3>

        {/* Nom et Icône */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du véhicule *
            </label>
            <input
              type="text"
              value={vehicle.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              placeholder="Ex: Berline Confort, Van Famille..."
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Icône
            </label>
            <div className="flex flex-wrap gap-2">
              {vehicleIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleUpdate('icon', icon)}
                  className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${
                    vehicle.icon === icon
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Passagers */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            👥 Nombre de passagers maximum
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleUpdate('maxPassengers', Math.max(1, vehicle.maxPassengers - 1))}
              className="w-12 h-12 bg-gray-100 rounded-xl text-2xl font-bold hover:bg-gray-200 transition-colors"
            >
              −
            </button>
            <div className="w-20 text-center">
              <span className="text-4xl font-bold text-indigo-600">{vehicle.maxPassengers}</span>
            </div>
            <button
              type="button"
              onClick={() => handleUpdate('maxPassengers', Math.min(9, vehicle.maxPassengers + 1))}
              className="w-12 h-12 bg-gray-100 rounded-xl text-2xl font-bold hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Bagages */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
          <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🧳</span>
            Gestion des Bagages
          </h4>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Inclus */}
            <div className="text-center">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                ✅ INCLUS (Gratuit)
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLuggageUpdate('included', Math.max(0, vehicle.luggage.included - 1))}
                  className="w-8 h-8 bg-green-100 rounded-lg text-lg font-bold hover:bg-green-200"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-green-600 w-10 text-center">
                  {vehicle.luggage.included}
                </span>
                <button
                  type="button"
                  onClick={() => handleLuggageUpdate('included', Math.min(vehicle.luggage.max, vehicle.luggage.included + 1))}
                  className="w-8 h-8 bg-green-100 rounded-lg text-lg font-bold hover:bg-green-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Prix supplément */}
            <div className="text-center">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                💰 Prix / bagage supp.
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={vehicle.luggage.pricePerExtra}
                  onChange={(e) => handleLuggageUpdate('pricePerExtra', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-center text-xl font-bold bg-blue-50 focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
              </div>
            </div>

            {/* Max */}
            <div className="text-center">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                📦 CAPACITÉ MAX
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLuggageUpdate('max', Math.max(vehicle.luggage.included, vehicle.luggage.max - 1))}
                  className="w-8 h-8 bg-orange-100 rounded-lg text-lg font-bold hover:bg-orange-200"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-orange-600 w-10 text-center">
                  {vehicle.luggage.max}
                </span>
                <button
                  type="button"
                  onClick={() => handleLuggageUpdate('max', vehicle.luggage.max + 1)}
                  className="w-8 h-8 bg-orange-100 rounded-lg text-lg font-bold hover:bg-orange-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Feedback visuel */}
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <p className="text-sm text-gray-700 text-center">
              <strong>💡 Exemple :</strong> Si un client a <strong>{vehicle.luggage.max}</strong> bagages,
              il paiera <strong className="text-orange-600">{exampleLuggagePrice.toFixed(2)}€</strong> de supplément
              <span className="text-gray-500 text-xs block mt-1">
                ({vehicle.luggage.included} inclus, {paidLuggage} payants × {vehicle.luggage.pricePerExtra}€)
              </span>
            </p>
          </div>
          
          {errors.luggage && <p className="text-sm text-red-600 mt-2 text-center">{errors.luggage}</p>}
        </div>
      </div>

      {/* PARTIE B : Tarification */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm">B</span>
          Tarification par défaut
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ce tarif sera appliqué par défaut, sauf si vous définissez des prix spécifiques par zone.
        </p>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Forfait minimum */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                🎯 Forfait Minimum
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={vehicle.pricing.minPrice}
                  onChange={(e) => handlePricingUpdate('minPrice', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-purple-200 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">Prix min. par course</p>
            </div>

            {/* Seuil km */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                📏 Seuil Kilométrique
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={vehicle.pricing.kmThreshold}
                  onChange={(e) => handlePricingUpdate('kmThreshold', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-purple-200 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">km</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">En dessous = forfait min</p>
            </div>

            {/* Prix au km */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                💵 Prix au Kilomètre
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={vehicle.pricing.perKm}
                  onChange={(e) => handlePricingUpdate('perKm', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-purple-200 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€/km</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">Au-delà du seuil</p>
            </div>
          </div>

          {/* Exemple de calcul */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-sm text-center text-gray-700">
              <strong>💡 Exemple :</strong> Course de 15 km = {' '}
              <strong className="text-purple-600">
                {vehicle.pricing.kmThreshold > 0 && 15 <= vehicle.pricing.kmThreshold
                  ? vehicle.pricing.minPrice.toFixed(2)
                  : (vehicle.pricing.minPrice + ((15 - vehicle.pricing.kmThreshold) * vehicle.pricing.perKm)).toFixed(2)
                }€
              </strong>
              <span className="text-xs text-gray-500 block mt-1">
                {15 <= vehicle.pricing.kmThreshold 
                  ? `(Forfait minimum car ≤ ${vehicle.pricing.kmThreshold} km)`
                  : `(${vehicle.pricing.minPrice}€ + ${15 - vehicle.pricing.kmThreshold} km × ${vehicle.pricing.perKm}€)`
                }
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Passer cette étape
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  );
}