import React, { useState, useEffect } from 'react';

export default function WizardStep3Package({ wizardData, onNext, onBack, saving }) {
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-900/20">
            <span className="text-4xl">🎫</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          Créer un forfait (optionnel)
        </h2>
        <p className="text-stone-600">
          Prix fixe pour un trajet récurrent
        </p>
      </div>

      {/* Voulez-vous créer un forfait ? */}
      <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/10 p-6 mb-6 border border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-4">
          💡 Voulez-vous créer un forfait maintenant ?
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Les forfaits permettent de proposer un prix fixe pour des trajets récurrents 
          (transferts aéroport, gares, etc.)
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setWantsPackage(true)}
            className={`group relative p-4 rounded-xl border-2 transition-all overflow-hidden ${
              wantsPackage
                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
            }`}
          >
            {wantsPackage && (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
            )}
            <div className="relative text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-stone-900">Oui, créer un forfait</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setWantsPackage(false)}
            className={`group relative p-4 rounded-xl border-2 transition-all overflow-hidden ${
              !wantsPackage
                ? 'border-stone-500 bg-stone-50 shadow-md'
                : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
            }`}
          >
            {!wantsPackage && (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-500/10 to-transparent"></div>
            )}
            <div className="relative text-center">
              <div className="text-3xl mb-2">⏭️</div>
              <div className="font-semibold text-stone-900">Plus tard</div>
              <div className="text-xs text-stone-600">Je le ferai depuis le dashboard</div>
            </div>
          </button>
        </div>
      </div>

      {/* Formulaire de création */}
      {wantsPackage && (
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/10 p-6 mb-6 border border-stone-200">
          <h3 className="text-lg font-bold text-stone-900 mb-4">
            ✏️ Configuration du forfait
          </h3>

          {/* Nom et Prix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-1">
                Nom du forfait
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Transfert CDG"
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-1">
                Prix fixe
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">€</span>
              </div>
            </div>
          </div>

          {/* Départ */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border-2 border-amber-200">
            <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🚀</span>
              Zones de départ
            </h4>
            
            <div className="mb-3 flex flex-wrap gap-2 min-h-[40px] p-2 bg-white rounded-lg">
              {formData.departureZones.length === 0 ? (
                <span className="text-stone-400 text-sm">Aucune zone sélectionnée</span>
              ) : (
                formData.departureZones.map((zone, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium shadow-sm">
                    {typeof zone === 'string' ? zone : zone.name}
                    <button
                      type="button"
                      onClick={() => removeZone('departure', idx)}
                      className="hover:bg-amber-600 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={departureSearch}
                onChange={(e) => setDepartureSearch(e.target.value)}
                placeholder="🔍 Rechercher une adresse..."
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
              />
              {searchingDeparture && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-5 w-5 border-b-2 border-amber-600 rounded-full"></div>
                </div>
              )}
              
              {departureSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-amber-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {departureSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addAddressZone('departure', s)}
                      className="w-full px-3 py-2 text-left hover:bg-amber-50 border-b last:border-b-0 flex items-center gap-2 transition-colors"
                    >
                      <span>{s.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{s.name}</div>
                        <div className="text-xs text-stone-500">{s.context}</div>
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
                  className={`px-3 py-1.5 text-sm font-semibold border-2 rounded-lg transition-all ${
                    formData.departureZones.includes(dept.code)
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                      : 'bg-white border-stone-300 hover:border-amber-300'
                  }`}
                >
                  {dept.code}
                </button>
              ))}
            </div>
          </div>

          {/* Arrivée */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-4 border-2 border-emerald-200">
            <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Zones d'arrivée
            </h4>
            
            <div className="mb-3 flex flex-wrap gap-2 min-h-[40px] p-2 bg-white rounded-lg">
              {formData.arrivalZones.length === 0 ? (
                <span className="text-stone-400 text-sm">Aucune zone sélectionnée</span>
              ) : (
                formData.arrivalZones.map((zone, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium shadow-sm">
                    {typeof zone === 'string' ? zone : zone.name}
                    <button
                      type="button"
                      onClick={() => removeZone('arrival', idx)}
                      className="hover:bg-emerald-600 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={arrivalSearch}
                onChange={(e) => setArrivalSearch(e.target.value)}
                placeholder="🔍 Rechercher une adresse..."
                className="w-full px-4 py-2 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {searchingArrival && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-5 w-5 border-b-2 border-emerald-600 rounded-full"></div>
                </div>
              )}
              
              {arrivalSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-emerald-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {arrivalSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addAddressZone('arrival', s)}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50 border-b last:border-b-0 flex items-center gap-2 transition-colors"
                    >
                      <span>{s.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{s.name}</div>
                        <div className="text-xs text-stone-500">{s.context}</div>
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
                  className={`px-3 py-1.5 text-sm font-semibold border-2 rounded-lg transition-all ${
                    formData.arrivalZones.includes(dept.code)
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                      : 'bg-white border-stone-300 hover:border-emerald-300'
                  }`}
                >
                  {dept.code}
                </button>
              ))}
            </div>
          </div>

          {/* Sélection des véhicules */}
          <div className="bg-gradient-to-r from-stone-50 to-amber-50 rounded-xl p-4 mb-4 border-2 border-stone-300">
            <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🚗</span>
              Véhicules compatibles
              <span className="text-red-500">*</span>
            </h4>
            <p className="text-sm text-stone-700 mb-3">
              Sélectionnez les véhicules pour lesquels ce forfait s'applique
            </p>
            
            {vehicleFromStep1 ? (
              <div className="space-y-2">
                <label 
                  className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.vehicleTypes.includes(vehicleFromStep1.id)
                      ? 'bg-amber-100 border-amber-400 shadow-md'
                      : 'bg-white border-stone-300 hover:border-amber-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.vehicleTypes.includes(vehicleFromStep1.id)}
                    onChange={() => toggleVehicleType(vehicleFromStep1.id)}
                    className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-2xl">{vehicleFromStep1.icon}</span>
                  <div>
                    <span className="font-semibold text-stone-900">{vehicleFromStep1.name}</span>
                    <span className="text-xs text-stone-500 block">
                      {vehicleFromStep1.maxPassengers} passagers max
                    </span>
                  </div>
                </label>
                
                <p className="text-xs text-amber-700 italic">
                  💡 Vous pourrez ajouter d'autres véhicules depuis votre dashboard
                </p>
              </div>
            ) : (
              <p className="text-sm text-stone-500 italic">
                Aucun véhicule configuré. Retournez à l'étape 1 pour configurer un véhicule.
              </p>
            )}
          </div>

          {/* Récap */}
          {formData.name && formData.departureZones.length > 0 && formData.arrivalZones.length > 0 && formData.vehicleTypes.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
              <p className="font-bold text-emerald-900 mb-1">{formData.name}</p>
              <p className="text-sm text-emerald-700">
                {formData.departureZones.map(z => typeof z === 'string' ? z : z.name).join(' / ')}
                {' → '}
                {formData.arrivalZones.map(z => typeof z === 'string' ? z : z.name).join(' / ')}
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                🚗 {formData.vehicleTypes.length === 1 && vehicleFromStep1 
                  ? vehicleFromStep1.name 
                  : `${formData.vehicleTypes.length} véhicule(s)`}
              </p>
              <p className="text-xl font-bold text-emerald-600 mt-2">{formData.price}€</p>
            </div>
          )}
        </div>
      )}

      {/* Boutons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-all border border-stone-200"
        >
          ← Retour
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || (wantsPackage && (!formData.name || formData.departureZones.length === 0 || formData.arrivalZones.length === 0 || formData.vehicleTypes.length === 0))}
          className="group relative px-8 py-4 bg-gradient-to-r from-stone-700 via-amber-600 to-stone-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative">
            {saving ? 'Sauvegarde...' : 'Suivant →'}
          </span>
        </button>
      </div>
    </div>
  );
}