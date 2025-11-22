'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createBooking } from '@/lib/firestore';

function ConfirmationPopup({ isOpen, onClose, message, isSuccess }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4">
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          )}
        </div>

        <h2 className={`text-xl sm:text-2xl font-bold text-center mb-3 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
          {isSuccess ? 'Reservation Confirmee !' : 'Erreur'}
        </h2>

        <p className="text-gray-700 text-center mb-6 text-sm sm:text-base">
          {message}
        </p>

        <button
          onClick={onClose}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            isSuccess 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

export default function ReservationForm({ config, widgetId, userId }) {
  const TARIFS = config?.pricing || {
    baseFee: 10.0,
    pricePerKm: { berline: 1.20, van: 1.80, prestige: 3.00 },
    supplements: { extraLuggage: 5.0, nightSurcharge: 15.0 },
    enableNightSurcharge: true,
    nightHours: { start: 22, end: 6 }
  };

  const TEXTS = config?.texts || {
    formTitle: 'Reservation VTC',
    formSubtitle: 'Calculez votre prix et reservez en quelques clics',
    submitButton: 'Reserver & Confirmer le Prix',
  };

  const BRANDING = config?.branding || {
    companyName: 'VTC Premium',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#3b82f6',
  };

  const initialFormData = {
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    typeVehicule: 'berline',
    adresseDepart: '',
    adresseArrivee: '',
    dateReservation: '',
    heureReservation: '',
    nombrePassagers: '1',
    bagagesExtra: 0,
    commentaires: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupSuccess, setPopupSuccess] = useState(false);
  
  const [coordsDepart, setCoordsDepart] = useState(null);
  const [coordsArrivee, setCoordsArrivee] = useState(null);
  const [suggestions, setSuggestions] = useState({ depart: [], arrivee: [] });
  
  const [distanceKm, setDistanceKm] = useState(0);
  const [prixEstime, setPrixEstime] = useState(TARIFS.baseFee.toFixed(2));
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRoutingReady = !!coordsDepart && !!coordsArrivee;

  const rechercherAdresse = async (query, type) => {
    if (query.length < 3) {
      setSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSuggestions(prev => ({
        ...prev,
        [type]: data.features || []
      }));
    } catch (error) {
      console.error('Erreur recherche adresse:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'bagagesExtra' ? Math.max(0, parseInt(value, 10) || 0) : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (name === 'adresseDepart') {
      setCoordsDepart(null);
      rechercherAdresse(value, 'depart');
    } else if (name === 'adresseArrivee') {
      setCoordsArrivee(null);
      rechercherAdresse(value, 'arrivee');
    }
    setCalculationError(null);
  };

  const selectionnerAdresse = (feature, type) => {
    const label = feature.properties.label;
    
    setFormData(prev => ({ 
      ...prev, 
      [type === 'depart' ? 'adresseDepart' : 'adresseArrivee']: label 
    }));
    
    const coords = feature.geometry.coordinates;
    if (type === 'depart') {
      setCoordsDepart(coords);
    } else {
      setCoordsArrivee(coords);
    }
    
    setSuggestions(prev => ({ ...prev, [type]: [] }));
  };

  useEffect(() => {
    if (isRoutingReady) {
      calculerPrix();
    }
  }, [coordsDepart, coordsArrivee, formData.typeVehicule, formData.heureReservation, formData.bagagesExtra]);

  const calculerPrix = async () => {
    if (!coordsDepart || !coordsArrivee) return;

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const coordinates = `${coordsDepart[0]},${coordsDepart[1]};${coordsArrivee[0]},${coordsArrivee[1]}`;
      const apiUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`;
      
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.code === 'Ok' && result.routes?.[0]?.distance) {
        const distanceMeters = result.routes[0].distance;
        const km = Math.round(distanceMeters / 1000);
        setDistanceKm(km);

        let total = TARIFS.baseFee;
        const prixKm = TARIFS.pricePerKm[formData.typeVehicule] || TARIFS.pricePerKm.berline;
        total += km * prixKm;
        
        total += formData.bagagesExtra * TARIFS.supplements.extraLuggage;
        
        if (TARIFS.enableNightSurcharge && formData.heureReservation) {
          const heure = parseInt(formData.heureReservation.split(':')[0], 10);
          if ((heure >= TARIFS.nightHours.start && heure <= 23) || (heure >= 0 && heure < TARIFS.nightHours.end)) {
            total += TARIFS.supplements.nightSurcharge;
          }
        }

        setPrixEstime(total.toFixed(2));
      } else {
        setCalculationError('Impossible de calculer la route');
        setPrixEstime(TARIFS.baseFee.toFixed(2));
      }
    } catch (error) {
      console.error('Erreur calcul:', error);
      setCalculationError('Erreur de calcul');
    }

    setIsCalculating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        },
      };

      const result = await createBooking(bookingData);

      if (result.success) {
        try {
          await fetch('/api/send-booking-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ widgetId, bookingData }),
          });
        } catch (emailError) {
          console.error('Erreur envoi email:', emailError);
        }

        setPopupMessage(`Reservation confirmee pour le ${formData.dateReservation} (${prixEstime} euros). Vous recevrez une confirmation par email.`);
        setPopupSuccess(true);
        setShowPopup(true);
        
        setFormData(initialFormData);
        setCoordsDepart(null);
        setCoordsArrivee(null);
        setDistanceKm(0);
        setPrixEstime(TARIFS.baseFee.toFixed(2));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur soumission:', error);
      setPopupMessage('Une erreur est survenue. Veuillez reessayer.');
      setPopupSuccess(false);
      setShowPopup(true);
    }

    setIsSubmitting(false);
  };

  const NightSurchargeDisplay = useMemo(() => {
    if (!TARIFS.enableNightSurcharge || !formData.heureReservation) return null;
    
    const heure = parseInt(formData.heureReservation.split(':')[0], 10);
    const isNightTime = (heure >= TARIFS.nightHours.start && heure <= 23) || (heure >= 0 && heure < TARIFS.nightHours.end);
    
    if (isNightTime) {
      return (
        <span className="block text-sm text-blue-600 font-semibold mt-2">
          Supplement nuit applique : +{TARIFS.supplements.nightSurcharge.toFixed(2)} euros
        </span>
      );
    }
    return null;
  }, [formData.heureReservation, TARIFS]);

  // Style optimisé pour les inputs
  const inputClassName = "w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-md text-gray-900 text-base placeholder-gray-400 focus:ring-2 focus:border-transparent transition bg-white";
  const labelClassName = "block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2";

  return (
    <>
      <ConfirmationPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        message={popupMessage}
        isSuccess={popupSuccess}
      />

      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-4" style={{ borderBottomColor: BRANDING.primaryColor }}>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: BRANDING.primaryColor }}>
              {BRANDING.companyName}
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {TEXTS.formTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {TEXTS.formSubtitle}
            </p>
          </div>

          {/* Informations personnelles */}
          <fieldset className="mb-6 p-3 sm:p-4 border-2 rounded-lg" style={{ borderColor: BRANDING.accentColor }}>
            <legend className="px-2 text-base sm:text-lg font-semibold" style={{ color: BRANDING.primaryColor }}>
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

          {/* Détails du trajet */}
          <fieldset className="mb-6 p-3 sm:p-4 border-2 rounded-lg" style={{ borderColor: BRANDING.accentColor }}>
            <legend className="px-2 text-base sm:text-lg font-semibold" style={{ color: BRANDING.primaryColor }}>
              Details du trajet
            </legend>

            {/* Adresses */}
            <div className="mb-3 sm:mb-4 mt-3 sm:mt-4 relative">
              <label className={labelClassName}>Adresse de depart *</label>
              <input
                type="text"
                name="adresseDepart"
                value={formData.adresseDepart}
                onChange={handleChange}
                required
                placeholder="Tapez votre adresse..."
                className={`${inputClassName} ${coordsDepart ? 'border-green-500 bg-green-50' : ''}`}
              />
              {suggestions.depart.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                  {suggestions.depart.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectionnerAdresse(suggestion, 'depart')}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer border-b text-sm sm:text-base"
                    >
                      {suggestion.properties.label}
                    </div>
                  ))}
                </div>
              )}
              {coordsDepart && !suggestions.depart.length && (
                <p className="text-xs sm:text-sm text-green-600 mt-1 font-medium">
                  Adresse validee
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
                className={`${inputClassName} ${coordsArrivee ? 'border-green-500 bg-green-50' : ''}`}
              />
              {suggestions.arrivee.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                  {suggestions.arrivee.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectionnerAdresse(suggestion, 'arrivee')}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer border-b text-sm sm:text-base"
                    >
                      {suggestion.properties.label}
                    </div>
                  ))}
                </div>
              )}
              {coordsArrivee && !suggestions.arrivee.length && (
                <p className="text-xs sm:text-sm text-green-600 mt-1 font-medium">
                  Adresse validee
                </p>
              )}
            </div>

            {/* Date et heure */}
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

            {/* Véhicule et passagers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className={labelClassName}>Type de vehicule *</label>
                <select
                  name="typeVehicule"
                  value={formData.typeVehicule}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  {config?.vehicles?.berline?.enabled && (
                    <option value="berline">
                      {config.vehicles.berline.name} - {TARIFS.pricePerKm.berline.toFixed(2)} euros/km
                    </option>
                  )}
                  {config?.vehicles?.van?.enabled && (
                    <option value="van">
                      {config.vehicles.van.name} - {TARIFS.pricePerKm.van.toFixed(2)} euros/km
                    </option>
                  )}
                  {config?.vehicles?.prestige?.enabled && (
                    <option value="prestige">
                      {config.vehicles.prestige.name} - {TARIFS.pricePerKm.prestige.toFixed(2)} euros/km
                    </option>
                  )}
                </select>
              </div>
              <div>
                <label className={labelClassName}>Nombre de passagers *</label>
                <select
                  name="nombrePassagers"
                  value={formData.nombrePassagers}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Options */}
          {TARIFS.enableLuggageOption && (
            <fieldset className="mb-6 p-3 sm:p-4 border-2 rounded-lg" style={{ borderColor: BRANDING.accentColor }}>
              <legend className="px-2 text-base sm:text-lg font-semibold" style={{ color: BRANDING.primaryColor }}>
                Options
              </legend>
              
              <div className="mt-3 sm:mt-4">
                <label className={labelClassName}>
                  Bagages supplementaires (+{TARIFS.supplements.extraLuggage.toFixed(2)} euros / bagage)
                </label>
                <input
                  type="number"
                  name="bagagesExtra"
                  min="0"
                  value={formData.bagagesExtra}
                  onChange={handleChange}
                  className={inputClassName}
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
            </fieldset>
          )}

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

            <p className="text-sm text-gray-600 mt-3">
              {distanceKm > 0 ? (
                <>
                  <span className="font-semibold block">Distance: {distanceKm} km</span>
                  <span className="block text-xs italic mt-1">
                    ({TARIFS.pricePerKm[formData.typeVehicule]?.toFixed(2)} euros/km + {TARIFS.baseFee.toFixed(2)} euros de base)
                  </span>
                </>
              ) : (
                <span className="block text-sm text-gray-500">
                  Validez les adresses pour le prix
                </span>
              )}
              {NightSurchargeDisplay}
            </p>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white py-4 sm:py-3 rounded-md font-bold text-base sm:text-lg hover:opacity-90 transition disabled:bg-gray-400 shadow-lg"
            style={{ backgroundColor: BRANDING.primaryColor }}
          >
            {isSubmitting ? 'Envoi en cours...' : TEXTS.submitButton}
          </button>
        </form>
      </div>
    </>
  );
}