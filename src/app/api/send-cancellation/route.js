// src/app/api/send-cancellation/route.js
// API pour envoyer l'email d'ANNULATION au client

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Template email d'ANNULATION
function getCancellationEmailTemplate(booking, config, reason) {
  const companyName = config?.branding?.companyName || 'VTC Service';
  const primaryColor = '#dc2626'; // Rouge pour annulation
  const vehicleName = booking.vehicle?.name || booking.vehicle || '-';
  
  // Message personnalisé selon le motif
  let reasonMessage = '';
  let reasonIcon = '❌';
  
  switch (reason) {
    case 'Zone non desservie':
      reasonMessage = 'Malheureusement, la zone de prise en charge ou de destination ne fait pas partie de notre zone de service actuelle.';
      reasonIcon = '📍';
      break;
    case 'Chauffeur indisponible':
      reasonMessage = 'Nous n\'avons malheureusement aucun chauffeur disponible pour la date et l\'heure demandées.';
      reasonIcon = '👨‍✈️';
      break;
    case 'Véhicule indisponible':
      reasonMessage = 'Le type de véhicule demandé n\'est malheureusement pas disponible pour cette date.';
      reasonIcon = '🚗';
      break;
    case 'Demande du client':
      reasonMessage = 'Suite à votre demande, nous avons procédé à l\'annulation de votre réservation.';
      reasonIcon = '👤';
      break;
    default:
      reasonMessage = 'Nous ne sommes malheureusement pas en mesure d\'honorer cette réservation.';
      reasonIcon = '📝';
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: ${primaryColor}; padding: 25px; text-align: center;">
        <div style="background: white; width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 10px; line-height: 50px;">
          <span style="font-size: 28px;">✗</span>
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">${companyName}</h1>
        <p style="color: #ffffff; opacity: 0.9; margin: 8px 0 0 0; font-size: 16px;">Reservation Annulee</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 25px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Bonjour ${booking.customer?.name || ''},</h2>
        
        <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: bold;">
            ${reasonIcon} Votre reservation a ete annulee
          </p>
          <p style="color: #991b1b; font-size: 13px; margin: 10px 0 0 0;">
            <strong>Motif :</strong> ${reason}
          </p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.5; margin: 0 0 15px 0; font-size: 14px;">
          ${reasonMessage}
        </p>
        
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0; font-weight: bold;">Détails de la réservation annulée :</p>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
            <tr>
              <td style="color: #6b7280;">Date</td>
              <td style="color: #1f2937; text-align: right;">${booking.date || '-'} a ${booking.time || '-'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Depart</td>
              <td style="color: #1f2937; text-align: right; font-size: 12px;">${booking.departure?.address || '-'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Arrivee</td>
              <td style="color: #1f2937; text-align: right; font-size: 12px;">${booking.arrival?.address || '-'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Vehicule</td>
              <td style="color: #1f2937; text-align: right;">${vehicleName}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0;">
          <p style="margin: 0; color: #92400e; font-size: 13px;">
            <strong>Besoin d'aide ?</strong><br>
            N'hesitez pas a nous contacter pour planifier une nouvelle reservation ou pour toute question.
          </p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.5; margin: 15px 0 0 0; font-size: 14px;">
          Nous nous excusons pour la gene occasionnee et esperons pouvoir vous servir prochainement.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 11px; margin: 0;">${companyName}</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request) {
  console.log('📧 API send-cancellation appelée');
  
  try {
    const { booking, config, reason } = await request.json();
    
    console.log('📦 Booking:', booking?.customer?.email);
    console.log('❌ Motif:', reason);
    
    if (!booking || !booking.customer?.email) {
      return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 });
    }
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Config SMTP manquante' }, { status: 500 });
    }
    
    const companyName = config?.branding?.companyName || 'VTC Service';
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ionos.fr',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      tls: { rejectUnauthorized: false },
    });
    
    try {
      await transporter.verify();
      console.log('✅ SMTP OK');
    } catch (e) {
      console.error('❌ SMTP Error:', e.message);
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
    
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    
    await transporter.sendMail({
      from: `"${companyName}" <${fromEmail}>`,
      to: booking.customer.email,
      subject: `❌ Reservation annulee - ${companyName}`,
      html: getCancellationEmailTemplate(booking, config, reason),
    });
    
    console.log('✅ Email annulation envoyé');
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}