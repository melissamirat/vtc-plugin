// src/app/api/send-confirmation/route.js
// API pour envoyer l'email de CONFIRMATION au client
// VERSION CORRIGÉE - Compatible avec nouvelle structure

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';

// Générateur de PDF de confirmation COMPACT
function generateConfirmationPDFBuffer(booking, config) {
  const doc = new jsPDF();
  const primaryColor = '#059669'; // Vert pour confirmation
  const companyName = config?.branding?.companyName || 'VTC Service';
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // ═══════════════════════════════════════════════════════════════
  // EN-TÊTE VERT
  // ═══════════════════════════════════════════════════════════════
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, margin, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Service VTC', margin, 25);
  
  const orderNumber = booking.id 
    ? `N° ${String(booking.id).slice(-8).toUpperCase()}` 
    : `N° ${Date.now().toString(36).toUpperCase()}`;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(orderNumber, pageWidth - margin, 15, { align: 'right' });
  
  const today = new Date().toLocaleDateString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric' 
  });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(today, pageWidth - margin, 23, { align: 'right' });

  // ═══════════════════════════════════════════════════════════════
  // BADGE CONFIRMÉ
  // ═══════════════════════════════════════════════════════════════
  let y = 42;
  doc.setFillColor(5, 150, 105);
  doc.roundedRect(pageWidth / 2 - 45, y - 6, 90, 16, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESERVATION CONFIRMEE', pageWidth / 2, y + 4, { align: 'center' });

  // ═══════════════════════════════════════════════════════════════
  // INFORMATIONS CLIENT
  // ═══════════════════════════════════════════════════════════════
  y += 16;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'F');
  
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', margin + 4, y + 8);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(booking.customer?.name || 'Client', margin + 4, y + 17);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${booking.customer?.email || '-'}  |  ${booking.customer?.phone || '-'}`, margin + 4, y + 26);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  // ✅ CORRIGÉ - Utilise details.passengers ou passengers
  const passengers = booking.details?.passengers || booking.passengers || 1;
  const luggage = booking.details?.luggage || booking.luggage || 0;
  const paxText = `${passengers} Passager${passengers > 1 ? 's' : ''}`;
  const lugText = luggage > 0 ? ` - ${luggage} Bagage${luggage > 1 ? 's' : ''}` : '';
  doc.text(paxText + lugText, pageWidth - margin - 4, y + 17, { align: 'right' });

  // ═══════════════════════════════════════════════════════════════
  // TRAJET
  // ═══════════════════════════════════════════════════════════════
  y += 38;
  
  doc.setFillColor(5, 150, 105);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAJET', margin + 4, y + 6);
  
  y += 12;
  
  // ✅ CORRIGÉ - Départ (essaie trip.departure puis departure.address)
  doc.setFillColor(34, 197, 94);
  doc.circle(margin + 5, y + 2, 3, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const departText = booking.trip?.departure || booking.departure?.address || '-';
  const departShort = departText.length > 70 ? departText.substring(0, 70) + '...' : departText;
  doc.text(departShort, margin + 12, y + 4);
  
  y += 12;
  
  // ✅ CORRIGÉ - Arrivée (essaie trip.arrival puis arrival.address)
  doc.setFillColor(239, 68, 68);
  doc.circle(margin + 5, y + 2, 3, 'F');
  const arrivalText = booking.trip?.arrival || booking.arrival?.address || '-';
  const arrivalShort = arrivalText.length > 70 ? arrivalText.substring(0, 70) + '...' : arrivalText;
  doc.text(arrivalShort, margin + 12, y + 4);

  // ═══════════════════════════════════════════════════════════════
  // DATE / HEURE / VEHICULE / DISTANCE
  // ═══════════════════════════════════════════════════════════════
  y += 15;
  
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
  
  const colWidth = contentWidth / 4;
  
  // ✅ CORRIGÉ - Date (trip.date)
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE', margin + 4, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  let displayDate = booking.trip?.date || booking.date || '-';
  if (displayDate && displayDate !== '-' && displayDate.includes('-')) {
    const parts = displayDate.split('-');
    if (parts.length === 3) {
      displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  doc.text(displayDate, margin + 4, y + 16);
  
  // ✅ CORRIGÉ - Heure (trip.time)
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('HEURE', margin + colWidth + 4, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.trip?.time || booking.time || '-', margin + colWidth + 4, y + 16);
  
  // ✅ CORRIGÉ - Véhicule
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICULE', margin + colWidth * 2 + 4, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const vehicleName = booking.vehicle?.name || booking.vehicle || '-';
  const vehicleShort = vehicleName.length > 15 ? vehicleName.substring(0, 15) + '...' : vehicleName;
  doc.text(vehicleShort, margin + colWidth * 2 + 4, y + 16);
  
  // ✅ CORRIGÉ - Distance
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DISTANCE', margin + colWidth * 3 + 4, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const distance = booking.pricing?.distanceKm || booking.distance || 0;
  doc.text(`${distance} km`, margin + colWidth * 3 + 4, y + 16);

  // ═══════════════════════════════════════════════════════════════
  // TOTAL
  // ═══════════════════════════════════════════════════════════════
  y += 32;
  
  doc.setFillColor(5, 150, 105);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('MONTANT CONFIRME', margin + 10, y + 15);
  
  const totalPrice = booking.pricing?.priceEstimate || booking.pricing?.finalPrice || 0;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${Number(totalPrice).toFixed(2)} EUR`, pageWidth - margin - 10, y + 24, { align: 'right' });

  // ═══════════════════════════════════════════════════════════════
  // MODE DE PAIEMENT
  // ═══════════════════════════════════════════════════════════════
  y += 42;
  
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (booking.payment?.method || booking.paymentMethod) {
    const paymentMethod = booking.payment?.method || booking.paymentMethod;
    doc.text(`Paiement: ${paymentMethod}`, margin, y);
  }

  // ═══════════════════════════════════════════════════════════════
  // PIED DE PAGE
  // ═══════════════════════════════════════════════════════════════
  y += 20;
  
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companyName} - Merci de votre confiance !`, pageWidth / 2, y + 8, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

// Template email de CONFIRMATION
function getConfirmationEmailTemplate(booking, config) {
  const companyName = config?.branding?.companyName || 'VTC Service';
  const primaryColor = '#059669';
  const totalPrice = booking.pricing?.priceEstimate || booking.pricing?.finalPrice || 0;
  const vehicleName = booking.vehicle?.name || booking.vehicle || '-';
  
  // ✅ CORRIGÉ - Utilise la nouvelle structure
  const tripDate = booking.trip?.date || booking.date || '-';
  const tripTime = booking.trip?.time || booking.time || '-';
  const departure = booking.trip?.departure || booking.departure?.address || '-';
  const arrival = booking.trip?.arrival || booking.arrival?.address || '-';
  
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
          <span style="font-size: 28px;">✓</span>
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">${companyName}</h1>
        <p style="color: #ffffff; opacity: 0.9; margin: 8px 0 0 0; font-size: 16px;">Reservation Confirmée !</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 25px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Bonjour ${booking.customer?.name || ''},</h2>
        
        <div style="background-color: #ecfdf5; border: 2px solid #059669; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <p style="color: #065f46; font-size: 14px; margin: 0; font-weight: bold;">
            ✅ Votre reservation est confirmée !
          </p>
          <p style="color: #065f46; font-size: 13px; margin: 8px 0 0 0;">
            Notre chauffeur sera present a l'adresse indiquee.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
            <tr>
              <td style="color: #6b7280;">Date</td>
              <td style="color: #1f2937; font-weight: 600; text-align: right;">${tripDate} a ${tripTime}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Depart</td>
              <td style="color: #1f2937; text-align: right;">${departure}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Arrivee</td>
              <td style="color: #1f2937; text-align: right;">${arrival}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Vehicule</td>
              <td style="color: #1f2937; font-weight: 600; text-align: right;">${vehicleName}</td>
            </tr>
          </table>
          <div style="border-top: 2px solid ${primaryColor}; margin-top: 12px; padding-top: 12px; text-align: right;">
            <span style="color: #1f2937; font-size: 14px;">Total: </span>
            <span style="color: ${primaryColor}; font-size: 22px; font-weight: bold;">${Number(totalPrice).toFixed(2)} EUR</span>
          </div>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 15px 0;">
          <p style="margin: 0; color: #92400e; font-size: 12px;">
            <strong>Rappel:</strong> Soyez pret(e) quelques minutes avant l'heure prevue.
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: ${primaryColor}; padding: 15px; text-align: center;">
        <p style="color: #ffffff; font-size: 12px; margin: 0;">${companyName} - Merci de votre confiance !</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request) {
  console.log('📧 API send-confirmation appelée');
  
  try {
    const { booking, config } = await request.json();
    
    if (!booking || !booking.customer?.email) {
      return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 });
    }
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Config SMTP manquante' }, { status: 500 });
    }
    
    const pdfBuffer = generateConfirmationPDFBuffer(booking, config);
    const companyName = config?.branding?.companyName || 'VTC Service';
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ionos.fr',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      tls: { rejectUnauthorized: false },
    });
    
    await transporter.verify();
    
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    
    await transporter.sendMail({
      from: `"${companyName}" <${fromEmail}>`,
      to: booking.customer.email,
      subject: `✅ Reservation Confirmée - ${companyName}`,
      html: getConfirmationEmailTemplate(booking, config),
      attachments: [{ filename: 'confirmation.pdf', content: pdfBuffer, contentType: 'application/pdf' }],
    });
    
    console.log('✅ Email confirmation envoyé');
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}