import React from 'react';

export default function WizardStep4Education({ wizardData, onNext, onBack, saving }) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête avec illustration */}
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <span className="text-5xl">✅</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          Configuration essentielle terminée !
        </h2>
        <p className="text-stone-600">
          Récapitulatif de votre configuration
        </p>
      </div>

      {/* Récapitulatif compact */}
      <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/10 p-6 mb-6 border border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Votre configuration
        </h3>

        <div className="space-y-3">
          {/* Véhicule */}
          {wizardData.vehicle && (
            <div className="group flex items-center gap-3 p-4 bg-gradient-to-r from-stone-50 to-amber-50 rounded-xl border border-stone-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-stone-600 to-stone-700 rounded-xl flex items-center justify-center text-2xl shadow-md">
                {wizardData.vehicle.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900">{wizardData.vehicle.name}</p>
                <p className="text-sm text-stone-600">
                  {wizardData.vehicle.maxPassengers} passagers • {wizardData.vehicle.luggage?.max || 4} bagages max
                </p>
              </div>
              <span className="text-emerald-600 text-2xl">✓</span>
            </div>
          )}

          {/* Zone */}
          {wizardData.zone && wizardData.zone.geography?.center && (
            <div className="group flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-stone-50 rounded-xl border border-amber-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center text-2xl shadow-md">
                🗺️
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900">Zone de service</p>
                <p className="text-sm text-stone-600">
                  {wizardData.zone.geography.center.address}
                  {wizardData.zone.geography.type === 'radius' && ` (${wizardData.zone.geography.radius} km)`}
                </p>
              </div>
              <span className="text-emerald-600 text-2xl">✓</span>
            </div>
          )}

          {/* Forfait */}
          {wizardData.package ? (
            <div className="group flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
                🎫
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900">{wizardData.package.name}</p>
                <p className="text-sm text-stone-600">
                  Prix fixe : {wizardData.package.price}€
                </p>
              </div>
              <span className="text-emerald-600 text-2xl">✓</span>
            </div>
          ) : (
            <div className="group flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="w-12 h-12 bg-stone-300 rounded-xl flex items-center justify-center text-2xl">
                🎫
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-500">Forfait</p>
                <p className="text-sm text-stone-400">Vous pourrez en créer depuis le dashboard</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info dashboard */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 mb-6 border-2 border-amber-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-stone-900 mb-1">Votre tableau de bord</h3>
            <p className="text-sm text-stone-700">
              Vous pourrez <strong>tout modifier et ajouter</strong> depuis le dashboard :
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <span className="text-emerald-600">•</span>
            <span>Ajouter des véhicules</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <span className="text-emerald-600">•</span>
            <span>Créer plus de zones</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <span className="text-emerald-600">•</span>
            <span>Créer plus de forfaits</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <span className="text-emerald-600">•</span>
            <span>Gérer les majorations</span>
          </div>
        </div>
      </div>

      {/* Boutons */}
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
          onClick={() => onNext({})}
          disabled={saving}
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