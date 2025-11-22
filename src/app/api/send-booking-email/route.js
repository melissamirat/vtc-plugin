import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getWidget } from '@/lib/firestore';

export async function POST(request) {
  try {
    const { widgetId, bookingData } = await request.json();

    // Récupérer la config du widget
    const widgetResult = await getWidget(widgetId);
    if (!widgetResult.success) {
      return NextResponse.json(
        { error: 'Widget non trouvé' },
        { status: 404 }
      );
    }

    const config = widgetResult.data.config;
    const adminEmail = config.email?.adminEmail;

    if (!adminEmail) {
      console.error('Aucun email admin configuré');
      return NextResponse.json(
        { error: 'Email non configuré' },
        { status: 400 }
      );
    }

    // Configuration SMTP de VOTRE serveur
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Contenu de l'email
    const companyName = config.branding?.companyName || 'VTC';
    
    const mailContent = `
═══════════════════════════════════════════════
🚗 NOUVELLE RÉSERVATION - ${companyName}
═══════════════════════════════════════════════

📋 INFORMATIONS CLIENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nom: ${bookingData.customer.name}
Téléphone: ${bookingData.customer.phone}
Email: ${bookingData.customer.email || 'Non fourni'}

🗺️ DÉTAILS DU TRAJET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Départ: ${bookingData.trip.departure}
🎯 Arrivée: ${bookingData.trip.arrival}
📅 Date: ${bookingData.trip.date}
🕐 Heure: ${bookingData.trip.time}

🚙 VÉHICULE & PASSAGERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${bookingData.details.vehicleType}
Passagers: ${bookingData.details.passengers}
Bagages supplémentaires: ${bookingData.details.luggage || 0}

💰 TARIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Distance: ${bookingData.pricing.distanceKm} km
💵 PRIX TOTAL: ${bookingData.pricing.priceEstimate} €

💬 COMMENTAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${bookingData.details.comments || 'Aucun commentaire'}

═══════════════════════════════════════════════
Connectez-vous à votre tableau de bord :
${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/reservations
═══════════════════════════════════════════════
    `.trim();

    const mailOptions = {
      from: `"${companyName} - Réservations" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      replyTo: bookingData.customer.email || undefined,
      subject: `🚗 [${bookingData.pricing.priceEstimate}€] Nouvelle réservation - ${bookingData.customer.name}`,
      text: mailContent,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true,
      message: 'Email envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur envoi email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email', details: error.message },
      { status: 500 }
    );
  }
}
