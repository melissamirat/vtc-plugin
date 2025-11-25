import React from 'react';

/**
 * Composant d'affichage du prix estimé avec détails
 */
export default function PriceDisplay({
  prixEstime,
  isCalculating,
  distanceKm,
  priceBreakdown,
  appliedPromo,
  BRANDING,
}) {
  return (
    <div
      className="mb-6 p-4 sm:p-6 bg-white border-2 rounded-xl shadow-xl relative"
      style={{ borderColor: BRANDING.primaryColor }}
    >
      <div
        className="absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg"
        style={{ backgroundColor: BRANDING.primaryColor }}
      >
        ESTIMATION
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 pt-2">
        <span className="block sm:inline">Prix Total Estimé:</span>
        <span
          className="block sm:inline text-3xl sm:text-4xl mt-2 sm:mt-0 sm:ml-2"
          style={{ color: BRANDING.primaryColor }}
        >
          {isCalculating ? (
            <span className="text-base sm:text-lg text-gray-500">Calcul...</span>
          ) : (
            `${prixEstime} €`
          )}
        </span>
      </h3>

      <div className="text-sm text-gray-600 mt-3 space-y-1">
        {distanceKm > 0 ? (
          <>
            <span className="font-semibold block">Distance: {distanceKm} km</span>

            {/* Détail du calcul */}
            {priceBreakdown && priceBreakdown.details.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="font-semibold text-gray-700 mb-2">Détail du calcul:</p>
                {priceBreakdown.details.map((detail, index) => (
                  <div key={index} className="flex justify-between text-xs py-1">
                    <span className="text-gray-600">{detail.label}</span>
                    <span className="font-semibold">{detail.amount.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            )}

            {/* Forfait appliqué */}
            {priceBreakdown?.appliedPackage && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-800 font-semibold">
                  ✅ Forfait appliqué: {priceBreakdown.appliedPackage.name}
                </p>
              </div>
            )}

            {/* Seuil kilométrique */}
            {priceBreakdown?.usedKmThreshold && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  ℹ️ Distance inférieure au seuil : forfait minimum appliqué
                </p>
              </div>
            )}

            {/* Code promo */}
            {appliedPromo && (
              <span className="block text-green-600 font-semibold mt-2">
                🎟️ Code promo:{" "}
                {appliedPromo.type === "percentage"
                  ? `-${appliedPromo.value}%`
                  : `-${appliedPromo.value} €`}
              </span>
            )}
          </>
        ) : (
          <span className="block text-sm text-gray-500">
            Validez les adresses pour obtenir le prix
          </span>
        )}
      </div>
    </div>
  );
}