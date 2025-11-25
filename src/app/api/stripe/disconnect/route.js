import { NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { accountId } = await request.json();
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId requis' },
        { status: 400 }
      );
    }

    // Supprimer le compte Stripe Connect
    await stripe.accounts.del(accountId);

    return NextResponse.json({
      success: true,
      message: 'Compte Stripe déconnecté'
    });

  } catch (error) {
    console.error('Erreur déconnexion Stripe:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}