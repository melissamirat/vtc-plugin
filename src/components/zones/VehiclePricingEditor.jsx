import React from 'react';

export default function VehiclePricingEditor({ vehiclePricing, vehicles, onChange }) {
  
  const handleUpdatePricing = (vehicleId, field, value) => {
    const updated = vehiclePricing.map(vp => {
      if (vp.vehicleId === vehicleId) {
        return {
          ...vp,
          pricing: {
            ...vp.pricing,
            [field]: parseFloat(value) || 0
          }
        };
      }
      return vp;
    });
    onChange(updated);
  };

  const handleToggleVehicle = (vehicleId) => {
    const updated = vehiclePricing.map(vp => 
      vp.vehicleId === vehicleId ? { ...vp, enabled: !vp.enabled } : vp
    );
    onChange(updated);
  };

  // Nouvelle fonction : basculer entre tarif personnalisé et tarif par défaut
  const handleToggleCustomPricing = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const updated = vehiclePricing.map(vp => {
      if (vp.vehicleId === vehicleId) {
        const useDefault = !vp.useDefaultPricing;
        return {
          ...vp,
          useDefaultPricing: useDefault,
          // Si on passe en mode défaut, on garde les valeurs actuelles comme backup
          // Si on repasse en personnalisé, on utilise les valeurs du véhicule comme base
          pricing: useDefault ? vp.pricing : {
            basePrice: vehicle?.pricing?.minPrice || 10,
            pricePerKm: vehicle?.pricing?.perKm || 2,
            minPrice: vehicle?.pricing?.minPrice || 20,
            kmThreshold: vehicle?.pricing?.kmThreshold || 0,
            pricePerMinute: 0,
          }
        };
      }
      return vp;
    });
    onChange(updated);
  };

  if (!vehiclePricing || vehiclePricing.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-5xl mb-4">🚗</div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun véhicule disponible</h3>
        <p className="text-gray-500">Vous devez d'abord créer des catégories de véhicules</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Configuration des tarifs:</strong> Pour chaque véhicule, choisissez d'utiliser les tarifs par défaut ou de définir des tarifs personnalisés pour cette zone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {vehiclePricing.map((vp) => {
          const vehicle = vehicles.find(v => v.id === vp.vehicleId);
          const useDefault = vp.useDefaultPricing;
          
          return (
            <div 
              key={vp.vehicleId} 
              className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                vp.enabled ? 'border-blue-200 shadow-md' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* En-tête du véhicule */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {vehicle?.icon || '🚗'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{vp.vehicleName}</h4>
                      <p className="text-xs text-gray-600">
                        {vehicle?.maxPassengers || 4} passagers max
                      </p>
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vp.enabled}
                      onChange={() => handleToggleVehicle(vp.vehicleId)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm font-semibold ${vp.enabled ? 'text-green-700' : 'text-gray-500'}`}>
                      {vp.enabled ? '✓ Actif' : '○ Inactif'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Configuration des prix */}
              {vp.enabled && (
                <div className="p-4 space-y-4">
                  
                  {/* Toggle tarif par défaut / personnalisé */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCustomPricing(vp.vehicleId)}
                      className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        useDefault 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🚗 Tarif véhicule
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleCustomPricing(vp.vehicleId)}
                      className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        !useDefault 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      ✏️ Tarif zone
                    </button>
                  </div>

                  {/* Mode tarif par défaut */}
                  {useDefault && (
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">✅</span>
                        <span className="font-bold text-green-800">Tarifs par défaut du véhicule</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-green-700">
                          Prix de base: <span className="font-bold">{vehicle?.pricing?.minPrice || 0}€</span>
                        </div>
                        <div className="text-green-700">
                          Prix/km: <span className="font-bold">{vehicle?.pricing?.perKm || 0}€</span>
                        </div>
                        <div className="text-green-700">
                          Seuil km: <span className="font-bold">{vehicle?.pricing?.kmThreshold || 0} km</span>
                        </div>
                        <div className="text-green-700">
                          Forfait min: <span className="font-bold">{vehicle?.pricing?.minPrice || 0}€</span>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-3 italic">
                        Les tarifs configurés dans "Gestion des véhicules" seront utilisés.
                      </p>
                    </div>
                  )}

                  {/* Mode tarif personnalisé */}
                  {!useDefault && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">✏️</span>
                        <span className="font-bold text-purple-800">Tarifs personnalisés pour cette zone</span>
                      </div>
                      
                     

                      {/* Prix au km */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          📏 Prix par kilomètre (€/km)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={vp.pricing.pricePerKm || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            handleUpdatePricing(vp.vehicleId, 'pricePerKm', value === '' ? 0 : value);
                          }}
                          onFocus={(e) => e.target.select()}
                          placeholder="1.8"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-center font-bold"
                        />
                      </div>

                      {/* Prix minimum */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          🎯 Forfait minimum (€)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={vp.pricing.minPrice || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            handleUpdatePricing(vp.vehicleId, 'minPrice', value === '' ? 0 : value);
                          }}
                          onFocus={(e) => e.target.select()}
                          placeholder="15"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-center font-bold"
                        />
                      </div>

                      {/* Seuil km */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          📐 Seuil kilométrique (km)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={vp.pricing.kmThreshold || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            handleUpdatePricing(vp.vehicleId, 'kmThreshold', value === '' ? 0 : value);
                          }}
                          onFocus={(e) => e.target.select()}
                          placeholder="5"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-center font-bold"
                        />
                        <p className="text-[10px] text-gray-500 mt-0.5">En dessous : prix minimum. Au-dessus : prix/km</p>
                      </div>

                      {/* Exemple de calcul */}
                      
                    </div>
                  )}
                </div>
              )}

              {/* Message véhicule désactivé */}
              {!vp.enabled && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Ce véhicule est désactivé pour cette zone
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Récapitulatif global */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
        <div className="text-sm font-semibold text-purple-900 mb-2">
          📊 Récapitulatif
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-purple-800">
            Actifs: <span className="font-bold">{vehiclePricing.filter(vp => vp.enabled).length}</span>
          </div>
          <div className="text-purple-800">
            Tarif zone: <span className="font-bold">{vehiclePricing.filter(vp => vp.enabled && !vp.useDefaultPricing).length}</span>
          </div>
          <div className="text-purple-800">
            Tarif défaut: <span className="font-bold">{vehiclePricing.filter(vp => vp.enabled && vp.useDefaultPricing).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}