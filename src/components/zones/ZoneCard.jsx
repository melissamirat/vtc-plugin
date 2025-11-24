import React from 'react';

export default function ZoneCard({ zone, onEdit, onDelete, onToggle, onDuplicate }) {
  
  const getGeographyIcon = (type) => {
    switch (type) {
      case 'radius': return '📍';
      case 'polygon': return '📐';
      case 'administrative': return '🏛️';
      default: return '🗺️';
    }
  };

  const getGeographyLabel = (type) => {
    switch (type) {
      case 'radius': return 'Rayon';
      case 'polygon': return 'Polygone';
      case 'administrative': return 'Administratif';
      default: return 'Zone';
    }
  };

  const getGeographyDescription = () => {
    const { geography } = zone;
    
    switch (geography.type) {
      case 'radius':
        return `${geography.radius} km autour de ${geography.center.address}`;
      case 'polygon':
        return `${geography.polygon?.paths?.length || 0} points`;
      case 'administrative':
        return `${geography.administrative?.name || 'Zone'} (${geography.administrative?.code || ''})`;
      default:
        return 'Non défini';
    }
  };

  const activeVehicles = zone.vehiclePricing?.filter(v => v.enabled).length || 0;
  const totalVehicles = zone.vehiclePricing?.length || 0;

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 overflow-hidden hover:shadow-xl transition-all ${
      zone.enabled ? 'border-blue-200' : 'border-gray-200 opacity-60'
    }`}>
      
      {/* En-tête */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{zone.name}</h3>
              {!zone.enabled && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-semibold">
                  Inactif
                </span>
              )}
            </div>
            {zone.description && (
              <p className="text-xs text-gray-600">{zone.description}</p>
            )}
          </div>
          
          {/* Toggle actif/inactif */}
          <button
            onClick={() => onToggle(zone.id)}
            className={`p-2 rounded-lg transition-colors ${
              zone.enabled 
                ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
            title={zone.enabled ? 'Désactiver' : 'Activer'}
          >
            {zone.enabled ? '✓' : '○'}
          </button>
        </div>

        {/* Type de géographie */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <span className="text-2xl">{getGeographyIcon(zone.geography.type)}</span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-blue-900">{getGeographyLabel(zone.geography.type)}</div>
            <div className="text-xs text-blue-700">{getGeographyDescription()}</div>
          </div>
        </div>

        {/* Statistiques véhicules */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="text-xs font-semibold text-purple-900">Véhicules</div>
            <div className="text-lg font-bold text-purple-700">
              {activeVehicles}/{totalVehicles}
            </div>
          </div>
          <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="text-xs font-semibold text-green-900">Priorité</div>
            <div className="text-lg font-bold text-green-700">
              {zone.priority || 1}
            </div>
          </div>
        </div>

        {/* Aperçu des prix */}
        {zone.vehiclePricing && zone.vehiclePricing.length > 0 && (
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-1">Exemple de tarif</div>
            {(() => {
              const vp = zone.vehiclePricing[0];
              const pricing = vp.pricing;
              
              // Si useDefaultPricing ou pricing null → afficher "Tarif véhicule"
              if (vp.useDefaultPricing || !pricing) {
                return (
                  <div className="text-xs text-gray-600">
                    {vp.vehicleName}: <span className="text-green-600 font-medium">Tarif véhicule par défaut</span>
                  </div>
                );
              }
              
              // Sinon afficher le tarif personnalisé
              return (
                <div className="text-xs text-gray-600">
                  {vp.vehicleName}: {pricing.pricePerKm || 0}€/km
                  {pricing.basePrice > 0 && ` + ${pricing.basePrice}€ base`}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 bg-gray-50 p-2 flex gap-1">
        <button
          onClick={() => onEdit(zone)}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          ✏️ Modifier
        </button>
        <button
          onClick={() => onDuplicate(zone)}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
          title="Dupliquer"
        >
          📋
        </button>
        <button
          onClick={() => onDelete(zone.id)}
          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
          title="Supprimer"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}