import { useState } from 'react';
import { createBooking } from '@/lib/firestore';

/**
 * Hook pour gérer la soumission de réservation et les modals de paiement
 */
export function useBookingSubmit({ config, widgetId, userId, VEHICLES }) {  // ✅ Ajout de userId
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  const validateForm = (formData) => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    if (!formData.adresseDepart.trim()) newErrors.adresseDepart = "L'adresse de départ est requise";
    if (!formData.adresseArrivee.trim()) newErrors.adresseArrivee = "L'adresse d'arrivée est requise";
    if (!formData.dateReservation) newErrors.dateReservation = "La date est requise";
    if (!formData.heureReservation) newErrors.heureReservation = "L'heure est requise";

    return newErrors;
  };

  const handleSubmit = async (formData, priceBreakdown, prixEstime, appliedPromo, distanceKm, callbacks) => {
    setIsSubmitting(true);
    setErrors({});

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const selectedVehicle = VEHICLES.find((v) => v.id === formData.typeVehicule);

      const bookingData = {
        userId: userId,           // ✅ ID du propriétaire du widget
        widgetId: widgetId,       // ID du widget
        
        // Structure customer conforme au dashboard
        customer: {
          name: `${formData.prenom} ${formData.nom}`,  // ✅ Nom complet pour l'affichage
          firstName: formData.prenom,
          lastName: formData.nom,
          email: formData.email,
          phone: formData.telephone,
        },
        
        // Structure trip conforme au dashboard
        trip: {
          date: formData.dateReservation,
          time: formData.heureReservation,
          departure: formData.adresseDepart,  // ✅ Adresse de départ dans trip
          arrival: formData.adresseArrivee,   // ✅ Adresse d'arrivée dans trip
        },
        
        // Conserver aussi les anciennes structures pour compatibilité
        departure: {
          address: formData.adresseDepart,
        },
        arrival: {
          address: formData.adresseArrivee,
        },
        
        // Structure details conforme au dashboard
        details: {
          vehicleType: formData.typeVehicule,      // ✅ Type de véhicule
          passengers: parseInt(formData.nombrePassagers),  // ✅ Nombre de passagers
          luggage: formData.bagagesExtra,          // ✅ Bagages
        },
        
        // Informations véhicule
        vehicle: {
          id: formData.typeVehicule,
          name: selectedVehicle?.name || formData.typeVehicule,
          icon: selectedVehicle?.icon || "🚗",
        },
        
        // Structure pricing conforme au dashboard
        pricing: {
          ...priceBreakdown,
          priceEstimate: parseFloat(prixEstime),   // ✅ Utilisé par le dashboard
          finalPrice: parseFloat(prixEstime),       // Garder aussi pour compatibilité
          promoCode: appliedPromo?.code || null,
          distanceKm: distanceKm || 0,
        },
        
        payment: {
          method: formData.paymentMethod,
          status: "pending",
          amount: parseFloat(prixEstime) || 0,
        },
        
        distance: distanceKm || 0,
        comments: formData.commentaires,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const result = await createBooking(bookingData);

      if (result.success) {
        const bookingId = result.bookingId;

        // Gérer selon le mode de paiement
        if (formData.paymentMethod === "stripe") {
          setPendingBooking({
            id: bookingId,
            amount: parseFloat(prixEstime),
            email: formData.email,
            nom: formData.nom,
            prenom: formData.prenom,
          });
          setShowPaymentModal(true);
        } else if (formData.paymentMethod === "paypal") {
          setPendingBooking({
            id: bookingId,
            amount: parseFloat(prixEstime),
          });
          setShowPayPalModal(true);
        } else if (formData.paymentMethod === "bankTransfer") {
          setPendingBooking({
            id: bookingId,
            amount: parseFloat(prixEstime),
          });
          setShowBankTransferModal(true);
        } else {
          // Paiement à bord
          callbacks.onSuccess(bookingId);
        }

        // Envoyer email
        try {
          await fetch("/api/send-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ booking: bookingData, config }),
          });
        } catch (emailError) {
          console.error("Erreur envoi email:", emailError);
        }
      } else {
        throw new Error(result.error || "Erreur lors de la création de la réservation");
      }
    } catch (error) {
      console.error("Erreur:", error);
      callbacks.onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    errors,
    showPaymentModal,
    setShowPaymentModal,
    showBankTransferModal,
    setShowBankTransferModal,
    showPayPalModal,
    setShowPayPalModal,
    pendingBooking,
    handleSubmit,
  };
}