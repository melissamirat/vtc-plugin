import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const data = await request.json();

    // Configuration du transporteur email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ou 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Créer le contenu HTML de l'email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #2563eb; margin-bottom: 30px; text-align: center;">
            🚗 NOUVELLE RÉSERVATION VTC
          </h1>
          
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #2563eb;">
            <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 10px;">👤 Informations Client</h2>
            <p style="margin: 5px 0;"><strong>Nom :</strong> ${data.nom} ${data.prenom}</p>
            <p style="margin: 5px 0;"><strong>📞 Téléphone :</strong> ${data.telephone}</p>
            <p style="margin: 5px 0;"><strong>📧 Email :</strong> ${data.email || 'Non renseigné'}</p>
          </div>

          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #10b981;">
            <h2 style="color: #059669; font-size: 18px; margin-bottom: 10px;">🚘 Détails du Véhicule</h2>
            <p style="margin: 5px 0;"><strong>Type :</strong> ${data.typeVehicule}</p>
            <p style="margin: 5px 0;"><strong>Nombre de passagers :</strong> ${data.nombrePassagers}</p>
          </div>

          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #f59e0b;">
            <h2 style="color: #d97706; font-size: 18px; margin-bottom: 10px;">📍 Trajet</h2>
            <p style="margin: 5px 0;"><strong>Départ :</strong> ${data.adresseDepart}</p>
            <p style="margin: 5px 0;"><strong>Arrivée :</strong> ${data.adresseArrivee}</p>
          </div>

          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #8b5cf6;">
            <h2 style="color: #7c3aed; font-size: 18px; margin-bottom: 10px;">📅 Date et Heure</h2>
            <p style="margin: 5px 0;"><strong>Date :</strong> ${data.dateReservation}</p>
            <p style="margin: 5px 0;"><strong>Heure :</strong> ${data.heureReservation}</p>
          </div>

          ${data.commentaires ? `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #fbbf24;">
            <h2 style="color: #d97706; font-size: 18px; margin-bottom: 10px;">💬 Commentaires</h2>
            <p style="margin: 5px 0;">${data.commentaires}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>⏰ Réservation reçue le ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>
    `;

    // Configuration de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🚗 Nouvelle réservation VTC - ${data.nom} ${data.prenom}`,
      html: htmlContent,
      text: `
NOUVELLE RÉSERVATION VTC

Client: ${data.nom} ${data.prenom}
Téléphone: ${data.telephone}
Email: ${data.email || 'Non renseigné'}

Véhicule: ${data.typeVehicule}
Passagers: ${data.nombrePassagers}

Trajet:
Départ: ${data.adresseDepart}
Arrivée: ${data.adresseArrivee}

Date: ${data.dateReservation} à ${data.heureReservation}

Commentaires: ${data.commentaires || 'Aucun'}

Réservation reçue le ${new Date().toLocaleString('fr-FR')}
      `
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Réservation envoyée par email avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de l\'envoi de l\'email: ' + error.message 
    }, { status: 500 });
  }
}