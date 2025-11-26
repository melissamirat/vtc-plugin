import React, { useState } from 'react';
import GeographySelector from './GeographySelector';
import VehiclePricingEditor from './VehiclePricingEditor';

export default function ZoneEditor({ zone, vehicles, mapsLoaded, onSave, onCancel }) {
  const [editedZone, setEditedZone] = useState(zone);
  const [activeTab, setActiveTab] = useState('general'); // general, geography, pricing, restrictions
  const [errors, setErrors] = useState({});

  const handleUpdate = (field, value) => {
    setEditedZone(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleGeographyUpdate = (geography) => {
    setEditedZone(prev => ({
      ...prev,
      geography
    }));
  };

  const handlePricingUpdate = (vehiclePricing) => {
    setEditedZone(prev => ({
      ...prev,
      vehiclePricing
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!editedZone.name || editedZone.name.trim() === '') {
      newErrors.name = 'Le nom est obligatoire';
    }
    
    if (!editedZone.geography) {
      newErrors.geography = 'La géographie doit être définie';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(editedZone);
    } else {
      // Afficher le premier onglet avec une erreur
      if (errors.name) setActiveTab('general');
      if (errors.geography) setActiveTab('geography');
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: '📝' },
    { id: 'geography', label: 'Géographie', icon: '🗺️' },
    { id: 'pricing', label: 'Tarifs', icon: '💰', badge: editedZone.vehiclePricing?.length || 0 },
    { id: 'restrictions', label: 'Restrictions', icon: '⚙️' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col my-4 sm:my-8">
        
        {/* En-tête */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-2xl font-bold text-gray-900 truncate">
                {zone.id.startsWith('zone-') && zone.name === 'Nouvelle zone' 
                  ? 'Créer une zone' 
                  : 'Modifier la zone'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">
                Configurez la zone géographique et les tarifs
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Fermer"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Onglets */}
          <div className="flex gap-1 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="space-y-3 sm:space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Nom de la zone *
                </label>
                <input
                  type="text"
                  value={editedZone.name}
                  onChange={(e) => handleUpdate('name', e.target.value)}
                  placeholder="Ex: Zone Aéroport CDG"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={editedZone.description}
                  onChange={(e) => handleUpdate('description', e.target.value)}
                  placeholder="Description de la zone..."
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                />
              </div>

              

              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editedZone.enabled}
                  onChange={(e) => handleUpdate('enabled', e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="text-xs sm:text-sm font-medium text-gray-700">
                  Zone active
                </label>
              </div>
            </div>
          )}

          {/* Onglet Géographie */}
          {activeTab === 'geography' && (
            <GeographySelector
              geography={editedZone.geography}
              mapsLoaded={mapsLoaded}
              onChange={handleGeographyUpdate}
              error={errors.geography}
            />
          )}

          {/* Onglet Tarification */}
          {activeTab === 'pricing' && (
            <VehiclePricingEditor
              vehiclePricing={editedZone.vehiclePricing}
              vehicles={vehicles}
              onChange={handlePricingUpdate}
            />
          )}

          {/* Onglet Restrictions */}
          {activeTab === 'restrictions' && (
            <div className="space-y-4 sm:space-y-6 max-w-2xl">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Délai minimum (heures)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editedZone.restrictions?.minBookingHours || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleUpdate('restrictions', {
                      ...editedZone.restrictions,
                      minBookingHours: value === '' ? 0 : parseInt(value)
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  0 = réservation immédiate. 24 = 24h à l'avance
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Jours autorisés
                </label>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const allowedDays = editedZone.restrictions?.allowedDays || [0, 1, 2, 3, 4, 5, 6];
                        const newDays = allowedDays.includes(index)
                          ? allowedDays.filter(d => d !== index)
                          : [...allowedDays, index].sort();
                        handleUpdate('restrictions', {
                          ...editedZone.restrictions,
                          allowedDays: newDays
                        });
                      }}
                      className={`px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                        (editedZone.restrictions?.allowedDays || [0, 1, 2, 3, 4, 5, 6]).includes(index)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs sm:text-sm text-amber-800">
                  <strong>💡 Note:</strong> Les restrictions s'appliquent aux nouvelles réservations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-3 sm:p-6 border-t border-gray-200 bg-gray-50 flex gap-2 sm:gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm sm:text-base"
          >
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}