import React, { useState } from 'react';

export default function WizardStep5Payment({ wizardData, onNext, onBack, saving }) {
  // Structure alignée avec SetupWizard.jsx - config.paymentModes
  const [payment, setPayment] = useState(wizardData.payment || {
    methods: ['cash'], // Liste des méthodes activées
  });

  const paymentOptions = [
    {
      id: 'cash',
      label: 'Espèces',
      icon: '💵',
      description: 'Paiement en liquide à bord',
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      border: 'border-emerald-300',
    },
    {
      id: 'card',
      label: 'Carte bancaire',
      icon: '💳',
      description: 'Paiement par CB à bord',
      gradient: 'from-stone-600 to-stone-700',
      bgGradient: 'from-stone-50 to-amber-50',
      border: 'border-stone-300',
    },
    {
      id: 'online',
      label: 'En ligne',
      icon: '🌐',
      description: 'Paiement en ligne (Stripe)',
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      border: 'border-amber-300',
      comingSoon: true,
    },
    {
      id: 'transfer',
      label: 'Virement',
      icon: '🏦',
      description: 'Virement bancaire',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      border: 'border-blue-300',
    },
  ];

  const togglePaymentMethod = (methodId) => {
    const current = payment.methods || [];
    const newMethods = current.includes(methodId)
      ? current.filter(m => m !== methodId)
      : [...current, methodId];
    
    // Au moins une méthode doit être sélectionnée
    if (newMethods.length > 0) {
      setPayment({ ...payment, methods: newMethods });
    }
  };

  const handleFinalize = () => {
    if (!payment.methods?.length) {
      alert('Veuillez sélectionner au moins une méthode de paiement');
      return;
    }
    
    // Structure finale qui sera utilisée dans SetupWizard pour créer config.paymentModes
    onNext({ payment });
  };

  const selectedCount = payment.methods?.length || 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <span className="text-4xl">💳</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          Dernière étape !
        </h2>
        <p className="text-stone-600">
          Comment vos clients peuvent-ils vous payer ?
        </p>
      </div>

      {/* Méthodes de paiement */}
      <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/10 p-6 mb-6 border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-stone-900">
            Méthodes de paiement
          </h3>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-sm text-stone-600 mb-6">
          Sélectionnez au moins une méthode de paiement
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentOptions.map((option) => {
            const isSelected = payment.methods?.includes(option.id);
            const isDisabled = option.comingSoon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => !isDisabled && togglePaymentMethod(option.id)}
                disabled={isDisabled}
                className={`group relative p-4 rounded-xl border-2 transition-all text-left overflow-hidden ${
                  isDisabled
                    ? 'border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? `border-emerald-500 bg-gradient-to-r ${option.bgGradient} shadow-lg scale-[1.02]`
                    : `border-stone-200 hover:border-stone-300 hover:shadow-md`
                }`}
              >
                {option.comingSoon && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow-md">
                    Bientôt
                  </span>
                )}
                
                {isSelected && !isDisabled && (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
                )}
                
                <div className="relative flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md ${
                    isSelected && !isDisabled
                      ? `bg-gradient-to-br ${option.gradient}`
                      : 'bg-stone-100'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-stone-900">{option.label}</span>
                      {isSelected && !isDisabled && (
                        <span className="text-emerald-600 text-xl">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info sur la structure */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-900 font-semibold mb-2">
            💡 Configuration des paiements
          </p>
          <p className="text-sm text-blue-800">
            Ces méthodes seront ajoutées à votre configuration. 
            Le paiement à bord (espèces/carte) sera activé par défaut, 
            et le paiement en ligne pourra être configuré ultérieurement.
          </p>
        </div>
      </div>

      {/* Récapitulatif final */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 mb-6 border-2 border-emerald-200">
        <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🎉</span>
          Prêt à démarrer !
        </h3>

        <div className="space-y-2 text-sm text-emerald-800 mb-6">
          <p className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            Votre véhicule est configuré
          </p>
          <p className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            Votre zone de service est définie
          </p>
          {wizardData.package && (
            <p className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span>
              Votre premier forfait est créé
            </p>
          )}
          <p className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            Vos méthodes de paiement sont sélectionnées
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200">
          <p className="text-stone-900 text-sm font-semibold mb-2">
            🚀 Que se passe-t-il ensuite ?
          </p>
          <ul className="text-sm text-stone-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 flex-shrink-0">•</span>
              <span>Accédez à votre tableau de bord complet</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 flex-shrink-0">•</span>
              <span>Partagez votre lien de réservation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 flex-shrink-0">•</span>
              <span>Recevez les réservations par email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 flex-shrink-0">•</span>
              <span>Gérez vos courses en temps réel</span>
            </li>
          </ul>
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
          onClick={handleFinalize}
          disabled={saving || !payment.methods?.length}
          className="group relative px-10 py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative flex items-center gap-2">
            {saving ? (
              <>
                <span className="animate-spin">⏳</span>
                Finalisation...
              </>
            ) : (
              <>
                🚀 Terminer et accéder au Dashboard
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}