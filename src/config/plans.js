// src/config/plans.js

export const pricingPlans = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 19,
    currency: '€',
    interval: 'mois',
    stripePriceId: process.env.STRIPE_PRICE_ID_BASIC,
    features: [
      '1 site web',
      '100 réservations / mois',
      'Email automatique',
      'Personnalisation couleurs',
      'Support par email',
      'Calcul de prix en temps réel',
    ],
    limits: {
      websites: 1,
      bookingsPerMonth: 100,
      emailNotifications: true,
      smsNotifications: false,
      stripePayment: false,
      whiteLabel: false,
    },
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 39,
    currency: '€',
    interval: 'mois',
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO,
    popular: true,
    features: [
      '3 sites web',
      'Réservations illimitées',
      'Email + SMS automatiques',
      'Paiement Stripe intégré',
      'Personnalisation avancée',
      'Support prioritaire',
      'Statistiques détaillées',
      'Export CSV',
    ],
    limits: {
      websites: 3,
      bookingsPerMonth: -1,
      emailNotifications: true,
      smsNotifications: true,
      stripePayment: true,
      whiteLabel: false,
    },
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 79,
    currency: '€',
    interval: 'mois',
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
    features: [
      'Sites illimités',
      'Réservations illimitées',
      'White-label complet',
      'Domaines personnalisés',
      'API REST complète',
      'Webhooks personnalisés',
      'Support téléphone 24/7',
      'Manager d\'équipe',
      'Intégrations (Zapier, Google Calendar)',
      'Rapports avancés',
    ],
    limits: {
      websites: -1,
      bookingsPerMonth: -1,
      emailNotifications: true,
      smsNotifications: true,
      stripePayment: true,
      whiteLabel: true,
      apiAccess: true,
      customDomain: true,
    },
  },
};

export function getAllPlans() {
  return Object.values(pricingPlans);
}
