// src/app/api/send-booking/route.js
// API pour envoyer la confirmation de réservation par email (client + admin)
// VERSION 5 - Compatible avec useBookingSubmit

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";

// Générateur de PDF COMPACT
function generateOrderPDFBuffer(booking, config) {
  const doc = new jsPDF();
  const primaryColor = config?.branding?.primaryColor || "#2563eb";
  const companyName = config?.branding?.companyName || "VTC Service";

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 37, g: 99, b: 235 };
  };

  const rgb = hexToRgb(primaryColor);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // ═══════════════════════════════════════════════════════════════
  // EN-TÊTE (compact)
  // ═══════════════════════════════════════════════════════════════
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(companyName, margin, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Service VTC", margin, 25);

  // Numéro et date à droite
  const orderNumber = booking.id
    ? `N° ${String(booking.id).slice(-8).toUpperCase()}`
    : `N° ${Date.now().toString(36).toUpperCase()}`;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(orderNumber, pageWidth - margin, 15, { align: "right" });

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(today, pageWidth - margin, 23, { align: "right" });

  // ═══════════════════════════════════════════════════════════════
  // TITRE
  // ═══════════════════════════════════════════════════════════════
  let y = 42;
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("BON DE COMMANDE", pageWidth / 2, y, { align: "center" });

  // ═══════════════════════════════════════════════════════════════
  // INFORMATIONS CLIENT (compact)
  // ═══════════════════════════════════════════════════════════════
  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, "F");

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENT", margin + 4, y + 8);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(booking.customer?.name || "Client", margin + 4, y + 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `${booking.customer?.email || "-"}  |  ${booking.customer?.phone || "-"}`,
    margin + 4,
    y + 26
  );

  // Passagers/bagages à droite
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  const paxText = `${booking.passengers || 1} Passagers`;
  const lugText = booking.luggage ? ` - ${booking.luggage} Bagages` : "";
  doc.text(paxText + lugText, pageWidth - margin - 4, y + 17, {
    align: "right",
  });

  // ═══════════════════════════════════════════════════════════════
  // TRAJET (compact)
  // ═══════════════════════════════════════════════════════════════
  y += 38;

  // Titre section
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("TRAJET", margin + 4, y + 6);

  y += 12;

  // Départ
  doc.setFillColor(34, 197, 94);
  doc.circle(margin + 5, y + 2, 3, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const departText =
    booking.departure?.address || booking.departureAddress || "-";
  const departShort =
    departText.length > 70 ? departText.substring(0, 70) + "..." : departText;
  doc.text(departShort, margin + 12, y + 4);

  y += 12;

  // Arrivée
  doc.setFillColor(239, 68, 68);
  doc.circle(margin + 5, y + 2, 3, "F");
  const arrivalText = booking.arrival?.address || booking.arrivalAddress || "-";
  const arrivalShort =
    arrivalText.length > 70
      ? arrivalText.substring(0, 70) + "..."
      : arrivalText;
  doc.text(arrivalShort, margin + 12, y + 4);

  // ═══════════════════════════════════════════════════════════════
  // DATE / HEURE / VEHICULE / DISTANCE (une ligne)
  // ═══════════════════════════════════════════════════════════════
  y += 15;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "F");

  const colWidth = contentWidth / 4;

  // Date
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("DATE", margin + 4, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  let displayDate = booking.date || "-";
  if (displayDate && displayDate !== "-" && displayDate.includes("-")) {
    const parts = displayDate.split("-");
    if (parts.length === 3) {
      displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  doc.text(displayDate, margin + 4, y + 16);

  // Heure
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("HEURE", margin + colWidth + 4, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(booking.time || "-", margin + colWidth + 4, y + 16);

  // Véhicule
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("VEHICULE", margin + colWidth * 2 + 4, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const vehicleName = booking.vehicle?.name || booking.vehicle || "-";
  const vehicleShort =
    vehicleName.length > 15
      ? vehicleName.substring(0, 15) + "..."
      : vehicleName;
  doc.text(vehicleShort, margin + colWidth * 2 + 4, y + 16);

  // Distance
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("DISTANCE", margin + colWidth * 3 + 4, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`${booking.distance || "-"} km`, margin + colWidth * 3 + 4, y + 16);

  // ═══════════════════════════════════════════════════════════════
  // TOTAL (gros et visible)
  // ═══════════════════════════════════════════════════════════════
  y += 32;

  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL", margin + 10, y + 15);

  const pricing = booking.pricing || {};
  const totalPrice =
    pricing.priceEstimate || pricing.total || booking.price || 0;
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${Number(totalPrice).toFixed(2)} EUR`,
    pageWidth - margin - 10,
    y + 24,
    { align: "right" }
  );

  // ═══════════════════════════════════════════════════════════════
  // MODE DE PAIEMENT
  // ═══════════════════════════════════════════════════════════════
  y += 42;

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (booking.paymentMethod) {
    doc.text(`Paiement: ${booking.paymentMethod}`, margin, y);
  }

  // ═══════════════════════════════════════════════════════════════
  // COMMENTAIRES (si présents)
  // ═══════════════════════════════════════════════════════════════
  if (booking.comments && booking.comments.trim()) {
    y += 10;
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, "F");

    doc.setTextColor(146, 64, 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Commentaires:", margin + 4, y + 8);
    doc.setFont("helvetica", "normal");
    const commentShort =
      booking.comments.length > 80
        ? booking.comments.substring(0, 80) + "..."
        : booking.comments;
    doc.text(commentShort, margin + 4, y + 16);
  }

  // ═══════════════════════════════════════════════════════════════
  // PIED DE PAGE
  // ═══════════════════════════════════════════════════════════════
  y += 30;

  doc.setDrawColor(rgb.r, rgb.g, rgb.b);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${companyName} - Merci de votre confiance !`,
    pageWidth / 2,
    y + 8,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}

// Template email HTML pour le client (demande reçue)
function getClientEmailTemplate(booking, config) {
  const companyName = config?.branding?.companyName || "VTC Service";
  const primaryColor = config?.branding?.primaryColor || "#2563eb";
  const totalPrice =
    booking.pricing?.priceEstimate ||
    booking.pricing?.total ||
    booking.price ||
    0;
  const vehicleName = booking.vehicle?.name || booking.vehicle || "-";

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
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${companyName}</h1>
        <p style="color: #ffffff; opacity: 0.9; margin: 8px 0 0 0;">Demande de reservation recue</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 25px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Bonjour ${
          booking.customer?.name || ""
        },</h2>
        <p style="color: #4b5563; line-height: 1.5; margin: 0 0 15px 0;">
          Nous avons bien recu votre demande. Vous trouverez ci-joint votre bon de commande.
        </p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0;">
          <p style="margin: 0; color: #92400e; font-size: 13px;">
            <strong>⏳ En attente de confirmation</strong><br>
            Nous vous enverrons un email de confirmation rapidement.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
            <tr>
              <td style="color: #6b7280;">Date</td>
              <td style="color: #1f2937; font-weight: 600; text-align: right;">${
                booking.date || "-"
              } a ${booking.time || "-"}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Depart</td>
              <td style="color: #1f2937; text-align: right;">${
                booking.departure?.address || booking.departureAddress || "-"
              }</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Arrivee</td>
              <td style="color: #1f2937; text-align: right;">${
                booking.arrival?.address || booking.arrivalAddress || "-"
              }</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Vehicule</td>
              <td style="color: #1f2937; font-weight: 600; text-align: right;">${vehicleName}</td>
            </tr>
          </table>
          <div style="border-top: 2px solid ${primaryColor}; margin-top: 12px; padding-top: 12px; text-align: right;">
            <span style="color: #1f2937; font-size: 14px;">Total: </span>
            <span style="color: ${primaryColor}; font-size: 22px; font-weight: bold;">${Number(
    totalPrice
  ).toFixed(2)} EUR</span>
          </div>
        </div>
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

// Template email HTML pour l'admin
function getAdminEmailTemplate(booking, config) {
  const companyName = config?.branding?.companyName || "VTC Service";
  const primaryColor = config?.branding?.primaryColor || "#2563eb";
  const totalPrice =
    booking.pricing?.priceEstimate ||
    booking.pricing?.total ||
    booking.price ||
    0;
  const vehicleName = booking.vehicle?.name || booking.vehicle || "-";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background-color: #1f2937; padding: 15px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 18px;">🚗 Nouvelle Reservation</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
          <Link href="/dashboard/reservations">
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 15px; cursor: pointer;">
              <p style="margin: 0; color: #92400e; font-weight: bold; font-size: 13px;">⚡ Action requise</p>
            </div>
          </Link>
        
        <table width="100%" cellpadding="6" style="font-size: 13px; margin-bottom: 15px;">
          <tr style="background-color: #f9fafb;">
            <td style="color: #6b7280; width: 80px;">Client</td>
            <td style="color: #1f2937; font-weight: bold;">${
              booking.customer?.name || "-"
            }</td>
          </tr>
          <tr>
            <td style="color: #6b7280;">Email</td>
            <td style="color: #1f2937;">${booking.customer?.email || "-"}</td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <td style="color: #6b7280;">Tel</td>
            <td style="color: #1f2937; font-weight: bold;">${
              booking.customer?.phone || "-"
            }</td>
          </tr>
          <tr>
            <td style="color: #6b7280;">Date</td>
            <td style="color: #1f2937;">${booking.date || "-"} a ${
    booking.time || "-"
  }</td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <td style="color: #6b7280;">Depart</td>
            <td style="color: #1f2937;">${
              booking.departure?.address || booking.departureAddress || "-"
            }</td>
          </tr>
          <tr>
            <td style="color: #6b7280;">Arrivee</td>
            <td style="color: #1f2937;">${
              booking.arrival?.address || booking.arrivalAddress || "-"
            }</td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <td style="color: #6b7280;">Vehicule</td>
            <td style="color: #1f2937;">${vehicleName}</td>
          </tr>
          <tr>
            <td style="color: #6b7280;">Distance</td>
            <td style="color: #1f2937;">${booking.distance || "-"} km</td>
          </tr>
        </table>
        
        <div style="background-color: #ecfdf5; border-radius: 8px; padding: 15px; text-align: center;">
          <p style="margin: 0; color: #059669; font-size: 28px; font-weight: bold;">${Number(
            totalPrice
          ).toFixed(2)} EUR</p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 11px;">${
            booking.paymentMethod || ""
          }</p>
        </div>
        
        ${
          booking.comments
            ? `<div style="background-color: #fef3c7; padding: 10px; border-radius: 5px; color: #92400e; margin-top: 15px; font-size: 12px;"><strong>💬</strong> ${booking.comments}</div>`
            : ""
        }
      </td>
    </tr>
    <tr>
      <td style="background-color: #1f2937; padding: 10px; text-align: center;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">${companyName}</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request) {
  console.log("📧 API send-booking appelée");

  try {
    const { booking, config, adminEmail } = await request.json();

    console.log("📦 Booking reçu:", JSON.stringify({
      customer: booking?.customer,
      trip: booking?.trip,
      distance: booking?.distance,
      pricing: booking?.pricing,
    }, null, 2));

    if (!booking || !booking.customer) {
      return NextResponse.json(
        { success: false, error: "Données invalides" },
        { status: 400 }
      );
    }

    // Normaliser les données (supporter les deux formats)
    const normalizedBooking = {
      ...booking,
      // Nom complet du client
      customer: {
        name: booking.customer.name || 
               `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim(),
        email: booking.customer.email,
        phone: booking.customer.phone,
      },
      // Date et heure (supporter trip.date/time et date/time direct)
      date: booking.date || booking.trip?.date || '-',
      time: booking.time || booking.trip?.time || '-',
      // Adresses (supporter departure.address et departureAddress)
      departure: {
        address: booking.departure?.address || booking.departureAddress || '-',
      },
      arrival: {
        address: booking.arrival?.address || booking.arrivalAddress || '-',
      },
      departureAddress: booking.departure?.address || booking.departureAddress || '-',
      arrivalAddress: booking.arrival?.address || booking.arrivalAddress || '-',
      // Distance (essayer plusieurs sources)
      distance: booking.distance || 
                booking.pricing?.distanceKm || 
                booking.priceBreakdown?.distanceKm || 
                '-',
      // Prix (essayer plusieurs sources)
      price: booking.price || 
             booking.pricing?.finalPrice || 
             booking.pricing?.total || 
             booking.payment?.amount || 
             0,
      // Pricing normalisé
      pricing: {
        ...booking.pricing,
        priceEstimate: booking.pricing?.finalPrice || 
                       booking.pricing?.total || 
                       booking.payment?.amount ||
                       booking.price || 
                       0,
        total: booking.pricing?.finalPrice || 
               booking.pricing?.total || 
               booking.payment?.amount ||
               booking.price || 
               0,
      },
      // Méthode de paiement
      paymentMethod: booking.payment?.method || booking.paymentMethod || 'onBoard',
      // Commentaires
      comments: booking.comments || '',
      // Passagers et bagages
      passengers: booking.passengers || 1,
      luggage: booking.luggage || 0,
      // Véhicule
      vehicle: booking.vehicle || { name: 'Véhicule', id: 'standard' },
    };

    console.log("✅ Booking normalisé:", JSON.stringify({
      customerName: normalizedBooking.customer.name,
      date: normalizedBooking.date,
      time: normalizedBooking.time,
      distance: normalizedBooking.distance,
      price: normalizedBooking.price,
    }, null, 2));

    const customerEmail = normalizedBooking.customer.email;
    
    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: "Email client manquant" },
        { status: 400 }
      );
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn("⚠️ Config SMTP manquante - email non envoyé");
      return NextResponse.json(
        { success: true, warning: "Email non configuré" },
        { status: 200 }
      );
    }

    const pdfBuffer = generateOrderPDFBuffer(normalizedBooking, config);
    const companyName = config?.branding?.companyName || "VTC Service";

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ionos.fr",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    // Email client
    await transporter.sendMail({
      from: `"${companyName}" <${fromEmail}>`,
      to: customerEmail,
      subject: `Votre demande de réservation - ${companyName}`,
      html: getClientEmailTemplate(normalizedBooking, config),
      attachments: [
        {
          filename: "demande-reservation.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("✅ Email client envoyé à:", customerEmail);

    // Email admin
    const adminAddr = adminEmail || config?.email?.adminEmail || config?.adminEmail;
    if (adminAddr) {
      await transporter.sendMail({
        from: `"${companyName}" <${fromEmail}>`,
        to: adminAddr,
        subject: `Nouvelle réservation - ${normalizedBooking.customer.name || "Client"}`,
        html: getAdminEmailTemplate(normalizedBooking, config),
        attachments: [
          {
            filename: "demande-reservation.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
      
      console.log("✅ Email admin envoyé à:", adminAddr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur send-booking:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}