import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

export default function WizardStep2Zone({ wizardData, onNext, onBack, onSkip, saving }) {
  const [zone, setZone] = useState(wizardData.zone || {
    id: `zone-${Date.now()}`,
    name: 'Ma zone principale',
    enabled: true,
    geography: {
      type: 'radius',
      center: null,
      radius: 30,
    },
    useDefaultPricing: true,
    vehiclePricing: [],
  });

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [geoType, setGeoType] = useState(zone.geography?.type || 'radius');
  
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
            placeId: place.place_id,
          },
        },
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
            placeId: place.place_id,
          },
          region: {
            name: place.name || place.formatted_address,
            address: place.formatted_address,
            placeId: place.place_id,
            bounds,
          },
        },
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
        strokeColor: '#6366F1',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#6366F1',
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
        strokeColor: '#8B5CF6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#8B5CF6',
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
    }));
  };

  const handleRadiusChange = (value) => {
    setZone(prev => ({
      ...prev,
      geography: {
        ...prev.geography,
        radius: parseInt(value) || 30,
      },
    }));
  };

  const handleSubmit = () => {
    // Ajouter la tarification du véhicule configuré à l'étape 1
    const vehicleFromStep1 = wizardData.vehicle;
    let finalZone = { ...zone };

    if (vehicleFromStep1) {
      finalZone.vehiclePricing = [{
        vehicleId: vehicleFromStep1.id,
        vehicleName: vehicleFromStep1.name,
        useDefaultPricing: zone.useDefaultPricing,
        pricing: zone.useDefaultPricing ? null : {
          basePrice: zone.customPricing?.basePrice || vehicleFromStep1.pricing.minPrice,
          pricePerKm: zone.customPricing?.pricePerKm || vehicleFromStep1.pricing.perKm,
          minPrice: zone.customPricing?.minPrice || vehicleFromStep1.pricing.minPrice,
          kmThreshold: zone.customPricing?.kmThreshold || vehicleFromStep1.pricing.kmThreshold,
        },
        enabled: true,
      }];
    }

    onNext({ zone: finalZone });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Script Google Maps */}
      {!mapsLoaded && typeof window !== 'undefined' && !window.google && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry&loading=async`}
          strategy="lazyOnload"
          onLoad={() => setMapsLoaded(true)}
        />
      )}

      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl mb-4">
          <span className="text-4xl">🗺️</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Définissez votre zone de service
        </h2>
        <p className="text-gray-600">
          Où intervenez-vous principalement ?
        </p>
      </div>

      {/* Sélecteur de type */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Type de zone
        </label>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleTypeChange('radius')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              geoType === 'radius'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📍</div>
            <div className="font-semibold text-gray-900">Rayon</div>
            <div className="text-xs text-gray-600">Zone circulaire autour d'un point</div>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('region')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              geoType === 'region'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">🏙️</div>
            <div className="font-semibold text-gray-900">Ville / Région</div>
            <div className="text-xs text-gray-600">Limites d'une ville ou région</div>
          </button>
        </div>

        {/* Recherche */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔍 {geoType === 'radius' ? 'Rechercher un lieu (centre)' : 'Rechercher une ville ou région'}
          </label>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={geoType === 'radius'
              ? 'Ex: Courchevel, Aéroport CDG...'
              : 'Ex: Paris, Savoie, Île-de-France...'
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Slider rayon */}
        {geoType === 'radius' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📏 Rayon de la zone
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="100"
                value={zone.geography?.radius || 30}
                onChange={(e) => handleRadiusChange(e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="w-24 text-center">
                <span className="text-2xl font-bold text-indigo-600">{zone.geography?.radius || 30}</span>
                <span className="text-sm text-gray-600 ml-1">km</span>
              </div>
            </div>
          </div>
        )}

        {/* Info zone sélectionnée */}
        {zone.geography?.center?.address && (
          <div className={`p-4 rounded-xl border-2 ${
            geoType === 'radius' ? 'bg-indigo-50 border-indigo-200' : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{geoType === 'radius' ? '📍' : '🏙️'}</span>
              <div>
                <div className="font-semibold text-gray-900">
                  {geoType === 'radius' ? 'Point central' : 'Zone sélectionnée'}
                </div>
                <div className="text-sm text-gray-700">{zone.geography.center.address}</div>
                {geoType === 'radius' && (
                  <div className="text-xs text-indigo-600 mt-1 font-medium">
                    → Zone de {zone.geography.radius || 30} km
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Carte */}
        {mapsLoaded ? (
          <div className="mt-4 border-2 border-gray-300 rounded-xl overflow-hidden">
            <div ref={mapRef} style={{ width: '100%', height: '350px' }} />
          </div>
        ) : (
          <div className="mt-4 h-[350px] bg-gray-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        )}
      </div>

      {/* Héritage de prix */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          💰 Tarification pour cette zone
        </h3>

        {wizardData.vehicle && (
          <div className="p-4 bg-gray-50 rounded-xl mb-4">
            <p className="text-sm text-gray-700">
              <strong>Véhicule :</strong> {wizardData.vehicle.icon} {wizardData.vehicle.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Tarif configuré :</strong> {wizardData.vehicle.pricing.minPrice}€ min,
              puis {wizardData.vehicle.pricing.perKm}€/km au-delà de {wizardData.vehicle.pricing.kmThreshold} km
            </p>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200">
          <div>
            <p className="font-semibold text-gray-900">
              Appliquer mon Tarif de Référence ?
            </p>
            <p className="text-sm text-gray-600">
              Le tarif configuré à l'étape précédente
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={zone.useDefaultPricing}
              onChange={(e) => setZone(prev => ({ ...prev, useDefaultPricing: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-bold text-gray-700">
              {zone.useDefaultPricing ? 'OUI' : 'NON'}
            </span>
          </label>
        </div>

        {/* Tarification personnalisée */}
        {!zone.useDefaultPricing && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
            <h4 className="font-bold text-amber-900 mb-3">⚙️ Tarification personnalisée pour cette zone</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Forfait min (€)</label>
                <input
                  type="number"
                  step="0.5"
                  value={zone.customPricing?.minPrice || wizardData.vehicle?.pricing?.minPrice || 15}
                  onChange={(e) => setZone(prev => ({
                    ...prev,
                    customPricing: { ...prev.customPricing, minPrice: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Seuil km</label>
                <input
                  type="number"
                  value={zone.customPricing?.kmThreshold || wizardData.vehicle?.pricing?.kmThreshold || 5}
                  onChange={(e) => setZone(prev => ({
                    ...prev,
                    customPricing: { ...prev.customPricing, kmThreshold: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Prix/km (€)</label>
                <input
                  type="number"
                  step="0.1"
                  value={zone.customPricing?.pricePerKm || wizardData.vehicle?.pricing?.perKm || 1.8}
                  onChange={(e) => setZone(prev => ({
                    ...prev,
                    customPricing: { ...prev.customPricing, pricePerKm: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg text-center font-bold"
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
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Passer cette étape
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  );
}