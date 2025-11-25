import React from 'react';
import LuggageSelector from './LuggageSelector';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';

/**
 * Section des options - VERSION MODERNE
 */
export default function OptionsSection({
  formData,
  onChange,
  BRANDING,
  inputClassName,
  labelClassName,
  selectedVehicle,
  appliedPromo,
  promoError,
  checkingPromo,
  onApplyPromo,
  onRemovePromo,
  paymentConfig,
  priceBreakdown,
}) {
  return (
    <fieldset
      className="mb-6 p-4 sm:p-6 border-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-white to-amber-50"
      style={{ borderColor: BRANDING.accentColor }}
    >
      <legend
        className="px-3 text-base sm:text-lg font-bold flex items-center gap-2"
        style={{ color: BRANDING.primaryColor }}
      >
        <span className="text-2xl">⚙️</span>
        Options
      </legend>

      {/* Bagages */}
      <div className="mt-4 sm:mt-5">
        <LuggageSelector
          selectedVehicle={selectedVehicle}
          luggage={formData.bagagesExtra}
          onLuggageChange={(value) => onChange({ target: { name: "bagagesExtra", value } })}
        />
      </div>

      {/* Commentaires avec design moderne */}
      <div className="mt-4 sm:mt-5">
        <label className={`${labelClassName} flex items-center gap-2`}>
          <span className="text-lg">💬</span>
          Commentaires
        </label>
        <textarea
          name="commentaires"
          value={formData.commentaires}
          onChange={onChange}
          rows="3"
          placeholder="Siège bébé, stop supplémentaire, instructions spéciales..."
          className={`${inputClassName} hover:border-blue-300 focus:border-blue-500 transition-all resize-none ${
            formData.commentaires ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : ''
          }`}
        />
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <span>💡</span>
          Partagez toute information utile pour votre course
        </p>
      </div>

      {/* Code promo avec design moderne */}
      <div className="mt-4 sm:mt-5">
        <label className={`${labelClassName} flex items-center gap-2`}>
          <span className="text-lg">🎟️</span>
          Code promo
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              name="promoCode"
              value={formData.promoCode}
              onChange={onChange}
              placeholder="BIENVENUE10"
              className={`${inputClassName} flex-1 uppercase font-mono tracking-wider ${
                appliedPromo 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' 
                  : promoError
                  ? 'border-red-400 bg-red-50'
                  : ''
              }`}
              disabled={!!appliedPromo}
            />
            {appliedPromo && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          {!appliedPromo ? (
            <button
              type="button"
              onClick={onApplyPromo}
              disabled={checkingPromo || !formData.promoCode.trim()}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all transform hover:scale-105 whitespace-nowrap text-sm sm:text-base"
            >
              {checkingPromo ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="hidden sm:inline">Vérif...</span>
                </span>
              ) : (
                "Appliquer"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onRemovePromo}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 whitespace-nowrap text-sm sm:text-base"
            >
              Retirer
            </button>
          )}
        </div>

        {/* Messages promo */}
        {promoError && (
          <div className="mt-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-300 rounded-lg animate-shake">
            <p className="text-xs text-red-700 flex items-center gap-2">
              <span>❌</span>
              {promoError}
            </p>
          </div>
        )}
        
        {appliedPromo && (
          <div className="mt-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg animate-fade-in">
            <p className="text-xs text-green-700 font-semibold flex items-center gap-2">
              <span>🎉</span>
              Code appliqué:{" "}
              {appliedPromo.type === "percentage"
                ? `-${appliedPromo.value}%`
                : `-${appliedPromo.value} €`}
            </p>
          </div>
        )}
      </div>

      {/* Méthode de paiement */}
      <div className="mt-4 sm:mt-5">
        <PaymentMethodSelector
          paymentConfig={paymentConfig}
          selectedMethod={formData.paymentMethod}
          onChange={(method) => onChange({ target: { name: "paymentMethod", value: method } })}
          totalPrice={priceBreakdown?.finalPrice || 0}
          BRANDING={BRANDING}
        />
      </div>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </fieldset>
  );
}