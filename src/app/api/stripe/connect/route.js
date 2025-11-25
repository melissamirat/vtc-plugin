import { NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { userId, widgetId } = await request.json();
    
    if (!userId || !widgetId) {
      return NextResponse.json(
        { error: 'userId et widgetId requis' },
        { status: 400 }
      );
    }

    // Vérifier que la clé Stripe est présente
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY manquante dans .env.local');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500 }
      );
    }

    console.log('🔑 Création compte Stripe Connect...');

    // Créer un compte Stripe Connect
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: userId,
        widgetId: widgetId
      }
    });

    console.log('✅ Compte créé:', account.id);

    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment?success=true&account=${account.id}`,
      type: 'account_onboarding',
    });

    console.log('✅ Lien créé:', accountLink.url);

    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id
    });

  } catch (error) {
    console.error('❌ Erreur Stripe Connect:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}