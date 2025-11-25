import { useState } from 'react';

/**
 * Hook pour la recherche d'adresses avec Google Places API
 */
export function useAddressSearch() {
  const [suggestions, setSuggestions] = useState({ depart: [], arrivee: [] });
  const [coordsDepart, setCoordsDepart] = useState(null);
  const [coordsArrivee, setCoordsArrivee] = useState(null);

  const rechercherAdresse = async (query, type) => {
    if (query.length < 3) {
      setSuggestions((prev) => ({ ...prev, [type]: [] }));
      return;
    }

    try {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Erreur Google API:", data.status);
        return;
      }

      const predictions = data.predictions || [];

      const allResults = await Promise.all(
        predictions.slice(0, 8).map(async (prediction) => {
          try {
            const detailsResponse = await fetch(
              `/api/places/details?place_id=${encodeURIComponent(
                prediction.place_id
              )}`
            );

            const detailsData = await detailsResponse.json();

            if (detailsData.status === "OK") {
              const place = detailsData.result;
              const location = place.geometry?.location;

              let city = "";
              let postcode = "";
              let streetNumber = "";
              let route = "";

              place.address_components?.forEach((component) => {
                if (component.types.includes("locality")) {
                  city = component.long_name;
                }
                if (component.types.includes("postal_code")) {
                  postcode = component.short_name;
                }
                if (component.types.includes("street_number")) {
                  streetNumber = component.long_name;
                }
                if (component.types.includes("route")) {
                  route = component.long_name;
                }
              });

              let fullAddress = prediction.description;

              if (postcode && !prediction.description.includes(postcode)) {
                if (streetNumber && route) {
                  fullAddress = `${streetNumber} ${route}, ${postcode} ${city}, France`;
                } else {
                  const mainName = prediction.description.split(",")[0];
                  fullAddress = `${mainName}, ${postcode} ${city}, France`;
                }
              }

              let icon = "📍";
              const types = place.types || [];
              if (
                types.includes("train_station") ||
                types.includes("transit_station")
              ) {
                icon = "🚂";
              } else if (types.includes("airport")) {
                icon = "✈️";
              }

              return {
                properties: {
                  label: fullAddress,
                  city: city,
                  postcode: postcode,
                  type: types[0] || "address",
                },
                geometry: {
                  coordinates: [location.lng, location.lat],
                },
                icon: icon,
                source: "google",
              };
            }
          } catch (err) {
            console.error("Erreur détails:", err);
          }
          return null;
        })
      );

      const validResults = allResults.filter((r) => r !== null);
      setSuggestions((prev) => ({ ...prev, [type]: validResults }));
    } catch (error) {
      console.error("Erreur recherche adresse:", error);
    }
  };

  const selectionnerAdresse = (feature, type) => {
    const coords = feature.geometry.coordinates;
    if (type === "depart") {
      setCoordsDepart(coords);
    } else {
      setCoordsArrivee(coords);
    }
    setSuggestions((prev) => ({ ...prev, [type]: [] }));
  };

  const clearSuggestions = (type) => {
    setSuggestions((prev) => ({ ...prev, [type]: [] }));
  };

  return {
    suggestions,
    coordsDepart,
    coordsArrivee,
    rechercherAdresse,
    selectionnerAdresse,
    clearSuggestions,
    setCoordsDepart,
    setCoordsArrivee,
  };
}