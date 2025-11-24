import React from 'react';

export default function WizardStep4Education({ wizardData, onNext, onBack, saving }) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête avec illustration */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl mb-4">
          <span className="text-5xl">🎉</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Configuration de base terminée !
        </h2>
        <p className="text-gray-600">
          Vous avez configuré l'essentiel. Voici ce qui vous attend.
        </p>
      </div>

      {/* Récapitulatif de ce qui a été configuré */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">✅</span>
          Ce que vous avez configuré
        </h3>

        <div className="space-y-3">
          {/* Véhicule */}
          {wizardData.vehicle && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-2xl">{wizardData.vehicle.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{wizardData.vehicle.name}</p>
                <p className="text-sm text-gray-600">
                  {wizardData.vehicle.maxPassengers} passagers • {wizardData.vehicle.luggage?.max || 4} bagages max
                </p>
              </div>
              <span className="ml-auto text-green-600 text-xl">✓</span>
            </div>
          )}

          {/* Zone */}
          {wizardData.zone && wizardData.zone.geography?.center && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-2xl">🗺️</span>
              <div>
                <p className="font-semibold text-gray-900">Zone principale</p>
                <p className="text-sm text-gray-600">
                  {wizardData.zone.geography.center.address}
                  {wizardData.zone.geography.type === 'radius' && ` (${wizardData.zone.geography.radius} km)`}
                </p>
              </div>
              <span className="ml-auto text-green-600 text-xl">✓</span>
            </div>
          )}

          {/* Forfait */}
          {wizardData.package && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <span className="text-2xl">🎫</span>
              <div>
                <p className="font-semibold text-gray-900">{wizardData.package.name}</p>
                <p className="text-sm text-gray-600">
                  Prix fixe : {wizardData.package.price}€
                </p>
              </div>
              <span className="ml-auto text-green-600 text-xl">✓</span>
            </div>
          )}

          {!wizardData.package && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-2xl">🎫</span>
              <div>
                <p className="font-semibold text-gray-500">Forfait</p>
                <p className="text-sm text-gray-400">Non configuré (vous pourrez en créer plus tard)</p>
              </div>
              <span className="ml-auto text-gray-400 text-xl">○</span>
            </div>
          )}
        </div>
      </div>

      {/* Fonctionnalités avancées - Teasing */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-6 mb-6 border-2 border-indigo-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">💡</span>
          Bon à savoir
        </h3>

        <div className="mb-6">
          {/* Illustration de carte avec zones */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="relative h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg overflow-hidden">
              {/* Zone principale */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-400/30 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-800">Zone<br/>principale</span>
              </div>
              {/* Zone spécifique 1 */}
              <div className="absolute left-4 top-4 w-12 h-12 bg-green-400/40 rounded-full border-2 border-green-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-green-800">Aéro</span>
              </div>
              {/* Zone spécifique 2 */}
              <div className="absolute right-4 bottom-4 w-14 h-14 bg-orange-400/40 rounded-full border-2 border-orange-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-orange-800">Station</span>
              </div>
              {/* Zone spécifique 3 */}
              <div className="absolute right-8 top-6 w-10 h-10 bg-purple-400/40 rounded-full border-2 border-purple-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-purple-800">Gare</span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">
            Depuis votre <strong>tableau de bord</strong>, vous pourrez :
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🗺️</span>
            </span>
            <div>
              <p className="font-semibold text-gray-900">Ajouter des zones spécifiques</p>
              <p className="text-sm text-gray-600">
                Créez des zones avec des tarifs différents (aéroports, stations de ski, zones touristiques...)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🚗</span>
            </span>
            <div>
              <p className="font-semibold text-gray-900">Ajouter d'autres véhicules</p>
              <p className="text-sm text-gray-600">
                Van 7 places, véhicule de luxe, chaque véhicule avec ses propres tarifs
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
            <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🎫</span>
            </span>
            <div>
              <p className="font-semibold text-gray-900">Créer plus de forfaits</p>
              <p className="text-sm text-gray-600">
                Transferts aéroport, excursions, navettes régulières avec prix fixes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
            <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🎁</span>
            </span>
            <div>
              <p className="font-semibold text-gray-900">Codes promo</p>
              <p className="text-sm text-gray-600">
                Créez des réductions pour fidéliser vos clients
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          ← Retour
        </button>

        <button
          type="button"
          onClick={() => onNext({})}
          disabled={saving}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Compris, continuer →'}
        </button>
      </div>
    </div>
  );
}