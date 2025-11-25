// Composant à ajouter dans ReservationForm.js

function PaymentMethodSelector({ 
  paymentConfig, 
  selectedMethod, 
  onChange,
  totalPrice,
  BRANDING 
}) {
  if (!paymentConfig) return null;

  const availableMethods = [];

  // Stripe
  if (paymentConfig.stripe?.enabled && paymentConfig.stripe?.connected) {
    availableMethods.push({
      id: 'stripe',
      label: paymentConfig.stripe.label || 'Paiement en ligne sécurisé',
      icon: '💎',
      color: 'purple',
      details: paymentConfig.stripe.requiresDeposit 
        ? `Acompte de ${paymentConfig.stripe.depositPercent}% requis (${(totalPrice * paymentConfig.stripe.depositPercent / 100).toFixed(2)}€)`
        : 'Paiement intégral en ligne'
    });
  }

  // PayPal
  if (paymentConfig.paypal?.enabled && paymentConfig.paypal?.email) {
    availableMethods.push({
      id: 'paypal',
      label: paymentConfig.paypal.label || 'Paiement PayPal',
      icon: '🅿️',
      color: 'blue',
      details: 'Vous recevrez un lien de paiement PayPal'
    });
  }

  // Paiement à bord
  if (paymentConfig.onBoard?.enabled) {
    const enabledMethods = Object.entries(paymentConfig.onBoard.methods || {})
      .filter(([_, method]) => method.enabled)
      .map(([key, method]) => {
        if (key === 'card') return '💳 CB';
        if (key === 'cash') return '💵 Espèces';
        if (key === 'check') return '📝 Chèque';
        return '';
      })
      .filter(Boolean);

    if (enabledMethods.length > 0) {
      availableMethods.push({
        id: 'onBoard',
        label: paymentConfig.onBoard.label || 'Paiement au chauffeur',
        icon: '🚗',
        color: 'green',
        details: enabledMethods.join(' • ')
      });
    }
  }

  // Virement bancaire
  if (paymentConfig.bankTransfer?.enabled && paymentConfig.bankTransfer?.iban) {
    availableMethods.push({
      id: 'bankTransfer',
      label: paymentConfig.bankTransfer.label || 'Virement bancaire',
      icon: '🏦',
      color: 'amber',
      details: 'Virement à effectuer avant la course'
    });
  }

  if (availableMethods.length === 0) return null;

  const colorClasses = {
    purple: {
      border: 'border-purple-300',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      hoverBg: 'hover:bg-purple-100',
      selectedBorder: 'border-purple-500 bg-purple-50'
    },
    blue: {
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      hoverBg: 'hover:bg-blue-100',
      selectedBorder: 'border-blue-500 bg-blue-50'
    },
    green: {
      border: 'border-green-300',
      bg: 'bg-green-50',
      text: 'text-green-700',
      hoverBg: 'hover:bg-green-100',
      selectedBorder: 'border-green-500 bg-green-50'
    },
    amber: {
      border: 'border-amber-300',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      hoverBg: 'hover:bg-amber-100',
      selectedBorder: 'border-amber-500 bg-amber-50'
    }
  };

  return (
    <div className="mt-3 sm:mt-4">
      <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: BRANDING.primaryColor }}>
        Mode de paiement *
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {availableMethods.map(method => {
          const colors = colorClasses[method.color];
          const isSelected = selectedMethod === method.id;
          
          return (
            <label
              key={method.id}
              className={`flex items-start gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? colors.selectedBorder + ' ring-2 ring-offset-1 ring-' + method.color + '-300'
                  : colors.border + ' ' + colors.hoverBg
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ accentColor: BRANDING.primaryColor }}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl sm:text-2xl">{method.icon}</span>
                  <span className="font-semibold text-sm sm:text-base text-gray-900">
                    {method.label}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 leading-relaxed">
                  {method.details}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Info supplémentaire selon la méthode sélectionnée */}
      {selectedMethod === 'stripe' && paymentConfig.stripe?.requiresDeposit && (
        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-800">
            <strong>ℹ️ Acompte sécurisé :</strong> Le reste sera à régler {
              paymentConfig.onBoard?.enabled ? 'au chauffeur ou en ligne' : 'en ligne'
            } avant la course.
          </p>
        </div>
      )}

      {selectedMethod === 'bankTransfer' && paymentConfig.bankTransfer?.instructions && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>ℹ️ Instructions :</strong> {paymentConfig.bankTransfer.instructions}
          </p>
        </div>
      )}
    </div>
  );
}

export default PaymentMethodSelector;