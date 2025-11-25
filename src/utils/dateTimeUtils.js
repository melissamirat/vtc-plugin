/**
 * Utilitaire pour gérer les restrictions de date et heure de réservation
 */

/**
 * Obtient la date minimale pour la réservation (aujourd'hui)
 * @returns {string} Date au format YYYY-MM-DD
 */
export function getMinDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Obtient l'heure minimale si la date sélectionnée est aujourd'hui
 * Ajoute 15 minutes au temps actuel et arrondit au prochain quart d'heure
 * @param {string} selectedDate - Date sélectionnée au format YYYY-MM-DD
 * @returns {string|null} Heure minimale au format HH:MM ou null si pas aujourd'hui
 */
export function getMinTime(selectedDate) {
  if (!selectedDate) return null;

  const today = new Date();
  const selected = new Date(selectedDate + 'T00:00:00');
  
  // Comparer uniquement les dates (ignorer l'heure)
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedDateOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  
  if (selectedDateOnly.getTime() !== todayDate.getTime()) {
    return null; // Pas de restriction si ce n'est pas aujourd'hui
  }

  // Ajouter 15 minutes
  const minTime = new Date(today.getTime() + 15 * 60000);
  
  // Arrondir au prochain quart d'heure (00, 15, 30, 45)
  const minutes = minTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  
  minTime.setMinutes(roundedMinutes);
  minTime.setSeconds(0);
  minTime.setMilliseconds(0);

  // Si on a dépassé 60 minutes, ajuster l'heure
  if (minTime.getMinutes() === 60) {
    minTime.setHours(minTime.getHours() + 1);
    minTime.setMinutes(0);
  }

  const hours = String(minTime.getHours()).padStart(2, '0');
  const mins = String(minTime.getMinutes()).padStart(2, '0');
  
  return `${hours}:${mins}`;
}

/**
 * Valide si une date/heure de réservation est acceptable
 * @param {string} date - Date au format YYYY-MM-DD
 * @param {string} time - Heure au format HH:MM
 * @returns {object} { valid: boolean, error: string }
 */
export function validateBookingDateTime(date, time) {
  if (!date || !time) {
    return { valid: false, error: "Date et heure requises" };
  }

  const now = new Date();
  const bookingDateTime = new Date(`${date}T${time}:00`);
  
  // Vérifier que la réservation n'est pas dans le passé
  if (bookingDateTime < now) {
    return { valid: false, error: "Impossible de réserver dans le passé" };
  }

  // Vérifier le délai minimum de 15 minutes
  const minBookingTime = new Date(now.getTime() + 15 * 60000);
  if (bookingDateTime < minBookingTime) {
    return { 
      valid: false, 
      error: "Réservation possible minimum 15 minutes à l'avance" 
    };
  }

  return { valid: true, error: null };
}

/**
 * Formate un message d'information sur l'heure minimale
 * @param {string} selectedDate - Date sélectionnée
 * @returns {string|null} Message à afficher ou null
 */
export function getTimeInfoMessage(selectedDate) {
  const minTime = getMinTime(selectedDate);
  if (!minTime) return null;
  
  return `⏰ Heure minimale aujourd'hui : ${minTime} (15 min à l'avance)`;
}