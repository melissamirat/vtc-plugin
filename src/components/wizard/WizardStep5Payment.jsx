import React, { useState } from 'react';

export default function WizardStep5Payment({ wizardData, onNext, onBack, saving }) {
  const [payment, setPayment] = useState(wizardData.payment || {
    methods: ['cash'],
  });

  const paymentOptions = [
    {
      id: 'cash',
      label: 'Espèces',
      icon: '💵',
      description: 'Paiement en liquide à bord',
    },
    {
      id: 'card',
      label: 'Carte bancaire',
      icon: '💳',
      description: 'Paiement par CB à bord',
    },
    {
      id: 'online',
      label: 'En ligne',
      icon: '🌐',
      description: 'Paiement en ligne (Stripe)',
      comingSoon: true,
    },
    {
      id: 'transfer',
      label: 'Virement',
      icon: '🏦',
      description: 'Virement bancaire',
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
    onNext({ payment });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl mb-4">
          <span className="text-4xl">💳</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Dernière étape !
        </h2>
        <p className="text-gray-600">
          Comment vos clients peuvent-ils vous payer ?
        </p>
      </div>

      {/* Méthodes de paiement */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Méthodes de paiement acceptées
        </h3>
        <p className="text-sm text-gray-600 mb-6">
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
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.comingSoon && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    Bientôt
                  </span>
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    isSelected ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{option.label}</span>
                      {isSelected && (
                        <span className="text-green-600 text-lg">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Récapitulatif */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-700">
            <strong>Méthodes sélectionnées :</strong>{' '}
            {payment.methods?.length > 0
              ? payment.methods.map(m => paymentOptions.find(o => o.id === m)?.label).join(', ')
              : 'Aucune'
            }
          </p>
        </div>
      </div>

      {/* Récapitulatif final */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-200">
        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🎉</span>
          Prêt à démarrer !
        </h3>

        <div className="space-y-2 text-sm text-green-800 mb-6">
          <p>✅ Votre véhicule est configuré</p>
          <p>✅ Votre zone de service est définie</p>
          {wizardData.package && <p>✅ Votre premier forfait est créé</p>}
          <p>✅ Vos méthodes de paiement sont sélectionnées</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-green-200">
          <p className="text-gray-700 text-sm">
            <strong>🚀 Que se passe-t-il ensuite ?</strong>
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>• Vous accédez à votre tableau de bord</li>
            <li>• Vous pouvez partager votre lien de réservation</li>
            <li>• Vos clients peuvent réserver directement</li>
            <li>• Vous recevez les demandes par email et dans l'app</li>
          </ul>
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
          onClick={handleFinalize}
          disabled={saving || !payment.methods?.length}
          className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
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
        </button>
      </div>
    </div>
  );
}