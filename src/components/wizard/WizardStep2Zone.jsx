import React, { useState, useEffect, useRef } from 'react';

export default function WizardStep2Zone({ wizardData, onNext, onBack, saving }) {
  const [zone, setZone] = useState(() => {
    const existingZone = wizardData.zone;
    
    // Structure alignée avec page.js
    return existingZone || {
      id: `zone-${Date.now()}`,
      name: 'Ma zone principale',
      description: 'Zone de service par défaut',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      geography: {
        type: 'radius',
        center: null,
        radius: 30,
      },
      vehiclePricing: [],
      priority: 1,
      restrictions: {
        minBookingHours: 0,
        maxPassengers: null,
        allowedDays: [0, 1, 2, 3, 4, 5, 6],
      },
    };
  });

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [geoType, setGeoType] = useState(zone.geography?.type || 'radius');
  const [useDefaultPricing, setUseDefaultPricing] = useState(true);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const circleRef = useRef(null);
  const rectangleRef = useRef(null);
  const markerRef = useRef(null);

  // Vérifier si Google Maps est chargé
  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
        clearInterval(checkGoogleMaps);
      }
    }, 100);
    return () => clearInterval(checkGoogleMaps);
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (mapsLoaded && mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, [mapsLoaded]);

  // Mettre à jour l'affichage de la carte
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapDisplay();
    }
  }, [zone.geography, geoType]);

  // Réinitialiser l'autocomplete quand le type change
  useEffect(() => {
    if (mapsLoaded && mapInstanceRef.current && searchInputRef.current) {
      initAutocomplete();
    }
  }, [geoType, mapsLoaded]);

  const initMap = () => {
    const center = zone.geography?.center || { lat: 48.8566, lng: 2.3522 };
    
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 10,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    initAutocomplete();
    updateMapDisplay();
  };

  const initAutocomplete = () => {
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    if (!searchInputRef.current) return;
    searchInputRef.current.value = '';

    const options = geoType === 'radius'
      ? {
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'geometry', 'place_id', 'name'],
        }
      : {
          types: ['(regions)'],
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'geometry', 'place_id', 'name'],
        };

    autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, options);
    autocompleteRef.current.addListener('place_changed', handlePlaceSelected);
  };

  const handlePlaceSelected = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) return;

    const location = place.geometry.location;

    if (geoType === 'radius') {
      setZone(prev => ({
        ...prev,
        geography: {
          ...prev.geography,
          type: 'radius',
          center: {
            lat: location.lat(),
            lng: location.lng(),
            address: place.formatted_address || place.name,
            placeId: place.place_id || '',
          },
        },
        updatedAt: new Date().toISOString(),
      }));
      mapInstanceRef.current.setCenter(location);
      mapInstanceRef.current.setZoom(11);
    } else {
      let bounds = null;
      if (place.geometry.viewport) {
        const viewport = place.geometry.viewport;
        bounds = {
          north: viewport.getNorthEast().lat(),
          south: viewport.getSouthWest().lat(),
          east: viewport.getNorthEast().lng(),
          west: viewport.getSouthWest().lng(),
        };
      }

      setZone(prev => ({
        ...prev,
        geography: {
          type: 'region',
          center: {
            lat: location.lat(),
            lng: location.lng(),
            address: place.formatted_address || place.name,
            placeId: place.place_id || '',
          },
          region: {
            name: place.name || place.formatted_address,
            address: place.formatted_address,
            placeId: place.place_id,
            bounds,
          },
        },
        updatedAt: new Date().toISOString(),
      }));

      if (place.geometry.viewport) {
        mapInstanceRef.current.fitBounds(place.geometry.viewport);
      }
    }
  };

  const updateMapDisplay = () => {
    if (!mapInstanceRef.current) return;

    // Nettoyer
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }
    if (rectangleRef.current) {
      rectangleRef.current.setMap(null);
      rectangleRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    const geo = zone.geography;

    if (geoType === 'radius' && geo?.center) {
      circleRef.current = new google.maps.Circle({
        strokeColor: '#D97706',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#D97706',
        fillOpacity: 0.2,
        map: mapInstanceRef.current,
        center: geo.center,
        radius: (geo.radius || 30) * 1000,
      });

      markerRef.current = new google.maps.Marker({
        position: geo.center,
        map: mapInstanceRef.current,
        title: geo.center.address,
      });

      mapInstanceRef.current.setCenter(geo.center);
    } else if (geoType === 'region' && geo?.region?.bounds) {
      rectangleRef.current = new google.maps.Rectangle({
        strokeColor: '#78716C',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#78716C',
        fillOpacity: 0.2,
        map: mapInstanceRef.current,
        bounds: geo.region.bounds,
      });

      mapInstanceRef.current.fitBounds(geo.region.bounds);
    }
  };

  const handleTypeChange = (newType) => {
    setGeoType(newType);
    setZone(prev => ({
      ...prev,
      geography: {
        type: newType,
        center: null,
        radius: newType === 'radius' ? 30 : undefined,
        region: newType === 'region' ? null : undefined,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleRadiusChange = (value) => {
    setZone(prev => ({
      ...prev,
      geography: {
        ...prev.geography,
        radius: parseInt(value),
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSubmit = () => {
    if (!zone.geography?.center?.address) {
      alert('Veuillez sélectionner une zone de service');
      return;
    }

    // Créer le vehiclePricing basé sur le véhicule du wizard - STRUCTURE ALIGNÉE AVEC PAGE.JS
    const vehiclePricing = wizardData.vehicle ? [{
      vehicleId: wizardData.vehicle.id,
      vehicleName: wizardData.vehicle.name,
      useDefaultPricing: useDefaultPricing,
      pricing: useDefaultPricing ? {
        basePrice: wizardData.vehicle.pricing.minPrice,
        pricePerKm: wizardData.vehicle.pricing.perKm,
        minPrice: wizardData.vehicle.pricing.minPrice,
        kmThreshold: wizardData.vehicle.pricing.kmThreshold,
        pricePerMinute: 0,
      } : zone.customPricing || {
        basePrice: wizardData.vehicle.pricing.minPrice,
        pricePerKm: wizardData.vehicle.pricing.perKm,
        minPrice: wizardData.vehicle.pricing.minPrice,
        kmThreshold: wizardData.vehicle.pricing.kmThreshold,
        pricePerMinute: 0,
      },
      enabled: true,
    }] : [];

    const finalZone = {
      ...zone,
      vehiclePricing,
      updatedAt: new Date().toISOString(),
    };

    onNext({ zone: finalZone });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/30">
            <span className="text-4xl">🗺️</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          Définissez votre zone de service
        </h2>
        <p className="text-stone-600">
          Où proposez-vous vos services ?
        </p>
      </div>

      {/* Configuration géographique */}
      <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/10 p-6 mb-6 border border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-4">
          🌍 Configuration géographique
        </h3>

        {/* Type de zone */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            type="button"
            onClick={() => handleTypeChange('radius')}
            className={`group relative p-4 rounded-xl border-2 transition-all text-left overflow-hidden ${
              geoType === 'radius'
                ? 'border-amber-600 bg-amber-50 shadow-md'
                : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
            }`}
          >
            {geoType === 'radius' && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
            )}
            <div className="relative">
              <div className="text-2xl mb-2">📍</div>
              <div className="font-semibold text-stone-900">Rayon</div>
              <div className="text-xs text-stone-600">Autour d'un point central</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('region')}
            className={`group relative p-4 rounded-xl border-2 transition-all text-left overflow-hidden ${
              geoType === 'region'
                ? 'border-stone-600 bg-stone-50 shadow-md'
                : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
            }`}
          >
            {geoType === 'region' && (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-500/10 to-transparent"></div>
            )}
            <div className="relative">
              <div className="text-2xl mb-2">🏙️</div>
              <div className="font-semibold text-stone-900">Ville / Région</div>
              <div className="text-xs text-stone-600">Limites d'une ville ou région</div>
            </div>
          </button>
        </div>

        {/* Recherche */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            🔍 {geoType === 'radius' ? 'Rechercher un lieu (centre)' : 'Rechercher une ville ou région'}
          </label>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={geoType === 'radius'
              ? 'Ex: Courchevel, Aéroport CDG...'
              : 'Ex: Paris, Savoie, Île-de-France...'
            }
            className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
          />
        </div>

        {/* Slider rayon */}
        {geoType === 'radius' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              📏 Rayon de la zone
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="100"
                value={zone.geography?.radius || 30}
                onChange={(e) => handleRadiusChange(e.target.value)}
                className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="w-24 text-center">
                <span className="text-2xl font-bold text-amber-600">{zone.geography?.radius || 30}</span>
                <span className="text-sm text-stone-600 ml-1">km</span>
              </div>
            </div>
          </div>
        )}

        {/* Info zone sélectionnée */}
        {zone.geography?.center?.address && (
          <div className={`p-4 rounded-xl border-2 ${
            geoType === 'radius' ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-300'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{geoType === 'radius' ? '📍' : '🏙️'}</span>
              <div>
                <div className="font-semibold text-stone-900">
                  {geoType === 'radius' ? 'Point central' : 'Zone sélectionnée'}
                </div>
                <div className="text-sm text-stone-700">{zone.geography.center.address}</div>
                {geoType === 'radius' && (
                  <div className="text-xs text-amber-700 mt-1 font-medium">
                    → Zone de {zone.geography.radius || 30} km
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Carte */}
        {mapsLoaded ? (
          <div className="mt-4 border-2 border-stone-300 rounded-xl overflow-hidden">
            <div ref={mapRef} style={{ width: '100%', height: '350px' }} />
          </div>
        ) : (
          <div className="mt-4 h-[350px] bg-stone-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent border-t-amber-600 border-r-stone-700 mx-auto mb-2"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 border-2 border-amber-500 opacity-20"></div>
              </div>
              <p className="text-stone-600">Chargement de la carte...</p>
            </div>
          </div>
        )}
      </div>

      {/* Tarification pour cette zone - ALIGNÉ AVEC PAGE.JS */}
      <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/10 p-6 mb-6 border border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-4">
          💰 Tarification pour cette zone
        </h3>

        {wizardData.vehicle && (
          <div className="p-4 bg-stone-50 rounded-xl mb-4 border border-stone-200">
            <p className="text-sm text-stone-700">
              <strong>Véhicule :</strong> {wizardData.vehicle.icon} {wizardData.vehicle.name}
            </p>
            <p className="text-sm text-stone-700">
              <strong>Tarif configuré :</strong> {wizardData.vehicle.pricing.minPrice}€ min,
              ou {wizardData.vehicle.pricing.perKm}€/km au-delà de {wizardData.vehicle.pricing.kmThreshold} km
            </p>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
          <div>
            <p className="font-semibold text-stone-900">
              Utiliser le tarif de référence
            </p>
            <p className="text-sm text-stone-600">
              Le tarif configuré à l'étape précédente
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useDefaultPricing}
              onChange={(e) => setUseDefaultPricing(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-amber-600"></div>
            <span className="ml-3 text-sm font-bold text-stone-700">
              {useDefaultPricing ? 'OUI' : 'NON'}
            </span>
          </label>
        </div>

        {/* Tarification personnalisée */}
        {!useDefaultPricing && (
          <div className="mt-4 p-4 bg-stone-50 rounded-xl border-2 border-stone-300">
            <h4 className="font-bold text-stone-900 mb-3">⚙️ Tarification personnalisée pour cette zone</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Forfait min (€)</label>
                <input
                  type="number"
                  step="0.5"
                  value={zone.customPricing?.minPrice || wizardData.vehicle?.pricing?.minPrice || 15}
                  onChange={(e) => setZone(prev => ({
                    ...prev,
                    customPricing: { 
                      ...prev.customPricing, 
                      minPrice: parseFloat(e.target.value),
                      basePrice: parseFloat(e.target.value),
                    }
                  }))}
                  className="w-full px-3 py-2 border-2 border-stone-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Seuil km</label>
                <input
                  type="number"
                  value={zone.customPricing?.kmThreshold || wizardData.vehicle?.pricing?.kmThreshold || 5}
                  onChange={(e) => setZone(prev => ({
                    ...prev,
                    customPricing: { ...prev.customPricing, kmThreshold: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border-2 border-stone-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Prix/km (€)</label>
                <input
                  type="number"
                  step="0.1"
                  value={zone.customPricing?.pricePerKm || wizardData.vehicle?.pricing?.perKm || 1.8}
                  onChange={(e) => setZone(prev => ({
                    ...prev,
                    customPricing: { ...prev.customPricing, pricePerKm: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border-2 border-stone-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

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
          disabled={saving || !zone.geography?.center?.address}
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