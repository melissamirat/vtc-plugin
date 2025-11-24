import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function GeographySelector({ geography, mapsLoaded, onChange, error }) {
  const [geoType, setGeoType] = useState(geography?.type || 'radius');
  const [localGeo, setLocalGeo] = useState(geography || {
    type: 'radius',
    center: { lat: 48.8566, lng: 2.3522, address: 'Paris, France', placeId: '' },
    radius: 10
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const circleRef = useRef(null);
  const rectangleRef = useRef(null);
  const markerRef = useRef(null);

  // Synchroniser localGeo avec le parent à chaque modification
  useEffect(() => {
    onChange(localGeo);
  }, [localGeo]);

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
  }, [geoType, localGeo]);

  // Réinitialiser l'autocomplete quand le type change
  useEffect(() => {
    if (mapsLoaded && mapInstanceRef.current && searchInputRef.current) {
      initAutocomplete();
    }
  }, [geoType, mapsLoaded]);

  const initMap = () => {
    const center = localGeo.center || { lat: 48.8566, lng: 2.3522 };
    
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 10,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });

    initAutocomplete();
    updateMapDisplay();
  };

  const initAutocomplete = () => {
    // Supprimer l'ancien autocomplete s'il existe
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    if (!searchInputRef.current) return;

    // Vider le champ de recherche
    searchInputRef.current.value = '';

    // Configuration selon le type
    const options = geoType === 'radius' 
      ? {
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'geometry', 'place_id', 'name']
        }
      : {
          types: ['(regions)'],
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components']
        };

    autocompleteRef.current = new google.maps.places.Autocomplete(
      searchInputRef.current,
      options
    );

    autocompleteRef.current.addListener('place_changed', handlePlaceSelected);
  };

  const handlePlaceSelected = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (!place.geometry) {
      console.error('Pas de géométrie pour ce lieu');
      return;
    }

    const location = place.geometry.location;

    if (geoType === 'radius') {
      // Mode Rayon : utiliser le centre
      setLocalGeo(prev => ({
        ...prev,
        type: 'radius',
        center: {
          lat: location.lat(),
          lng: location.lng(),
          address: place.formatted_address || place.name,
          placeId: place.place_id
        }
      }));

      mapInstanceRef.current.setCenter(location);
      mapInstanceRef.current.setZoom(12);

    } else if (geoType === 'region') {
      // Mode Région : utiliser les bounds
      let bounds = null;
      
      if (place.geometry.viewport) {
        const viewport = place.geometry.viewport;
        bounds = {
          north: viewport.getNorthEast().lat(),
          south: viewport.getSouthWest().lat(),
          east: viewport.getNorthEast().lng(),
          west: viewport.getSouthWest().lng()
        };
      }

      setLocalGeo({
        type: 'region',
        center: {
          lat: location.lat(),
          lng: location.lng(),
          address: place.formatted_address || place.name,
          placeId: place.place_id
        },
        region: {
          name: place.name || place.formatted_address,
          address: place.formatted_address,
          placeId: place.place_id,
          bounds: bounds
        }
      });

      if (place.geometry.viewport) {
        mapInstanceRef.current.fitBounds(place.geometry.viewport);
      } else {
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(10);
      }
    }
  };

  const updateMapDisplay = () => {
    if (!mapInstanceRef.current) return;

    // Nettoyer les affichages précédents
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

    if (geoType === 'radius' && localGeo.center) {
      // Afficher le cercle
      circleRef.current = new google.maps.Circle({
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        map: mapInstanceRef.current,
        center: localGeo.center,
        radius: (localGeo.radius || 10) * 1000
      });

      markerRef.current = new google.maps.Marker({
        position: localGeo.center,
        map: mapInstanceRef.current,
        title: localGeo.center.address
      });

      mapInstanceRef.current.setCenter(localGeo.center);

    } else if (geoType === 'region' && localGeo.region?.bounds) {
      // Afficher le rectangle
      const bounds = localGeo.region.bounds;
      rectangleRef.current = new google.maps.Rectangle({
        strokeColor: '#8B5CF6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#8B5CF6',
        fillOpacity: 0.2,
        map: mapInstanceRef.current,
        bounds: bounds
      });

      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const handleTypeChange = (newType) => {
    if (newType === geoType) return;
    
    setGeoType(newType);
    
    if (newType === 'radius') {
      setLocalGeo({
        type: 'radius',
        center: { lat: 48.8566, lng: 2.3522, address: 'Paris, France', placeId: '' },
        radius: 10
      });
    } else {
      setLocalGeo({
        type: 'region',
        center: null,
        region: null
      });
    }
  };

  if (!mapsLoaded) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de Google Maps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Sélecteur de type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Type de zone géographique
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('radius')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              geoType === 'radius'
                ? 'border-blue-500 bg-blue-50'
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
            className={`p-4 rounded-lg border-2 transition-all text-left ${
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
      </div>

      {/* Barre de recherche */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {geoType === 'radius' ? '🔍 Rechercher un lieu (centre de la zone)' : '🔍 Rechercher une ville ou région'}
        </label>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={geoType === 'radius' 
            ? 'Ex: Courchevel, Aéroport CDG, Gare de Lyon...' 
            : 'Ex: Paris, Savoie, Île-de-France, Lyon...'
          }
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Commencez à taper puis sélectionnez dans la liste
        </p>
      </div>

      {/* Configuration spécifique Rayon */}
      {geoType === 'radius' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📏 Rayon de la zone
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                value={localGeo.radius || 10}
                onChange={(e) => setLocalGeo(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="w-20 text-center">
                <span className="text-2xl font-bold text-blue-600">{localGeo.radius || 10}</span>
                <span className="text-sm text-gray-600 ml-1">km</span>
              </div>
            </div>
          </div>

          {localGeo.center?.address && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="text-sm font-semibold text-blue-900">Point central</div>
                  <div className="text-sm text-blue-700 mt-1">{localGeo.center.address}</div>
                  <div className="text-xs text-blue-600 mt-2 font-medium">
                    → Zone de {localGeo.radius || 10} km autour de ce point
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Configuration spécifique Région */}
      {geoType === 'region' && (
        <div className="space-y-4">
          {localGeo.region?.name ? (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏙️</span>
                <div>
                  <div className="text-sm font-semibold text-purple-900">Zone sélectionnée</div>
                  <div className="text-sm text-purple-700 mt-1">{localGeo.region.name}</div>
                  {localGeo.region.address !== localGeo.region.name && (
                    <div className="text-xs text-purple-600 mt-1">{localGeo.region.address}</div>
                  )}
                  {localGeo.region.bounds ? (
                    <div className="text-xs text-green-600 mt-2 font-semibold">
                      ✓ Limites géographiques définies automatiquement
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 mt-2 font-semibold">
                      ⚠️ Limites non disponibles pour cette zone
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-sm">Recherchez une ville ou région ci-dessus</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Carte Google Maps */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
      </div>

      {error && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Message de confirmation */}
      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          <strong>✓</strong> Les modifications sont automatiquement prises en compte.
        </p>
      </div>
    </div>
  );
}