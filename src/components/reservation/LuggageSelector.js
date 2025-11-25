import React from 'react';

/**
 * Composant de sélection de bagages avec gestion automatique des suppléments
 */
export default function LuggageSelector({ selectedVehicle, luggage, onLuggageChange }) {
  if (!selectedVehicle) return null;

  const luggageConfig = selectedVehicle.luggage || {
    included: selectedVehicle.maxLuggage || 2,
    max: (selectedVehicle.maxLuggage || 2) * 2,
    pricePerExtra: selectedVehicle.pricing?.extraLuggagePrice || 5,
  };

  const { included, max, pricePerExtra } = luggageConfig;
  const paidCount = Math.max(0, Math.min(luggage, max) - included);
  const paidCost = paidCount * pricePerExtra;
  const exceedsMax = luggage > max;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧳</span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Bagages</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {included} gratuits • {max} max • {pricePerExtra}€/supplément
            </p>
          </div>
        </div>
      </div>

      {/* Sélecteur */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        <button
          type="button"
          onClick={() => onLuggageChange(Math.max(0, luggage - 1))}
          disabled={luggage <= 0}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border-2 border-orange-300 text-orange-600 font-bold text-xl hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 flex items-center justify-center"
        >
          −
        </button>

        <div className="flex-1">
          <input
            type="number"
            min="0"
            max={max}
            value={luggage}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              onLuggageChange(Math.max(0, val));
            }}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-orange-300 rounded-xl text-center text-xl sm:text-2xl font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
          <p className="text-xs text-center text-gray-500 mt-1 font-medium">
            {luggage === 0 ? "Aucun bagage" : luggage === 1 ? "1 bagage" : `${luggage} bagages`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onLuggageChange(luggage + 1)}
          disabled={exceedsMax}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border-2 border-orange-300 text-orange-600 font-bold text-xl hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Message contextuel */}
      <div>
        {exceedsMax ? (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">❌</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-red-900 mb-1">
                  Capacité dépassée !
                </p>
                <p className="text-xs text-red-800">
                  Ce véhicule ({selectedVehicle.name}) ne peut transporter que{" "}
                  <strong>{max} bagages maximum</strong>. Veuillez choisir un véhicule plus grand ou
                  réduire le nombre de bagages.
                </p>
              </div>
            </div>
          </div>
        ) : paidCount > 0 ? (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">💰</span>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-bold text-orange-900 mb-1">
                  Supplément bagages
                </p>
                <p className="text-xs sm:text-sm text-orange-800">
                  <strong>
                    {paidCount} bagage{paidCount > 1 ? "s" : ""} payant{paidCount > 1 ? "s" : ""}
                  </strong>{" "}
                  ({paidCount} × {pricePerExtra}€) ={" "}
                  <strong className="text-orange-900">{paidCost.toFixed(2)}€</strong>
                </p>
              </div>
            </div>
          </div>
        ) : luggage > 0 && luggage <= included ? (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <p className="text-xs sm:text-sm font-bold text-green-800">
                {luggage} bagage{luggage > 1 ? "s" : ""} inclus gratuitement !
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              Sélectionnez le nombre de bagages que vous transportez
            </p>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="mt-3 pt-3 border-t-2 border-orange-200">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-bold text-green-700">0-{included}</div>
            <div className="text-gray-600">GRATUIT</div>
          </div>
          <div>
            <div className="font-bold text-orange-700">
              {included + 1}-{max}
            </div>
            <div className="text-gray-600">{pricePerExtra}€/bagage</div>
          </div>
          <div>
            <div className="font-bold text-red-700">{max}+</div>
            <div className="text-gray-600">IMPOSSIBLE</div>
          </div>
        </div>
      </div>
    </div>
  );
}