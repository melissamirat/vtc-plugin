const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configuration de votre serveur SMTP
const transporter = nodemailer.createTransport({
  host: functions.config().smtp.host || 'smtp.ionos.fr',
  port: parseInt(functions.config().smtp.port || '465'),
  secure: true,
  auth: {
    user: functions.config().smtp.user,
    pass: functions.config().smtp.password,
  },
});

// ═══════════════════════════════════════════════════════════════
// 🚀 FUNCTION : Envoyer email quand une réservation est créée
// ═══════════════════════════════════════════════════════════════
exports.sendBookingEmail = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    const bookingId = context.params.bookingId;

    console.log('📧 Nouvelle réservation détectée:', bookingId);

    try {
      // 1. Récupérer la config du widget
      const widgetDoc = await admin.firestore()
        .collection('widgets')
        .doc(booking.widgetId)
        .get();

      if (!widgetDoc.exists) {
        console.error('Widget non trouvé:', booking.widgetId);
        return null;
      }

      const config = widgetDoc.data().config;
      const adminEmail = config.email?.adminEmail;

      if (!adminEmail) {
        console.error('Aucun email admin configuré pour ce widget');
        return null;
      }

      // 2. Formater l'email
      const companyName = config.branding?.companyName || 'VTC';
      
      const mailContent = `
═══════════════════════════════════════════════
🚗 NOUVELLE RÉSERVATION - ${companyName}
═══════════════════════════════════════════════

📋 INFORMATIONS CLIENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nom: ${booking.customer?.name || 'Non fourni'}
Téléphone: ${booking.customer?.phone || 'Non fourni'}
Email: ${booking.customer?.email || 'Non fourni'}

🗺️ DÉTAILS DU TRAJET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Départ: ${booking.trip?.departure || 'Non fourni'}
🎯 Arrivée: ${booking.trip?.arrival || 'Non fourni'}
📅 Date: ${booking.trip?.date || 'Non fourni'}
🕐 Heure: ${booking.trip?.time || 'Non fourni'}

🚙 VÉHICULE & PASSAGERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${booking.details?.vehicleType || 'Non fourni'}
Passagers: ${booking.details?.passengers || 0}
Bagages supplémentaires: ${booking.details?.luggage || 0}

💰 TARIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Distance: ${booking.pricing?.distanceKm || 0} km
💵 PRIX TOTAL: ${booking.pricing?.priceEstimate || 0} €

💬 COMMENTAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${booking.details?.comments || 'Aucun commentaire'}

═══════════════════════════════════════════════
🔗 Gérer cette réservation:
https://votre-site.com/dashboard/reservations

ID de réservation: ${bookingId}
═══════════════════════════════════════════════
      `.trim();

      const mailOptions = {
        from: `"${companyName} - Réservations" <${functions.config().smtp.user}>`,
        to: adminEmail,
        replyTo: booking.customer?.email || undefined,
        subject: `🚗 [${booking.pricing?.priceEstimate || 0}€] Nouvelle réservation - ${booking.customer?.name || 'Client'}`,
        text: mailContent,
      };

      // 3. Envoyer l'email
      await transporter.sendMail(mailOptions);
      
      console.log('✅ Email envoyé avec succès à:', adminEmail);
      return null;

    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      // On ne throw pas pour ne pas faire échouer la transaction
      return null;
    }
  });

// ═══════════════════════════════════════════════════════════════
// 📊 FUNCTION : Mettre à jour les stats (bonus)
// ═══════════════════════════════════════════════════════════════
exports.updateBookingStats = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    
    // Mettre à jour un compteur de stats
    const statsRef = admin.firestore()
      .collection('stats')
      .doc(booking.userId);
    
    return statsRef.set({
      totalBookings: admin.firestore.FieldValue.increment(1),
      lastBookingAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  });