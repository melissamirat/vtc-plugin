import React from 'react';

export default function WizardStep0Welcome({ onNext }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Illustration */}
      <div className="mb-8 relative">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-stone-700 via-amber-600 to-stone-600 rounded-full flex items-center justify-center shadow-2xl shadow-stone-900/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <span className="text-6xl relative z-10">🚗</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Titre */}
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-stone-900 to-stone-700 bg-clip-text text-transparent mb-4">
        Bienvenue dans votre espace VTC !
      </h1>

      {/* Sous-titre */}
      <p className="text-lg text-stone-600 mb-8 leading-relaxed">
        Configurons ensemble votre activité en quelques étapes simples.
        <br />
        <span className="text-amber-700 font-semibold">
          Vous pourrez tout modifier depuis votre tableau de bord à tout moment.
        </span>
      </p>

      {/* Ce qu'on va configurer */}
      <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/10 p-6 mb-8 text-left border border-stone-200">
        <h3 className="font-bold text-stone-900 mb-4 text-lg">
          Ce que nous allons configurer :
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-3 bg-gradient-to-r from-stone-50 to-amber-50 rounded-xl border border-stone-200 transition-all hover:shadow-md hover:scale-[1.02]">
            <div className="w-10 h-10 bg-gradient-to-br from-stone-600 to-stone-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-xl">🚗</span>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">Votre véhicule</h4>
              <p className="text-sm text-stone-600">Capacité, bagages et tarification de base</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-gradient-to-r from-amber-50 to-stone-50 rounded-xl border border-amber-200 transition-all hover:shadow-md hover:scale-[1.02]">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-xl">🗺️</span>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">Votre zone de service</h4>
              <p className="text-sm text-stone-600">Définissez où vous intervenez</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 transition-all hover:shadow-md hover:scale-[1.02]">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-xl">🎫</span>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">Vos forfaits</h4>
              <p className="text-sm text-stone-600">Prix fixes pour des trajets récurrents</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 transition-all hover:shadow-md hover:scale-[1.02]">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-xl">💳</span>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">Moyens de paiement</h4>
              <p className="text-sm text-stone-600">Comment vos clients peuvent payer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Temps estimé */}
      <div className="flex items-center justify-center gap-2 text-stone-500 mb-8">
        <span className="text-xl">⏱️</span>
        <span className="text-sm font-medium">Environ 5 minutes</span>
      </div>

      {/* Bouton principal */}
      <button
        onClick={() => onNext({})}
        className="group relative w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-stone-700 via-amber-600 to-stone-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-stone-900/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <span className="relative">C'est parti ! 🚀</span>
      </button>
    </div>
  );
}