"use client";

import React, { useState, useEffect } from "react";
import {
  createBooking,
  validatePromoCode,
  usePromoCode,
} from "@/lib/firestore";
import { calculatePrice } from "@/utils/priceCalculator";

function ConfirmationPopup({ isOpen, onClose, message, isSuccess }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4">
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
          )}
        </div>

        <h2
          className={`text-xl sm:text-2xl font-bold text-center mb-3 ${
            isSuccess ? "text-green-700" : "text-red-700"
          }`}
        >
          {isSuccess ? "Reservation Confirmee !" : "Erreur"}
        </h2>

        <p className="text-gray-700 text-center mb-6 text-sm sm:text-base">
          {message}
        </p>

        <button
          onClick={onClose}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            isSuccess
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
// Composant à ajouter dans ReservationForm.js AVANT export default

function LuggageSelector({ 
  selectedVehicle, 
  luggage, 
  onLuggageChange 
}) {
  if (!selectedVehicle) return null;

  // Extraire la config bagages (nouveau format ou ancien)
  const luggageConfig = selectedVehicle.luggage || {
    included: selectedVehicle.maxLuggage || 2,
    max: (selectedVehicle.maxLuggage || 2) * 2,
    pricePerExtra: selectedVehicle.pricing?.extraLuggagePrice || 5
  };

  const { included, max, pricePerExtra } = luggageConfig;
  const paidCount = Math.max(0, Math.min(luggage, max) - included);
  const paidCost = paidCount * pricePerExtra;
  const exceedsMax = luggage > max;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 p-4 sm:p-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧳</span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Bagages
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {included} gratuits • {max} max • {pricePerExtra}€/supplément
            </p>
          </div>
        </div>
      </div>

      {/* Sélecteur */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        <button
          type="button"
          onClick={() => onLuggageChange(Math.max(0, luggage - 1))}
          disabled={luggage <= 0}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border-2 border-orange-300 text-orange-600 font-bold text-xl hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 flex items-center justify-center"
        >
          −
        </button>
        
        <div className="flex-1">
          <input
            type="number"
            min="0"
            max={max}
            value={luggage}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              onLuggageChange(Math.max(0, val));
            }}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-orange-300 rounded-xl text-center text-xl sm:text-2xl font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
          <p className="text-xs text-center text-gray-500 mt-1 font-medium">
            {luggage === 0 ? 'Aucun bagage' : luggage === 1 ? '1 bagage' : `${luggage} bagages`}
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => onLuggageChange(luggage + 1)}
          disabled={exceedsMax}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border-2 border-orange-300 text-orange-600 font-bold text-xl hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Message contextuel */}
      <div>
        {exceedsMax ? (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">❌</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-red-900 mb-1">
                  Capacité dépassée !
                </p>
                <p className="text-xs text-red-800">
                  Ce véhicule ({selectedVehicle.name}) ne peut transporter que <strong>{max} bagages maximum</strong>.
                  Veuillez choisir un véhicule plus grand ou réduire le nombre de bagages.
                </p>
              </div>
            </div>
          </div>
        ) : paidCount > 0 ? (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">💰</span>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-bold text-orange-900 mb-1">
                  Supplément bagages
                </p>
                <p className="text-xs sm:text-sm text-orange-800">
                  <strong>{paidCount} bagage{paidCount > 1 ? 's' : ''} payant{paidCount > 1 ? 's' : ''}</strong> ({paidCount} × {pricePerExtra}€) = <strong className="text-orange-900">{paidCost.toFixed(2)}€</strong>
                </p>
              </div>
            </div>
          </div>
        ) : luggage > 0 && luggage <= included ? (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <p className="text-xs sm:text-sm font-bold text-green-800">
                {luggage} bagage{luggage > 1 ? 's' : ''} inclus gratuitement !
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              Sélectionnez le nombre de bagages que vous transportez
            </p>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="mt-3 pt-3 border-t-2 border-orange-200">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-bold text-green-700">0-{included}</div>
            <div className="text-gray-600">GRATUIT</div>
          </div>
          <div>
            <div className="font-bold text-orange-700">{included + 1}-{max}</div>
            <div className="text-gray-600">{pricePerExtra}€/bagage</div>
          </div>
          <div>
            <div className="font-bold text-red-700">{max}+</div>
            <div className="text-gray-600">IMPOSSIBLE</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReservationForm({ config, widgetId, userId }) {
  // Configuration avec fallbacks
  const VEHICLES = config?.vehicleCategories || [];
  const TARIFS = config?.pricing || { baseFee: 10.0 };
  const SURCHARGES = config?.timeSurcharges || [];
  const ZONES = config?.serviceZones || [];
  const VACATION = config?.vacationMode || { enabled: false };
  const PAYMENT_MODES = config?.paymentModes || {
    driver: {
      enabled: true,
      label: "Paiement au chauffeur",
      methods: ["card", "cash"],
    },
  };

  const TEXTS = config?.texts || {
    formTitle: "Reservation VTC",
    formSubtitle: "Calculez votre prix et reservez en quelques clics",
    submitButton: "Reserver & Confirmer le Prix",
  };

  const BRANDING = config?.branding || {
    companyName: "VTC Premium",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#3b82f6",
  };

  // Vérifier si le service est actif
  if (VACATION.enabled) {
    const endDate = VACATION.endDate
      ? new Date(VACATION.endDate).toLocaleDateString("fr-FR")
      : "";
    const message = VACATION.message.replace("{date}", endDate);

    return (
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto">
          <div
            className="text-center mb-6 pb-6 border-b-4"
            style={{ borderBottomColor: BRANDING.primaryColor }}
          >
            <h1
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: BRANDING.primaryColor }}
            >
              {BRANDING.companyName}
            </h1>
          </div>

          <div className="p-6 sm:p-8 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏖️</div>
              <div>
                <h4 className="text-xl font-bold text-orange-900 mb-2">
                  Service temporairement indisponible
                </h4>
                <p className="text-orange-800 leading-relaxed">{message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filtrer les véhicules actifs
  const activeVehicles = VEHICLES.filter((v) => v.enabled);

  if (activeVehicles.length === 0) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto text-center">
          <p className="text-red-600 font-semibold">
            Service temporairement indisponible. Veuillez reessayer plus tard.
          </p>
        </div>
      </div>
    );
  }

  const initialFormData = {
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    typeVehicule: activeVehicles[0]?.id || "berline",
    adresseDepart: "",
    adresseArrivee: "",
    dateReservation: "",
    heureReservation: "",
    nombrePassagers: "1",
    bagagesExtra: 0,
    commentaires: "",
    promoCode: "",
    paymentMethod: (() => {
      if (PAYMENT_MODES.online?.enabled) return "online";
      if (PAYMENT_MODES.driver?.enabled) return "driver";
      return "driver";
    })(),
  };

  const [formData, setFormData] = useState(initialFormData);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupSuccess, setPopupSuccess] = useState(false);

  const [coordsDepart, setCoordsDepart] = useState(null);
  const [coordsArrivee, setCoordsArrivee] = useState(null);
  const [suggestions, setSuggestions] = useState({ depart: [], arrivee: [] });

  const [distanceKm, setDistanceKm] = useState(0);
  const [prixEstime, setPrixEstime] = useState(
    TARIFS.baseFee?.toFixed(2) || "10.00"
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);

  const isRoutingReady = !!coordsDepart && !!coordsArrivee;

  // Calculer les majorations
  // Calculer les majorations
  const calculateSurcharges = (date, time) => {
    let totalSurcharge = 0;

    if (!SURCHARGES || SURCHARGES.length === 0) {
      console.log("⚠️ Pas de majorations configurées");
      return 0;
    }

    if (!date || !time) {
      console.log("⚠️ Date ou heure manquante");
      return 0;
    }

    try {
      const dateObj = new Date(`${date}T${time}`);
      const hour = dateObj.getHours();
      const day = dateObj.getDay();

      console.log("📅 Calcul majorations pour:", {
        date,
        time,
        hour,
        day,
        dayName: [
          "Dimanche",
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
        ][day],
      });

      console.log("📋 Majorations disponibles:", SURCHARGES);

      const enabledSurcharges = SURCHARGES.filter((s) => s.enabled);
      console.log("✅ Majorations actives:", enabledSurcharges);

      enabledSurcharges.forEach((surcharge, index) => {
        console.log(`\n🔍 Test majoration #${index + 1}: "${surcharge.name}"`);
        console.log("Type:", surcharge.type);
        console.log("Montant:", surcharge.amount);

        if (surcharge.type === "hourly") {
          const startHour = parseInt(surcharge.startHour);
          const endHour = parseInt(surcharge.endHour);

          console.log(`  ⏰ Plage horaire: ${startHour}h - ${endHour}h`);
          console.log(`  ⏰ Heure actuelle: ${hour}h`);

          let applies = false;

          if (startHour > endHour) {
            // Traverse minuit (ex: 22h-6h)
            if (hour >= startHour || hour < endHour) {
              applies = true;
            }
            console.log(`  🌙 Plage traverse minuit: ${applies}`);
          } else {
            // Plage normale (ex: 7h-9h)
            if (hour >= startHour && hour < endHour) {
              applies = true;
            }
            console.log(`  ☀️ Plage normale: ${applies}`);
          }

          if (applies) {
            console.log(`  ✅ MAJORATION APPLIQUÉE: +${surcharge.amount}€`);
            totalSurcharge += parseFloat(surcharge.amount);
          } else {
            console.log(`  ❌ Majoration non applicable`);
          }
        } else if (surcharge.type === "weekly") {
          console.log(`  📆 Jours configurés:`, surcharge.days);
          console.log(`  📆 Jour actuel:`, day);

          if (surcharge.days && Array.isArray(surcharge.days)) {
            const applies = surcharge.days.includes(day);
            console.log(`  Jour correspond: ${applies}`);

            if (applies) {
              console.log(`  ✅ MAJORATION APPLIQUÉE: +${surcharge.amount}€`);
              totalSurcharge += parseFloat(surcharge.amount);
            } else {
              console.log(`  ❌ Majoration non applicable`);
            }
          } else {
            console.log(`  ⚠️ Pas de jours configurés ou format invalide`);
          }
        }
      });

      console.log(`\n💰 TOTAL MAJORATIONS: ${totalSurcharge}€`);
    } catch (error) {
      console.error("❌ Erreur calcul majorations:", error);
    }

    return totalSurcharge;
  };

  const rechercherAdresse = async (query, type) => {
    if (query.length < 3) {
      setSuggestions((prev) => ({ ...prev, [type]: [] }));
      return;
    }

    try {
      // Appeler la route API Next.js
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(query)}`
      );
      
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Erreur Google API:', data.status);
        return;
      }

      const predictions = data.predictions || [];

      // Récupérer les détails de chaque prédiction
      const allResults = await Promise.all(
        predictions.slice(0, 8).map(async (prediction) => {
          try {
            const detailsResponse = await fetch(
              `/api/places/details?place_id=${encodeURIComponent(prediction.place_id)}`
            );
            
            const detailsData = await detailsResponse.json();
            
            if (detailsData.status === 'OK') {
              const place = detailsData.result;
              const location = place.geometry?.location;
              
              // Extraire ville et code postal
              let city = '';
              let postcode = '';
              let streetNumber = '';
              let route = '';
              
              place.address_components?.forEach(component => {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                }
                if (component.types.includes('postal_code')) {
                  postcode = component.short_name;
                }
                if (component.types.includes('street_number')) {
                  streetNumber = component.long_name;
                }
                if (component.types.includes('route')) {
                  route = component.long_name;
                }
              });
              
              // Construire l'adresse complète avec code postal
              let fullAddress = prediction.description;
              
              // Si on a un code postal et qu'il n'est pas dans la description, on le rajoute
              if (postcode && !prediction.description.includes(postcode)) {
                // Pour une adresse de rue
                if (streetNumber && route) {
                  fullAddress = `${streetNumber} ${route}, ${postcode} ${city}, France`;
                } 
                // Pour un lieu (gare, aéroport, etc.)
                else {
                  const mainName = prediction.description.split(',')[0];
                  fullAddress = `${mainName}, ${postcode} ${city}, France`;
                }
              }
              
              // Déterminer l'icône
              let icon = '📍';
              const types = place.types || [];
              if (types.includes('train_station') || types.includes('transit_station')) {
                icon = '🚂';
              } else if (types.includes('airport')) {
                icon = '✈️';
              }
              
              // IMPORTANT : Utiliser l'adresse complète avec code postal
              return {
                properties: {
                  label: fullAddress, // ← Adresse avec code postal
                  city: city,
                  postcode: postcode,
                  type: types[0] || 'address'
                },
                geometry: {
                  coordinates: [location.lng, location.lat]
                },
                icon: icon,
                source: 'google'
              };
            }
          } catch (err) {
            console.error('Erreur détails:', err);
          }
          return null;
        })
      );

      const validResults = allResults.filter(r => r !== null);
      setSuggestions((prev) => ({ ...prev, [type]: validResults }));
    } catch (error) {
      console.error("Erreur recherche adresse:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "bagagesExtra" ? Math.max(0, parseInt(value, 10) || 0) : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (name === "adresseDepart") {
      setCoordsDepart(null);
      rechercherAdresse(value, "depart");
    } else if (name === "adresseArrivee") {
      setCoordsArrivee(null);
      rechercherAdresse(value, "arrivee");
    }
  };

  const selectionnerAdresse = (feature, type) => {
    const label = feature.properties.label;

    // Supprimez cette partie:
    // if (!isAddressInServiceZone(label)) {
    //   alert('Desole...');
    //   return;
    // }

    setFormData((prev) => ({
      ...prev,
      [type === "depart" ? "adresseDepart" : "adresseArrivee"]: label,
    }));

    const coords = feature.geometry.coordinates;
    if (type === "depart") {
      setCoordsDepart(coords);
    } else {
      setCoordsArrivee(coords);
    }

    setSuggestions((prev) => ({ ...prev, [type]: [] }));
  };

  useEffect(() => {
    if (isRoutingReady) {
      calculerPrix();
    }
  }, [
    coordsDepart,
    coordsArrivee,
    formData.typeVehicule,
    formData.dateReservation,
    formData.heureReservation,
    formData.bagagesExtra,
    appliedPromo,
  ]);

  const calculerPrix = async () => {
    if (!coordsDepart || !coordsArrivee) return;

    setIsCalculating(true);

    try {
      // Utiliser Google Distance Matrix API via notre route Next.js
      const response = await fetch(
        `/api/distance?` + new URLSearchParams({
          origin: `${coordsDepart[1]},${coordsDepart[0]}`,
          destination: `${coordsArrivee[1]},${coordsArrivee[0]}`
        })
      );
      
      const result = await response.json();

      if (result.status === 'OK' && result.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const element = result.rows[0].elements[0];
        const distanceMeters = element.distance.value;
        const km = Math.round(distanceMeters / 1000);
        setDistanceKm(km);

        // Trouver la config du véhicule sélectionné
        const vehicle = activeVehicles.find(
          (v) => v.id === formData.typeVehicule
        );
        if (!vehicle) return;

        const priceBreakdown = calculatePrice({
          distanceKm: km,
          vehicleConfig: vehicle,
          date: formData.dateReservation,
          time: formData.heureReservation,
          extraLuggage: formData.bagagesExtra,
          luggagePrice: TARIFS.supplements?.extraLuggage || 0,
          departureAddress: formData.adresseDepart,
          arrivalAddress: formData.adresseArrivee,
          departureCoords: { lat: coordsDepart[1], lon: coordsDepart[0] },
          arrivalCoords: { lat: coordsArrivee[1], lon: coordsArrivee[0] },
          surcharges: SURCHARGES,
          packages: config?.packages || [],
        });

        console.log("📊 Détail du calcul:", priceBreakdown);

        // Stocker les détails pour l'affichage
        setPriceBreakdown(priceBreakdown);

        let finalPrice = priceBreakdown.total;

        // Appliquer le code promo si présent
        if (appliedPromo) {
          if (appliedPromo.type === "percentage") {
            finalPrice = finalPrice * (1 - appliedPromo.value / 100);
          } else if (appliedPromo.type === "fixed") {
            finalPrice = Math.max(0, finalPrice - appliedPromo.value);
          }
        }

        setPrixEstime(finalPrice.toFixed(2));
      }
    } catch (error) {
      console.error("Erreur calcul:", error);
    }

    setIsCalculating(false);
  };

  const handleApplyPromo = async () => {
    if (!formData.promoCode.trim()) return;

    setCheckingPromo(true);
    setPromoError("");

    const result = await validatePromoCode(formData.promoCode, userId);

    if (result.success) {
      if (result.data.minAmount > parseFloat(prixEstime)) {
        setPromoError(`Montant minimum requis: ${result.data.minAmount} euros`);
      } else {
        setAppliedPromo(result.data);
        setPromoError("");
      }
    } else {
      setPromoError(result.error);
    }

    setCheckingPromo(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Vérification de la capacité passagers
  const selectedVehicle = activeVehicles.find(v => v.id === formData.typeVehicule);
  const maxPassengers = selectedVehicle?.maxPassengers || 4;
  const currentPassengers = parseInt(formData.nombrePassagers);
  
  if (currentPassengers > maxPassengers) {
    setPopupMessage(`Le véhicule ${selectedVehicle?.name} accepte maximum ${maxPassengers} passagers. Veuillez réduire le nombre de passagers ou choisir un véhicule plus grand.`);
    setPopupSuccess(false);
    setShowPopup(true);
    return;
  }
  
  // Vérification de la capacité bagages
  const luggageConfig = selectedVehicle?.luggage || { max: 4 };
  if (formData.bagagesExtra > luggageConfig.max) {
    setPopupMessage(`Le véhicule ${selectedVehicle?.name} accepte maximum ${luggageConfig.max} bagages. Veuillez réduire le nombre de bagages ou choisir un véhicule plus grand.`);
    setPopupSuccess(false);
    setShowPopup(true);
    return;
  }
  
  // Vérification zone de service (si erreur dans le calcul de prix)
  if (priceBreakdown?.error) {
    setPopupMessage(priceBreakdown.error);
    setPopupSuccess(false);
    setShowPopup(true);
    return;
  }
  
  setIsSubmitting(true);

  try {
    const bookingData = {
      widgetId: widgetId,
      userId: userId,
      customer: {
        name: `${formData.prenom} ${formData.nom}`,
        email: formData.email,
        phone: formData.telephone,
      },
      trip: {
        departure: formData.adresseDepart,
        arrival: formData.adresseArrivee,
        date: formData.dateReservation,
        time: formData.heureReservation,
      },
      details: {
        vehicleType: formData.typeVehicule,
        passengers: parseInt(formData.nombrePassagers),
        luggage: parseInt(formData.bagagesExtra),
        comments: formData.commentaires,
      },
      pricing: {
        distanceKm: distanceKm,
        priceEstimate: parseFloat(prixEstime),
        promoCode: appliedPromo ? appliedPromo.code : null,
        discount: appliedPromo
          ? appliedPromo.type === "percentage"
            ? `${appliedPromo.value}%`
            : `${appliedPromo.value} euros`
          : null,
      },
      payment: {
        method: formData.paymentMethod,
      },
    };

    const result = await createBooking(bookingData);

    if (result.success) {
      if (appliedPromo) {
        await usePromoCode(appliedPromo.id);
      }

      // ✅ NOUVEAU : Envoyer le bon de commande PDF par email
      try {
        const emailResponse = await fetch("/api/send-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking: {
              id: result.bookingId,
              customer: bookingData.customer,
              departure: { address: bookingData.trip.departure },
              arrival: { address: bookingData.trip.arrival },
              departureAddress: bookingData.trip.departure,
              arrivalAddress: bookingData.trip.arrival,
              date: bookingData.trip.date,
              time: bookingData.trip.time,
              passengers: bookingData.details.passengers,
              luggage: bookingData.details.luggage,
              vehicle: selectedVehicle,
              distance: distanceKm,
              pricing: {
                priceEstimate: parseFloat(prixEstime),
                basePrice: priceBreakdown?.base || 0,
                distancePrice: priceBreakdown?.distance || 0,
                timeSurcharge: priceBreakdown?.timeSurcharge || 0,
                luggageSurcharge: priceBreakdown?.luggageSurcharge || 0,
                discount: priceBreakdown?.discount || 0,
              },
              paymentMethod: formData.paymentMethod === 'driver' ? 'Paiement au chauffeur' : 'Paiement en ligne',
              comments: bookingData.details.comments,
            },
            config: config,
            adminEmail: config?.email?.adminEmail,
          }),
        });
        
        const emailResult = await emailResponse.json();
        if (emailResult.success) {
          console.log("✅ Bon de commande envoyé par email");
        } else {
          console.error("⚠️ Erreur envoi email:", emailResult.error);
        }
      } catch (emailError) {
        console.error("⚠️ Erreur envoi email:", emailError);
      }

      setPopupMessage(
        `Réservation confirmée pour le ${formData.dateReservation} (${prixEstime} €). Vous recevrez une confirmation par email avec votre bon de commande.`
      );
      setPopupSuccess(true);
      setShowPopup(true);

      setFormData(initialFormData);
      setCoordsDepart(null);
      setCoordsArrivee(null);
      setDistanceKm(0);
      setAppliedPromo(null);
      setPrixEstime(TARIFS.baseFee?.toFixed(2) || "10.00");
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Erreur soumission:", error);
    setPopupMessage("Une erreur est survenue. Veuillez réessayer.");
    setPopupSuccess(false);
    setShowPopup(true);
  }

  setIsSubmitting(false);
};


  const inputClassName =
    "w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-md text-gray-900 text-base placeholder-gray-400 focus:ring-2 focus:border-transparent transition bg-white";
  const labelClassName =
    "block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2";

  return (
    <>
      <ConfirmationPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        message={popupMessage}
        isSuccess={popupSuccess}
      />

      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto"
        >
          <div
            className="text-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-4"
            style={{ borderBottomColor: BRANDING.primaryColor }}
          >
            <h1
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: BRANDING.primaryColor }}
            >
              {BRANDING.companyName}
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {TEXTS.formTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {TEXTS.formSubtitle}
            </p>
          </div>

          <fieldset
            className="mb-6 p-3 sm:p-4 border-2 rounded-lg"
            style={{ borderColor: BRANDING.accentColor }}
          >
            <legend
              className="px-2 text-base sm:text-lg font-semibold"
              style={{ color: BRANDING.primaryColor }}
            >
              Vos informations
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div>
                <label className={labelClassName}>Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  placeholder="Dupont"
                />
              </div>
              <div>
                <label className={labelClassName}>Prenom *</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  placeholder="Jean"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div>
                <label className={labelClassName}>Telephone *</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <label className={labelClassName}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="email@exemple.com"
                />
              </div>
            </div>
          </fieldset>

          <fieldset
            className="mb-6 p-3 sm:p-4 border-2 rounded-lg"
            style={{ borderColor: BRANDING.accentColor }}
          >
            <legend
              className="px-2 text-base sm:text-lg font-semibold"
              style={{ color: BRANDING.primaryColor }}
            >
              Details du trajet
            </legend>

            <div className="mb-3 sm:mb-4 mt-3 sm:mt-4 relative">
              <label className={labelClassName}>Adresse de depart *</label>
              <input
                type="text"
                name="adresseDepart"
                value={formData.adresseDepart}
                onChange={handleChange}
                required
                placeholder="Tapez votre adresse..."
                className={`${inputClassName} ${
                  coordsDepart ? "border-green-500 bg-green-50" : ""
                }`}
              />
              {suggestions.depart.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                  {suggestions.depart.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectionnerAdresse(suggestion, "depart")}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer border-b text-sm sm:text-base flex items-start gap-2"
                    >
                      <span className="text-lg flex-shrink-0">{suggestion.icon || '📍'}</span>
                      <div className="flex-1">
                        <div>{suggestion.properties.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {coordsDepart && !suggestions.depart.length && (
                <p className="text-xs sm:text-sm text-green-600 mt-1 font-medium">
                  ✅ Adresse validee
                </p>
              )}
            </div>

            <div className="mb-3 sm:mb-4 relative">
              <label className={labelClassName}>Adresse d arrivee *</label>
              <input
                type="text"
                name="adresseArrivee"
                value={formData.adresseArrivee}
                onChange={handleChange}
                required
                placeholder="Tapez votre destination..."
                className={`${inputClassName} ${
                  coordsArrivee ? "border-green-500 bg-green-50" : ""
                }`}
              />
              {suggestions.arrivee.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                  {suggestions.arrivee.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectionnerAdresse(suggestion, "arrivee")}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer border-b text-sm sm:text-base flex items-start gap-2"
                    >
                      <span className="text-lg flex-shrink-0">{suggestion.icon || '📍'}</span>
                      <div className="flex-1">
                        <div>{suggestion.properties.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {coordsArrivee && !suggestions.arrivee.length && (
                <p className="text-xs sm:text-sm text-green-600 mt-1 font-medium">
                  ✅ Adresse validee
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className={labelClassName}>Date *</label>
                <input
                  type="date"
                  name="dateReservation"
                  value={formData.dateReservation}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>Heure *</label>
                <input
                  type="time"
                  name="heureReservation"
                  value={formData.heureReservation}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className={labelClassName}>Type de vehicule *</label>
                <select
                  name="typeVehicule"
                  value={formData.typeVehicule}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  {activeVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.icon} {vehicle.name} ({vehicle.maxPassengers || 4} pers. max)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClassName}>Nombre de passagers *</label>
                <select
                  name="nombrePassagers"
                  value={formData.nombrePassagers}
                  onChange={handleChange}
                  className={`${inputClassName} ${
                    parseInt(formData.nombrePassagers) > (activeVehicles.find(v => v.id === formData.typeVehicule)?.maxPassengers || 4)
                      ? 'border-red-500 bg-red-50'
                      : ''
                  }`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} passager{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                
                {/* Message d'erreur si trop de passagers */}
                {(() => {
                  const selectedVehicle = activeVehicles.find(v => v.id === formData.typeVehicule);
                  const maxPassengers = selectedVehicle?.maxPassengers || 4;
                  const currentPassengers = parseInt(formData.nombrePassagers);
                  
                  if (currentPassengers > maxPassengers) {
                    return (
                      <div className="mt-2 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">⚠️</span>
                          <div>
                            <p className="text-sm font-bold text-red-800">
                              Capacité dépassée !
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                              Le véhicule <strong>{selectedVehicle?.name}</strong> accepte maximum <strong>{maxPassengers} passagers</strong>.
                              Veuillez réduire le nombre de passagers ou choisir un véhicule plus grand.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </fieldset>

          <fieldset
            className="mb-6 p-3 sm:p-4 border-2 rounded-lg"
            style={{ borderColor: BRANDING.accentColor }}
          >
            <legend
              className="px-2 text-base sm:text-lg font-semibold"
              style={{ color: BRANDING.primaryColor }}
            >
              Options
            </legend>

           <div className="mt-3 sm:mt-4">
  <LuggageSelector
    selectedVehicle={activeVehicles.find(v => v.id === formData.typeVehicule)}
    luggage={formData.bagagesExtra}
    onLuggageChange={(value) => setFormData({ ...formData, bagagesExtra: value })}
    primaryColor={BRANDING.primaryColor}
  />
</div>

            <div className="mt-3 sm:mt-4">
              <label className={labelClassName}>Commentaires</label>
              <textarea
                name="commentaires"
                value={formData.commentaires}
                onChange={handleChange}
                rows="3"
                placeholder="Siege bebe, stop supplementaire, etc..."
                className={inputClassName}
              />
            </div>

            <div className="mt-3 sm:mt-4">
              <label className={labelClassName}>Code promo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="promoCode"
                  value={formData.promoCode}
                  onChange={handleChange}
                  placeholder="BIENVENUE10"
                  className={`${inputClassName} flex-1 uppercase`}
                  disabled={!!appliedPromo}
                />
                {!appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={checkingPromo || !formData.promoCode.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 whitespace-nowrap"
                  >
                    {checkingPromo ? "Verif..." : "Appliquer"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      setFormData({ ...formData, promoCode: "" });
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  >
                    Retirer
                  </button>
                )}
              </div>
              {promoError && (
                <p className="text-xs text-red-600 mt-1">{promoError}</p>
              )}
              {appliedPromo && (
                <p className="text-xs text-green-600 mt-1 font-semibold">
                  ✅ Code applique:{" "}
                  {appliedPromo.type === "percentage"
                    ? `-${appliedPromo.value}%`
                    : `-${appliedPromo.value} euros`}
                </p>
              )}
            </div>

            {(() => {
              const hasOnline = PAYMENT_MODES?.online?.enabled;
              const hasDriver = PAYMENT_MODES?.driver?.enabled;

              if (!hasOnline && !hasDriver) return null;

              return (
                <div className="mt-3 sm:mt-4">
                  <label className={labelClassName}>Mode de paiement *</label>
                  <div className="space-y-2">
                    {hasOnline && (
                      <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={formData.paymentMethod === "online"}
                          onChange={handleChange}
                          className="w-5 h-5"
                        />
                        <div>
                          <span className="font-semibold">
                            {PAYMENT_MODES.online.label ||
                              "Paiement en ligne (Stripe)"}
                          </span>
                          {PAYMENT_MODES.online.requiresDeposit && (
                            <p className="text-xs text-gray-600">
                              Acompte de{" "}
                              {PAYMENT_MODES.online.depositPercent || 30}%
                              requis
                            </p>
                          )}
                        </div>
                      </label>
                    )}
                    {hasDriver && (
                      <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="driver"
                          checked={formData.paymentMethod === "driver"}
                          onChange={handleChange}
                          className="w-5 h-5"
                        />
                        <div>
                          <span className="font-semibold">
                            {PAYMENT_MODES.driver.label ||
                              "Paiement au chauffeur"}
                          </span>
                          {PAYMENT_MODES.driver.methods &&
                            Array.isArray(PAYMENT_MODES.driver.methods) && (
                              <p className="text-xs text-gray-600">
                                {PAYMENT_MODES.driver.methods
                                  .map((method) => {
                                    if (method === "card") return "💳 CB";
                                    if (method === "cash") return " 💵 Especes";
                                    if (method === "check") return " 📝 Cheque";
                                    return "";
                                  })
                                  .join("")}
                              </p>
                            )}
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              );
            })()}
          </fieldset>

         {/* Prix */}
<div className="mb-6 p-4 sm:p-6 bg-white border-2 rounded-xl shadow-xl relative" style={{ borderColor: BRANDING.primaryColor }}>
  <div className="absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg" style={{ backgroundColor: BRANDING.primaryColor }}>
    ESTIMATION
  </div>

  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 pt-2">
    <span className="block sm:inline">Prix Total Estime:</span>
    <span className="block sm:inline text-3xl sm:text-4xl mt-2 sm:mt-0 sm:ml-2" style={{ color: BRANDING.primaryColor }}>
      {isCalculating ? (
        <span className="text-base sm:text-lg text-gray-500">Calcul...</span>
      ) : (
        `${prixEstime} euros`
      )}
    </span>
  </h3>

  <div className="text-sm text-gray-600 mt-3 space-y-1">
    {distanceKm > 0 ? (
      <>
        <span className="font-semibold block">Distance: {distanceKm} km</span>
        
        {/* Afficher le détail si disponible */}
        {priceBreakdown && priceBreakdown.details.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-semibold text-gray-700 mb-2">Detail du calcul:</p>
            {priceBreakdown.details.map((detail, index) => (
              <div key={index} className="flex justify-between text-xs py-1">
                <span className="text-gray-600">{detail.label}</span>
                <span className="font-semibold">{detail.amount.toFixed(2)} euros</span>
              </div>
            ))}
          </div>
        )}

        {/* Forfait appliqué */}
        {priceBreakdown?.appliedPackage && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-800 font-semibold">
              ✅ Forfait applique: {priceBreakdown.appliedPackage.name}
            </p>
          </div>
        )}

        {/* Seuil kilométrique */}
        {priceBreakdown?.usedKmThreshold && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-800">
              ℹ️ Distance inferieure au seuil : forfait minimum applique
            </p>
          </div>
        )}

        {/* Code promo */}
        {appliedPromo && (
          <span className="block text-green-600 font-semibold mt-2">
            🎟️ Code promo: {appliedPromo.type === 'percentage' ? `-${appliedPromo.value}%` : `-${appliedPromo.value} euros`}
          </span>
        )}
      </>
    ) : (
      <span className="block text-sm text-gray-500">Validez les adresses pour le prix</span>
    )}
  </div>
</div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white py-4 sm:py-3 rounded-md font-bold text-base sm:text-lg hover:opacity-90 transition disabled:bg-gray-400 shadow-lg"
            style={{ backgroundColor: BRANDING.primaryColor }}
          >
            {isSubmitting ? "Envoi en cours..." : TEXTS.submitButton}
          </button>
        </form>
      </div>
    </>
  );
}