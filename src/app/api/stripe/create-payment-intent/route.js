import { NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { 
      amount, 
      accountId, 
      bookingId, 
      customerEmail,
      customerName 
    } = await request.json();
    
    if (!amount || !accountId) {
      return NextResponse.json(
        { error: 'amount et accountId requis' },
        { status: 400 }
      );
    }

    // Créer un Payment Intent avec transfert vers le compte connecté
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      transfer_data: {
        destination: accountId,
      },
      application_fee_amount: Math.round(amount * 100 * 0.02), // Commission 2%
      metadata: {
        bookingId: bookingId,
        customerEmail: customerEmail,
        customerName: customerName
      },
      receipt_email: customerEmail,
      description: `Réservation VTC #${bookingId}`
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Erreur création Payment Intent:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}