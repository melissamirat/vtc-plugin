'use server';

import nodemailer from 'nodemailer'; 

// Configuration des tarifs (doit être définie côté serveur pour la vérification finale)
const TARIFS = {
  PRIX_KM: {
    berline: 1.20,      
    van: 1.80,          
    prestige: 3.00,     
  },
  BASE: 10.00, 
  SUPPLEMENTS: {
    BAGAGE_EXTRA: 5.00,
    HEURE_NUIT: 15.00, 
  },
};

// --- FONCTION SERVEUR POUR CALCULER LA DISTANCE ET LE PRIX (AVEC OSRM) ---
/**
 * Calcule la distance routière RÉELLE et l'estimation de prix basée sur les coordonnées et le véhicule.
 * Utilise OSRM (Open Source Routing Machine) - GRATUIT, sans clé API !
 * @param {Array<number>} startCoords - Coordonnées de départ [lon, lat]
 * @param {Array<number>} endCoords - Coordonnées d'arrivée [lon, lat]
 * @param {string} typeVehicule - Type de véhicule
 * @param {string} heureReservation - Heure de réservation
 * @param {number} bagagesExtra - Nombre de bagages supplémentaires
 */
export async function getDistanceAndEstimate(startCoords, endCoords, typeVehicule, heureReservation, bagagesExtra) {
    if (!startCoords || !endCoords) {
        return { distanceKm: 0, prixEstime: TARIFS.BASE.toFixed(2), error: "Coordonnées manquantes." };
    }

    // OSRM attend les coordonnées au format : lon,lat;lon,lat
    const coordinates = `${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}`;
    
    // API OSRM publique (GRATUITE, pas de clé nécessaire !)
    const apiUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false&alternatives=false&steps=false`;
    
    let distanceKm = 0;
    let total = TARIFS.BASE;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'VTC-Reservation-App' // Bonne pratique
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`Erreur OSRM API: ${response.status} - ${response.statusText}`);
            const errorText = await response.text();
            console.error('Détails erreur OSRM:', errorText);
            throw new Error(`Erreur HTTP ${response.status} lors du calcul de la route.`);
        }

        const result = await response.json();
        
        // Vérification de la réponse OSRM
        if (result.code !== 'Ok') {
            console.error('Erreur OSRM:', result.code, result.message);
            return { 
                distanceKm: 0, 
                prixEstime: TARIFS.BASE.toFixed(2), 
                error: `Impossible de calculer la route : ${result.message || 'Vérifiez les adresses'}` 
            };
        }

        const distanceMeters = result.routes?.[0]?.distance;
        const durationSeconds = result.routes?.[0]?.duration;

        if (distanceMeters && distanceMeters > 0) {
            distanceKm = Math.round(distanceMeters / 1000); // Conversion en km et arrondi
            console.log(`✅ Route calculée : ${distanceKm} km en ${Math.round(durationSeconds / 60)} min`);
        } else {
            return { 
                distanceKm: 0, 
                prixEstime: TARIFS.BASE.toFixed(2), 
                error: "Distance non trouvée. Vérifiez que les adresses sont accessibles par la route." 
            };
        }

    } catch (error) {
        console.error(`❌ Erreur serveur lors du routage OSRM:`, error.message);
        return { 
            distanceKm: 0, 
            prixEstime: TARIFS.BASE.toFixed(2), 
            error: `Erreur de calcul : ${error.message}` 
        };
    }

    // --- LOGIQUE DE CALCUL DE PRIX (serveur) ---
    const prixKm = TARIFS.PRIX_KM[typeVehicule] || TARIFS.PRIX_KM.berline;
    total += distanceKm * prixKm;

    // Suppléments
    const parsedBagagesExtra = parseInt(bagagesExtra, 10) || 0;
    total += parsedBagagesExtra * TARIFS.SUPPLEMENTS.BAGAGE_EXTRA;

    // Supplément heure de nuit (22h-6h)
    const heure = parseInt(heureReservation.split(':')[0], 10);
    if ((heure >= 22 && heure <= 23) || (heure >= 0 && heure < 6)) {
        total += TARIFS.SUPPLEMENTS.HEURE_NUIT;
    }
    
    return { 
        distanceKm, 
        prixEstime: total.toFixed(2), 
        error: null 
    };
}


// --- FONCTION DE SOUMISSION DU FORMULAIRE (ENVOI D'EMAIL) ---
export async function handleReservationSubmit(prevState, formData) {
  // 1. Extraction des variables d'environnement (pour Nodemailer)
  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (!EMAIL_USER || !EMAIL_PASSWORD || !ADMIN_EMAIL) {
    console.error("ERREUR ENV: Les variables EMAIL_USER, EMAIL_PASSWORD ou ADMIN_EMAIL ne sont pas définies.");
    return {
      success: false,
      message: "Erreur de configuration serveur. Veuillez contacter l'administrateur."
    };
  }

  // 2. Extraction des données du formulaire 
  const data = {
    nom: formData.get('nom'),
    prenom: formData.get('prenom'),
    telephone: formData.get('telephone'),
    email: formData.get('email'),
    typeVehicule: formData.get('typeVehicule'),
    adresseDepart: formData.get('adresseDepart'),
    adresseArrivee: formData.get('adresseArrivee'),
    dateReservation: formData.get('dateReservation'),
    heureReservation: formData.get('heureReservation'),
    nombrePassagers: formData.get('nombrePassagers'),
    bagagesExtra: formData.get('bagagesExtra'), 
    distanceKm: formData.get('distanceKm'),     
    prixEstime: formData.get('prixEstime'),     
    commentaires: formData.get('commentaires'),
  };

  // 3. Validation de base
  if (!data.nom || !data.adresseDepart || !data.dateReservation) {
    return { 
      success: false, 
      message: "Validation échouée : Les champs requis sont manquants." 
    };
  }

  // 4. Configuration du transporteur SMTP (Ionos)
  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.fr', 
    port: 465, 
    secure: true, 
    auth: {
      user: EMAIL_USER, 
      pass: EMAIL_PASSWORD, 
    },
  });

  // 5. Contenu de l'email pour l'administrateur
  const mailContent = `
    ======================================
    NOUVELLE RÉSERVATION VTC - PRIX ESTIMÉ
    ======================================

    Nom Complet: ${data.prenom} ${data.nom}
    Téléphone: ${data.telephone}
    Email: ${data.email || 'Non fourni'}

    Détails du Trajet:
    --------------------------------
    Départ: ${data.adresseDepart}
    Arrivée: ${data.adresseArrivee}
    Date & Heure: ${data.dateReservation} à ${data.heureReservation}
    Véhicule: ${data.typeVehicule} (${data.nombrePassagers} passagers)

    Options et Frais:
    --------------------------------
    Bagages supplémentaires: ${data.bagagesExtra}
    Distance RÉELLE par la route: ${data.distanceKm} km
    
    💰 PRIX TOTAL ESTIMÉ: ${data.prixEstime} €
    
    Commentaires:
    --------------------------------
    ${data.commentaires || 'Aucun commentaire.'}
  `;

  const mailOptions = {
    from: EMAIL_USER,
    to: ADMIN_EMAIL, 
    subject: `🚗 [${data.prixEstime} €] Nouvelle Réservation VTC - ${data.nom} ${data.prenom}`,
    text: mailContent,
  };

  // 6. Envoi de l'email
  try {
    await transporter.sendMail(mailOptions);
    
    console.log("✅ Réservation envoyée avec succès à l'administrateur.");
    return { 
      success: true, 
      message: `Réservation confirmée pour le ${data.dateReservation} (${data.prixEstime} €). Vous recevrez une confirmation par email.` 
    };

  } catch (error) {
    console.error("❌ Erreur serveur Server Action (Nodemailer):", error);
    return { 
      success: false, 
      message: `Erreur lors de l'envoi : ${error.message}` 
    };
  }
}