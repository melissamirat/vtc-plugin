import React, { useEffect, useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import { getMinDate, getMinTime, getTimeInfoMessage, validateBookingDateTime } from '@/utils/dateTimeUtils';

/**
 * Section des détails du trajet - VERSION MODERNE
 */
export default function TripDetailsSection({
  formData,
  onChange,
  BRANDING,
  inputClassName,
  labelClassName,
  suggestions,
  coordsDepart,
  coordsArrivee,
  onSearchAddress,
  onSelectAddress,
  activeVehicles,
}) {
  const [dateTimeError, setDateTimeError] = useState(null);
  const [minTime, setMinTime] = useState(null);

  // Mettre à jour l'heure minimale quand la date change
  useEffect(() => {
    if (formData.dateReservation) {
      const min = getMinTime(formData.dateReservation);
      setMinTime(min);

      // Valider la date/heure actuelle
      if (formData.heureReservation) {
        const validation = validateBookingDateTime(
          formData.dateReservation,
          formData.heureReservation
        );
        setDateTimeError(validation.error);
      }
    }
  }, [formData.dateReservation, formData.heureReservation]);

  const handleSelectDepart = (feature) => {
    onSelectAddress(feature, "depart");
    setTimeout(() => {
      onChange({ target: { name: "adresseDepart", value: feature.properties.label } });
    }, 10);
  };

  const handleSelectArrivee = (feature) => {
    onSelectAddress(feature, "arrivee");
    setTimeout(() => {
      onChange({ target: { name: "adresseArrivee", value: feature.properties.label } });
    }, 10);
  };

  return (
    <fieldset
      className="mb-6 p-4 sm:p-6 border-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
      style={{ borderColor: BRANDING.accentColor }}
    >
      <legend
        className="px-3 text-base sm:text-lg font-bold flex items-center gap-2"
        style={{ color: BRANDING.primaryColor }}
      >
        <span className="text-2xl">🗺️</span>
        Détails du trajet
      </legend>

      {/* Adresse départ */}
      <div className="mb-4 sm:mb-5 mt-4 sm:mt-5">
        <AddressAutocomplete
          label="📍 Adresse de départ"
          name="adresseDepart"
          value={formData.adresseDepart}
          onChange={onChange}
          onSearch={(query) => onSearchAddress(query, "depart")}
          suggestions={suggestions.depart}
          onSelectAddress={handleSelectDepart}
          isValidated={!!coordsDepart}
          inputClassName={inputClassName}
          labelClassName={labelClassName}
        />
      </div>

      {/* Adresse arrivée */}
      <div className="mb-4 sm:mb-5">
        <AddressAutocomplete
          label="🎯 Adresse d'arrivée"
          name="adresseArrivee"
          value={formData.adresseArrivee}
          onChange={onChange}
          onSearch={(query) => onSearchAddress(query, "arrivee")}
          suggestions={suggestions.arrivee}
          onSelectAddress={handleSelectArrivee}
          isValidated={!!coordsArrivee}
          placeholder="Tapez votre destination..."
          inputClassName={inputClassName}
          labelClassName={labelClassName}
        />
      </div>

      {/* Date et heure avec design moderne */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
        <div className="relative">
          <label className={`${labelClassName} flex items-center gap-2`}>
            <span className="text-lg">📅</span>
            Date *
          </label>
          <input
            type="date"
            name="dateReservation"
            value={formData.dateReservation}
            onChange={onChange}
            min={getMinDate()}
            required
            className={`${inputClassName} ${
              formData.dateReservation ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''
            }`}
          />
        </div>

        <div className="relative">
          <label className={`${labelClassName} flex items-center gap-2`}>
            <span className="text-lg">🕐</span>
            Heure *
          </label>
          <input
            type="time"
            name="heureReservation"
            value={formData.heureReservation}
            onChange={onChange}
            min={minTime || undefined}
            required
            className={`${inputClassName} ${
              formData.heureReservation ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''
            } ${dateTimeError ? 'border-red-500 bg-red-50' : ''}`}
          />
          {minTime && (
            <p className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
              <span>⏰</span>
              Heure min: {minTime}
            </p>
          )}
        </div>
      </div>

      {/* Message d'erreur date/heure */}
      {dateTimeError && (
        <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl animate-shake">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-semibold text-red-800">{dateTimeError}</p>
          </div>
        </div>
      )}

      {/* Véhicule et passagers avec design moderne */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="relative group">
          <label className={`${labelClassName} flex items-center gap-2`}>
            <span className="text-lg">🚗</span>
            Type de véhicule *
          </label>
          <select
            name="typeVehicule"
            value={formData.typeVehicule}
            onChange={onChange}
            className={`${inputClassName} bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer hover:shadow-md transition-all`}
          >
            {activeVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name} ({vehicle.maxPassengers || 4} pers. max)
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className={`${labelClassName} flex items-center gap-2`}>
            <span className="text-lg">👥</span>
            Nombre de passagers *
          </label>
          <select
            name="nombrePassagers"
            value={formData.nombrePassagers}
            onChange={onChange}
            className={`${inputClassName} ${
              parseInt(formData.nombrePassagers) >
              (activeVehicles.find((v) => v.id === formData.typeVehicule)?.maxPassengers || 4)
                ? "border-red-500 bg-red-50"
                : "bg-gradient-to-r from-green-50 to-emerald-50"
            } cursor-pointer hover:shadow-md transition-all`}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} passager{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          {/* Avertissement capacité avec design moderne */}
          {(() => {
            const selectedVehicle = activeVehicles.find((v) => v.id === formData.typeVehicule);
            const maxPassengers = selectedVehicle?.maxPassengers || 4;
            const currentPassengers = parseInt(formData.nombrePassagers);

            if (currentPassengers > maxPassengers) {
              return (
                <div className="mt-3 p-4 bg-gradient-to-r from-red-50 via-pink-50 to-red-50 border-2 border-red-300 rounded-xl shadow-lg animate-bounce-slow">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🚫</span>
                    <div>
                      <p className="text-sm font-bold text-red-900 mb-1">
                        ⚠️ Capacité dépassée !
                      </p>
                      <p className="text-xs text-red-800 leading-relaxed">
                        Le véhicule <strong className="underline">{selectedVehicle?.name}</strong> accepte maximum{" "}
                        <strong className="text-red-900">{maxPassengers} passagers</strong>.
                        Veuillez réduire le nombre ou choisir un véhicule plus grand.
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

      {/* Animation CSS personnalisée */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </fieldset>
  );
}