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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col my-8">
        
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {zone.id.startsWith('zone-') && zone.name === 'Nouvelle zone' 
                  ? 'Créer une zone de service' 
                  : 'Modifier la zone de service'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configurez la zone géographique et les tarifs par véhicule
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Onglets */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
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
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de la zone *
                </label>
                <input
                  type="text"
                  value={editedZone.name}
                  onChange={(e) => handleUpdate('name', e.target.value)}
                  placeholder="Ex: Zone Aéroport CDG, Département 75, Zone Courchevel"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={editedZone.description}
                  onChange={(e) => handleUpdate('description', e.target.value)}
                  placeholder="Description de la zone, notes particulières..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priorité
                </label>
                <input
                  type="number"
                  min="1"
                  value={editedZone.priority || 1}
                  onChange={(e) => handleUpdate('priority', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Plus le nombre est élevé, plus cette zone sera prioritaire si plusieurs zones se chevauchent
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editedZone.enabled}
                  onChange={(e) => handleUpdate('enabled', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  Zone active (les réservations seront acceptées)
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
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Délai de réservation minimum (heures)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editedZone.restrictions?.minBookingHours || 0}
                  onChange={(e) => handleUpdate('restrictions', {
                    ...editedZone.restrictions,
                    minBookingHours: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  0 = réservation immédiate autorisée. 24 = réservation 24h à l'avance obligatoire
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Jours autorisés
                </label>
                <div className="grid grid-cols-7 gap-2">
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
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
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

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>💡 Note:</strong> Les restrictions s'appliquent aux nouvelles réservations dans cette zone.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            💾 Enregistrer la zone
          </button>
        </div>
      </div>
    </div>
  );
}