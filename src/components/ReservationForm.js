"use client";

import React, { useState } from "react";
import { validatePromoCode } from "@/lib/firestore";
import PaymentModal from "@/components/PaymentModal";
import BankTransferModal from "@/components/BankTransferModal";
import PayPalModal from "@/components/PayPalModal";

// Composants importés
import CustomerInfoSection from "@/components/reservation/CustomerInfoSection";
import TripDetailsSection from "@/components/reservation/TripDetailsSection";
import OptionsSection from "@/components/reservation/OptionsSection";
import PriceDisplay from "@/components/reservation/PriceDisplay";

// Hooks personnalisés
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useBookingSubmit } from "@/hooks/useBookingSubmit";

// Popup de confirmation
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
        <h2 className={`text-xl sm:text-2xl font-bold text-center mb-3 ${isSuccess ? "text-green-700" : "text-red-700"}`}>
          {isSuccess ? "Réservation Confirmée !" : "Erreur"}
        </h2>
        <p className="text-gray-700 text-center mb-6 text-sm sm:text-base">{message}</p>
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            isSuccess ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

export default function ReservationForm({ config, widgetId, userId }) {  // ✅ userId ajouté en prop
  // Configuration
  const VEHICLES = config?.vehicleCategories || [];
  const TARIFS = config?.pricing || { baseFee: 0.0 };
  const SURCHARGES = config?.timeSurcharges || [];
  const VACATION = config?.vacationMode || { enabled: false };
  const TEXTS = config?.texts || {
    formTitle: "Réservation VTC",
    formSubtitle: "Calculez votre prix et réservez en quelques clics",
    submitButton: "Réserver & Confirmer le Prix",
  };
  const BRANDING = config?.branding || {
    companyName: "VTC Premium",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#3b82f6",
  };

  // Vérifier mode vacances
  if (VACATION.enabled) {
    const endDate = VACATION.endDate ? new Date(VACATION.endDate).toLocaleDateString("fr-FR") : "";
    const message = VACATION.message.replace("{date}", endDate);

    return (
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="text-center mb-6 pb-6 border-b-4" style={{ borderBottomColor: BRANDING.primaryColor }}>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: BRANDING.primaryColor }}>
              {BRANDING.companyName}
            </h1>
          </div>
          <div className="p-6 sm:p-8 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🖐️</div>
              <div>
                <h4 className="text-xl font-bold text-orange-900 mb-2">Service temporairement indisponible</h4>
                <p className="text-orange-800 leading-relaxed">{message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Véhicules actifs
  const activeVehicles = VEHICLES.filter((v) => v.enabled);
  if (activeVehicles.length === 0) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto text-center">
          <p className="text-red-600 font-semibold">Service temporairement indisponible. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  // Initial form data
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
      const pc = config?.paymentConfig;
      if (pc?.stripe?.enabled && pc?.stripe?.connected) return "stripe";
      if (pc?.paypal?.enabled && pc?.paypal?.email) return "paypal";
      if (pc?.onBoard?.enabled) return "onBoard";
      if (pc?.bankTransfer?.enabled) return "bankTransfer";
      return "onBoard";
    })(),
  };

  // States
  const [formData, setFormData] = useState(initialFormData);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupSuccess, setPopupSuccess] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);

  // Custom hooks
  const {
    suggestions,
    coordsDepart,
    coordsArrivee,
    rechercherAdresse,
    selectionnerAdresse,
  } = useAddressSearch();

  const { priceBreakdown, distanceKm, prixEstime, isCalculating } = usePriceCalculation({
    coordsDepart,
    coordsArrivee,
    formData,
    activeVehicles,
    TARIFS,
    SURCHARGES,
    config,
    appliedPromo,
  });

  const {
    isSubmitting,
    showPaymentModal,
    setShowPaymentModal,
    showBankTransferModal,
    setShowBankTransferModal,
    showPayPalModal,
    setShowPayPalModal,
    pendingBooking,
    handleSubmit: submitBooking,
  } = useBookingSubmit({ 
    config, 
    widgetId, 
    userId,      // ✅ AJOUTÉ - Passé au hook
    VEHICLES 
  });

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "bagagesExtra" ? Math.max(0, parseInt(value, 10) || 0) : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // NE PAS rechercher si c'est une adresse validée
    if (name === "adresseDepart" && !coordsDepart && value.length >= 3) {
      rechercherAdresse(value, "depart");
    } else if (name === "adresseArrivee" && !coordsArrivee && value.length >= 3) {
      rechercherAdresse(value, "arrivee");
    }
  };

  const handleApplyPromo = async () => {
    if (!formData.promoCode.trim()) return;
    setCheckingPromo(true);
    setPromoError("");

    const result = await validatePromoCode(formData.promoCode, userId);

    if (result.success) {
      if (result.data.minAmount > parseFloat(prixEstime)) {
        setPromoError(`Montant minimum requis: ${result.data.minAmount} €`);
      } else {
        setAppliedPromo(result.data);
        setPromoError("");
      }
    } else {
      setPromoError(result.error);
    }
    setCheckingPromo(false);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setFormData({ ...formData, promoCode: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await submitBooking(formData, priceBreakdown, prixEstime, appliedPromo, distanceKm, {
      onSuccess: (bookingId) => {
        setPopupMessage(`Réservation confirmée ! Référence: ${bookingId.substring(0, 8).toUpperCase()}`);
        setPopupSuccess(true);
        setShowPopup(true);
        setFormData(initialFormData);
      },
      onError: (errorMessage) => {
        setPopupMessage(`Erreur: ${errorMessage}`);
        setPopupSuccess(false);
        setShowPopup(true);
      },
    });
  };

  // Styles
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{TEXTS.formTitle}</h2>
            <p className="text-sm sm:text-base text-gray-600">{TEXTS.formSubtitle}</p>
          </div>

          {/* Sections */}
          <CustomerInfoSection
            formData={formData}
            onChange={handleChange}
            BRANDING={BRANDING}
            inputClassName={inputClassName}
            labelClassName={labelClassName}
          />

          <TripDetailsSection
            formData={formData}
            onChange={handleChange}
            BRANDING={BRANDING}
            inputClassName={inputClassName}
            labelClassName={labelClassName}
            suggestions={suggestions}
            coordsDepart={coordsDepart}
            coordsArrivee={coordsArrivee}
            onSearchAddress={rechercherAdresse}
            onSelectAddress={selectionnerAdresse}
            activeVehicles={activeVehicles}
          />

          <OptionsSection
            formData={formData}
            onChange={handleChange}
            BRANDING={BRANDING}
            inputClassName={inputClassName}
            labelClassName={labelClassName}
            selectedVehicle={activeVehicles.find((v) => v.id === formData.typeVehicule)}
            appliedPromo={appliedPromo}
            promoError={promoError}
            checkingPromo={checkingPromo}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
            paymentConfig={config?.paymentConfig}
            priceBreakdown={priceBreakdown}
          />

          <PriceDisplay
            prixEstime={prixEstime}
            isCalculating={isCalculating}
            distanceKm={distanceKm}
            priceBreakdown={priceBreakdown}
            appliedPromo={appliedPromo}
            BRANDING={BRANDING}
          />

          {/* Submit button */}
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

      {/* Modals de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingData={pendingBooking}
        stripeAccountId={config?.paymentConfig?.stripe?.accountId}
        onPaymentSuccess={() => {
          setPopupMessage(`Paiement confirmé ! Référence: ${pendingBooking?.id?.substring(0, 8).toUpperCase()}`);
          setPopupSuccess(true);
          setShowPopup(true);
          setFormData(initialFormData);
          setShowPaymentModal(false);
        }}
      />

      <BankTransferModal
        isOpen={showBankTransferModal}
        onClose={() => setShowBankTransferModal(false)}
        bankInfo={config?.paymentConfig?.bankTransfer}
        bookingData={pendingBooking}
        onConfirm={() => {
          setPopupMessage(`Réservation enregistrée ! Effectuez le virement. Réf: ${pendingBooking?.id?.substring(0, 8).toUpperCase()}`);
          setPopupSuccess(true);
          setShowPopup(true);
          setFormData(initialFormData);
          setShowBankTransferModal(false);
        }}
      />

      <PayPalModal
        isOpen={showPayPalModal}
        onClose={() => setShowPayPalModal(false)}
        paypalEmail={config?.paymentConfig?.paypal?.email}
        bookingData={pendingBooking}
        onConfirm={() => {
          setPopupMessage(`Réservation enregistrée ! Confirmez PayPal. Réf: ${pendingBooking?.id?.substring(0, 8).toUpperCase()}`);
          setPopupSuccess(true);
          setShowPopup(true);
          setFormData(initialFormData);
          setShowPayPalModal(false);
        }}
      />
    </>
  );
}