import React from 'react';

export default function WizardStep0Welcome({ onNext }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Illustration */}
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
          <span className="text-6xl">🚗</span>
        </div>
      </div>

      {/* Titre */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Bienvenue dans votre espace VTC !
      </h1>

      {/* Sous-titre */}
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        Configurons ensemble votre activité en quelques étapes simples.
        <br />
        <span className="text-indigo-600 font-medium">
          Vous pourrez tout modifier depuis votre tableau de bord à tout moment.
        </span>
      </p>

      {/* Ce qu'on va configurer */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 text-left">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">
          Ce que nous allons configurer :
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🚗</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Votre véhicule</h4>
              <p className="text-sm text-gray-600">Capacité, bagages et tarification de base</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-purple-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🗺️</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Votre zone de service</h4>
              <p className="text-sm text-gray-600">Définissez où vous intervenez</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-green-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎫</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Vos forfaits (optionnel)</h4>
              <p className="text-sm text-gray-600">Prix fixes pour des trajets récurrents</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-amber-50 rounded-xl">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💳</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Moyens de paiement</h4>
              <p className="text-sm text-gray-600">Comment vos clients peuvent payer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Temps estimé */}
      <div className="flex items-center justify-center gap-2 text-gray-500 mb-8">
        <span className="text-xl">⏱️</span>
        <span className="text-sm">Environ 5 minutes</span>
      </div>

      {/* Bouton principal */}
      <button
        onClick={() => onNext({})}
        className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        C'est parti ! 🚀
      </button>
    </div>
  );
}