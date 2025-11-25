import { useState, useEffect } from 'react';
import { calculatePrice } from '@/utils/priceCalculator';

/**
 * Hook pour le calcul automatique du prix basé sur les coordonnées
 */
export function usePriceCalculation({
  coordsDepart,
  coordsArrivee,
  formData,
  activeVehicles,
  TARIFS,
  SURCHARGES,
  config,
  appliedPromo,
}) {
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [prixEstime, setPrixEstime] = useState(TARIFS.baseFee?.toFixed(2) || "10.00");
  const [isCalculating, setIsCalculating] = useState(false);

  const calculerPrix = async () => {
    if (!coordsDepart || !coordsArrivee) return;

    setIsCalculating(true);

    try {
      const response = await fetch(
        `/api/distance?` +
          new URLSearchParams({
            origin: `${coordsDepart[1]},${coordsDepart[0]}`,
            destination: `${coordsArrivee[1]},${coordsArrivee[0]}`,
          })
      );

      const result = await response.json();

      if (
        result.status === "OK" &&
        result.rows?.[0]?.elements?.[0]?.status === "OK"
      ) {
        const element = result.rows[0].elements[0];
        const distanceMeters = element.distance.value;
        const km = Math.round(distanceMeters / 1000);
        setDistanceKm(km);

        const vehicle = activeVehicles.find(
          (v) => v.id === formData.typeVehicule
        );
        if (!vehicle) return;

        const breakdown = calculatePrice({
          distanceKm: km,
          vehicleConfig: vehicle,
          date: formData.dateReservation,
          time: formData.heureReservation,
          totalLuggage: formData.bagagesExtra,  // ✅ NOUVEAU FORMAT
          departureAddress: formData.adresseDepart,
          arrivalAddress: formData.adresseArrivee,
          departureCoords: { lat: coordsDepart[1], lon: coordsDepart[0] },
          arrivalCoords: { lat: coordsArrivee[1], lon: coordsArrivee[0] },
          surcharges: SURCHARGES,
          packages: config?.packages || [],
          serviceZones: config?.serviceZones || [],  // ✅ Ajout zones de service
        });

        setPriceBreakdown(breakdown);

        let finalPrice = breakdown.total;

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

  useEffect(() => {
    if (coordsDepart && coordsArrivee) {
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

  return {
    priceBreakdown,
    distanceKm,
    prixEstime,
    isCalculating,
  };
}