import React, { useState, useEffect } from 'react';

export default function WizardStep3Package({ wizardData, onNext, onBack, onSkip, saving }) {
  const [wantsPackage, setWantsPackage] = useState(false);
  const [formData, setFormData] = useState({
    id: `package-${Date.now()}`,
    name: '',
    price: 50,
    departureZones: [],
    arrivalZones: [],
    vehicleTypes: [],
    description: '',
    enabled: true
  });

  const [departureSearch, setDepartureSearch] = useState('');
  const [arrivalSearch, setArrivalSearch] = useState('');
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
  const [searchingDeparture, setSearchingDeparture] = useState(false);
  const [searchingArrival, setSearchingArrival] = useState(false);

  // Récupérer le véhicule configuré à l'étape 1
  const vehicleFromStep1 = wizardData.vehicle;

  // Pré-sélectionner le véhicule de l'étape 1
  useEffect(() => {
    if (vehicleFromStep1 && formData.vehicleTypes.length === 0) {
      setFormData(prev => ({
        ...prev,
        vehicleTypes: [vehicleFromStep1.id]
      }));
    }
  }, [vehicleFromStep1]);

  // Départements français
  const departments = [
    { code: '75', name: 'Paris' },
    { code: '77', name: 'Seine-et-Marne' },
    { code: '78', name: 'Yvelines' },
    { code: '91', name: 'Essonne' },
    { code: '92', name: 'Hauts-de-Seine' },
    { code: '93', name: 'Seine-Saint-Denis' },
    { code: '94', name: 'Val-de-Marne' },
    { code: '95', name: "Val-d'Oise" },
  ];

  // Recherche d'adresses avec Google Maps Places API
  const searchAddress = async (query, type) => {
    if (query.length < 3) {
      if (type === 'departure') setDepartureSuggestions([]);
      else setArrivalSuggestions([]);
      return;
    }

    try {
      if (type === 'departure') setSearchingDeparture(true);
      else setSearchingArrival(true);

      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(query)}`
      );
      
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        if (type === 'departure') setSearchingDeparture(false);
        else setSearchingArrival(false);
        return;
      }

      const predictions = data.predictions || [];

      const suggestions = await Promise.all(
        predictions.slice(0, 5).map(async (prediction) => {
          try {
            const detailsResponse = await fetch(
              `/api/places/details?place_id=${encodeURIComponent(prediction.place_id)}`
            );
            
            const detailsData = await detailsResponse.json();
            
            if (detailsData.status === 'OK') {
              const place = detailsData.result;
              const location = place.geometry?.location;
              
              let city = '';
              let postcode = '';
              
              place.address_components?.forEach(component => {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                }
                if (component.types.includes('postal_code')) {
                  postcode = component.short_name;
                }
              });
              
              let icon = '📍';
              const types = place.types || [];
              if (types.includes('train_station') || types.includes('transit_station')) {
                icon = '🚂';
              } else if (types.includes('airport')) {
                icon = '✈️';
              }
              
              return {
                label: prediction.description,
                name: place.name || prediction.description.split(',')[0],
                city: city,
                postcode: postcode,
                context: `${city}${postcode ? ' (' + postcode + ')' : ''}`,
                lat: location?.lat,
                lon: location?.lng,
                icon: icon
              };
            }
          } catch (err) {
            console.error('Erreur détails:', err);
          }
          return null;
        })
      );

      const validSuggestions = suggestions.filter(s => s !== null);

      if (type === 'departure') {
        setDepartureSuggestions(validSuggestions);
      } else {
        setArrivalSuggestions(validSuggestions);
      }
    } catch (error) {
      console.error('Erreur recherche adresse:', error);
    } finally {
      if (type === 'departure') setSearchingDeparture(false);
      else setSearchingArrival(false);
    }
  };

  // Débounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (departureSearch) searchAddress(departureSearch, 'departure');
    }, 300);
    return () => clearTimeout(timer);
  }, [departureSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (arrivalSearch) searchAddress(arrivalSearch, 'arrival');
    }, 300);
    return () => clearTimeout(timer);
  }, [arrivalSearch]);

  const addZone = (type, deptCode) => {
    const zones = type === 'departure' ? formData.departureZones : formData.arrivalZones;
    if (!zones.includes(deptCode)) {
      setFormData(prev => ({
        ...prev,
        [type === 'departure' ? 'departureZones' : 'arrivalZones']: [...zones, deptCode]
      }));
    }
  };

  const addAddressZone = (type, suggestion) => {
    const zone = {
      name: suggestion.name,
      label: suggestion.label,
      lat: suggestion.lat,
      lon: suggestion.lon
    };
    
    const zonesKey = type === 'departure' ? 'departureZones' : 'arrivalZones';
    setFormData(prev => ({
      ...prev,
      [zonesKey]: [...prev[zonesKey], zone]
    }));
    
    if (type === 'departure') {
      setDepartureSearch('');
      setDepartureSuggestions([]);
    } else {
      setArrivalSearch('');
      setArrivalSuggestions([]);
    }
  };

  const removeZone = (type, index) => {
    const zonesKey = type === 'departure' ? 'departureZones' : 'arrivalZones';
    setFormData(prev => ({
      ...prev,
      [zonesKey]: prev[zonesKey].filter((_, i) => i !== index)
    }));
  };

  // Toggle sélection véhicule
  const toggleVehicleType = (vehicleId) => {
    const types = formData.vehicleTypes || [];
    const newTypes = types.includes(vehicleId)
      ? types.filter(t => t !== vehicleId)
      : [...types, vehicleId];
    setFormData(prev => ({ ...prev, vehicleTypes: newTypes }));
  };

  const handleSubmit = () => {
    if (wantsPackage) {
      // Validation
      if (!formData.name || formData.departureZones.length === 0 || formData.arrivalZones.length === 0) {
        alert('Veuillez remplir le nom et les zones de départ/arrivée');
        return;
      }
      if (formData.vehicleTypes.length === 0) {
        alert('Veuillez sélectionner au moins un véhicule');
        return;
      }
      onNext({ package: formData });
    } else {
      onNext({ package: null });
    }
  };

  const examplePackages = [
    { name: 'Transfert Aéroport', from: 'Paris', to: 'CDG', price: 70 },
    { name: 'Gare → Domicile', from: 'Gare de Lyon', to: '75', price: 35 },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl mb-4">
          <span className="text-4xl">🎫</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Créez votre premier forfait
        </h2>
        <p className="text-gray-600">
          Proposez un prix fixe pour un trajet récurrent (optionnel)
        </p>
      </div>

      {/* Question principale */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700 mb-4">
            Avez-vous des trajets récurrents avec un prix fixe ?
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => setWantsPackage(true)}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
              wantsPackage
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Oui, créer un forfait
          </button>
          <button
            type="button"
            onClick={() => setWantsPackage(false)}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
              !wantsPackage
                ? 'bg-gray-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⏭️ Plus tard
          </button>
        </div>

        {!wantsPackage && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">💡 Exemples :</p>
            <div className="grid grid-cols-2 gap-3">
              {examplePackages.map((ex, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900 text-sm">{ex.name}</p>
                  <p className="text-xs text-gray-500">{ex.from} → {ex.to}</p>
                  <p className="text-green-600 font-bold mt-1">{ex.price}€</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Formulaire */}
      {wantsPackage && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Nom et Prix */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Paris → CDG"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prix (€)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xl font-bold text-center"
              />
            </div>
          </div>

          {/* Départ */}
          <div className="bg-blue-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
            <h4 className="font-bold text-blue-900 mb-3">📍 Zones de départ</h4>
            
            <div className="mb-3 flex flex-wrap gap-2 min-h-[40px] p-2 bg-white rounded-lg">
              {formData.departureZones.length === 0 ? (
                <span className="text-gray-400 text-sm">Aucune zone sélectionnée</span>
              ) : (
                formData.departureZones.map((zone, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-lg text-sm">
                    {typeof zone === 'string' ? zone : zone.name}
                    <button onClick={() => removeZone('departure', idx)}>×</button>
                  </span>
                ))
              )}
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={departureSearch}
                onChange={(e) => setDepartureSearch(e.target.value)}
                placeholder="🔍 Rechercher..."
                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg"
              />
              {searchingDeparture && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-5 w-5 border-b-2 border-blue-600 rounded-full"></div>
                </div>
              )}
              
              {departureSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {departureSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => addAddressZone('departure', s)}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b last:border-b-0 flex items-center gap-2"
                    >
                      <span>{s.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.context}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {departments.map(dept => (
                <button
                  key={dept.code}
                  type="button"
                  onClick={() => addZone('departure', dept.code)}
                  className={`px-3 py-1.5 text-sm font-semibold border-2 rounded-lg ${
                    formData.departureZones.includes(dept.code)
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {dept.code}
                </button>
              ))}
            </div>
          </div>

          {/* Arrivée */}
          <div className="bg-green-50 rounded-xl p-4 mb-4 border-2 border-green-200">
            <h4 className="font-bold text-green-900 mb-3">🎯 Zones d'arrivée</h4>
            
            <div className="mb-3 flex flex-wrap gap-2 min-h-[40px] p-2 bg-white rounded-lg">
              {formData.arrivalZones.length === 0 ? (
                <span className="text-gray-400 text-sm">Aucune zone sélectionnée</span>
              ) : (
                formData.arrivalZones.map((zone, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-sm">
                    {typeof zone === 'string' ? zone : zone.name}
                    <button onClick={() => removeZone('arrival', idx)}>×</button>
                  </span>
                ))
              )}
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={arrivalSearch}
                onChange={(e) => setArrivalSearch(e.target.value)}
                placeholder="🔍 Rechercher..."
                className="w-full px-4 py-2 border-2 border-green-200 rounded-lg"
              />
              {searchingArrival && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-5 w-5 border-b-2 border-green-600 rounded-full"></div>
                </div>
              )}
              
              {arrivalSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-green-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {arrivalSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => addAddressZone('arrival', s)}
                      className="w-full px-3 py-2 text-left hover:bg-green-50 border-b last:border-b-0 flex items-center gap-2"
                    >
                      <span>{s.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.context}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {departments.map(dept => (
                <button
                  key={dept.code}
                  type="button"
                  onClick={() => addZone('arrival', dept.code)}
                  className={`px-3 py-1.5 text-sm font-semibold border-2 rounded-lg ${
                    formData.arrivalZones.includes(dept.code)
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {dept.code}
                </button>
              ))}
            </div>
          </div>

          {/* Sélection des véhicules */}
          <div className="bg-purple-50 rounded-xl p-4 mb-4 border-2 border-purple-200">
            <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🚗</span>
              Véhicules compatibles *
            </h4>
            <p className="text-sm text-purple-700 mb-3">
              Sélectionnez les véhicules pour lesquels ce forfait s'applique
            </p>
            
            {vehicleFromStep1 ? (
              <div className="space-y-2">
                <label 
                  className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.vehicleTypes.includes(vehicleFromStep1.id)
                      ? 'bg-purple-100 border-purple-400 shadow-md'
                      : 'bg-white border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.vehicleTypes.includes(vehicleFromStep1.id)}
                    onChange={() => toggleVehicleType(vehicleFromStep1.id)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-2xl">{vehicleFromStep1.icon}</span>
                  <div>
                    <span className="font-semibold text-gray-900">{vehicleFromStep1.name}</span>
                    <span className="text-xs text-gray-500 block">
                      {vehicleFromStep1.maxPassengers} passagers max
                    </span>
                  </div>
                </label>
                
                <p className="text-xs text-purple-600 italic">
                  💡 Vous pourrez ajouter d'autres véhicules depuis votre dashboard
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Aucun véhicule configuré. Retournez à l'étape 1 pour configurer un véhicule.
              </p>
            )}
          </div>

          {/* Récap */}
          {formData.name && formData.departureZones.length > 0 && formData.arrivalZones.length > 0 && formData.vehicleTypes.length > 0 && (
            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <p className="font-bold text-green-900">{formData.name}</p>
              <p className="text-sm text-green-700">
                {formData.departureZones.map(z => typeof z === 'string' ? z : z.name).join(' / ')}
                {' → '}
                {formData.arrivalZones.map(z => typeof z === 'string' ? z : z.name).join(' / ')}
              </p>
              <p className="text-sm text-green-700 mt-1">
                🚗 {formData.vehicleTypes.length === 1 && vehicleFromStep1 
                  ? vehicleFromStep1.name 
                  : `${formData.vehicleTypes.length} véhicule(s)`}
              </p>
              <p className="text-xl font-bold text-green-600 mt-2">{formData.price}€</p>
            </div>
          )}
        </div>
      )}

      {/* Boutons */}
      <div className="flex gap-3 justify-between">
        <button onClick={onBack} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">
          ← Retour
        </button>
        <div className="flex gap-3">
          <button onClick={() => onNext({ package: null })} className="px-6 py-3 text-gray-500">
            Passer
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold"
          >
            {saving ? 'Sauvegarde...' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  );
}