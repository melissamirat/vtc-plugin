'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: "🎨",
      title: "100% Personnalisable",
      description: "Adaptez les couleurs, tarifs et textes à votre marque en quelques clics"
    },
    {
      icon: "⚡",
      title: "Installation Instantanée",
      description: "Copiez-collez un code sur votre site. Prêt en 2 minutes chrono."
    },
    {
      icon: "📧",
      title: "Notifications Automatiques",
      description: "Recevez chaque réservation par email en temps réel"
    },
    {
      icon: "📱",
      title: "Mobile-First",
      description: "Interface parfaite sur tous les appareils, du mobile au desktop"
    },
    {
      icon: "💰",
      title: "Tarification Intelligente",
      description: "Calcul automatique basé sur la distance réelle, avec suppléments"
    },
    {
      icon: "🔒",
      title: "Sécurisé & Fiable",
      description: "Infrastructure Firebase, disponibilité 99.9%, vos données protégées"
    },
  ];

  const plans = [
    {
      name: "Basic",
      price: "19",
      popular: false,
      features: [
        "1 site web",
        "100 réservations / mois",
        "Emails automatiques",
        "Personnalisation complète",
        "Support par email",
        "Calcul de prix en temps réel"
      ]
    },
    {
      name: "Pro",
      price: "39",
      popular: true,
      features: [
        "3 sites web",
        "Réservations illimitées",
        "Emails + SMS",
        "Paiement Stripe intégré",
        "Support prioritaire",
        "Statistiques avancées",
        "Export CSV"
      ]
    },
    {
      name: "Enterprise",
      price: "79",
      popular: false,
      features: [
        "Sites illimités",
        "Réservations illimitées",
        "White-label complet",
        "API REST complète",
        "Support téléphone 24/7",
        "Intégrations Zapier",
        "Manager d'équipe"
      ]
    }
  ];

  const faqs = [
    {
      q: "Comment ça fonctionne exactement ?",
      a: "Vous créez un compte, configurez votre widget (couleurs, tarifs), puis copiez un simple code à ajouter sur votre site. C'est tout ! Les réservations arrivent automatiquement par email."
    },
    {
      q: "Fonctionne avec WordPress, Wix, Shopify ?",
      a: "Oui ! Notre widget fonctionne sur n'importe quel site web : WordPress, Wix, Shopify, Squarespace, site HTML... Si vous pouvez coller du code, ça marche."
    },
    {
      q: "Y a-t-il des frais cachés ?",
      a: "Non. Le prix affiché est le prix final. Pas de frais de setup, pas de commission sur les réservations. Vous payez juste l'abonnement mensuel."
    },
    {
      q: "Puis-je changer de plan plus tard ?",
      a: "Absolument ! Vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement est immédiat."
    },
    {
      q: "Les clients peuvent-ils payer directement ?",
      a: "Oui, sur les plans Pro et Enterprise, vous pouvez activer le paiement Stripe pour encaisser directement les acomptes ou paiements complets."
    },
    {
      q: "Que se passe-t-il si j'annule ?",
      a: "Vous pouvez annuler à tout moment. Votre widget restera actif jusqu'à la fin de la période payée. Aucun engagement, aucune pénalité."
    }
  ];

  const stats = [
    { number: "2 min", label: "Installation" },
    { number: "99.9%", label: "Disponibilité" },
    { number: "24/7", label: "Support" },
    { number: "0€", label: "Commission" }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">🚗 VTC Widget Pro</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">Tarifs</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition">FAQ</a>
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 transition">
                Connexion
              </Link>
              <Link 
                href="/auth/register"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left - Text */}
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                ✨ Le widget VTC le plus simple du marché
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transformez votre site en
                <span className="text-blue-600"> machine à réservations</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Ajoutez un formulaire de réservation professionnel sur votre site en 2 minutes. 
                Calcul automatique des prix, emails instantanés, 100% personnalisable.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/auth/register"
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🚀 Essayer gratuitement
                </Link>
                <a 
                  href="#demo"
                  className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-bold text-lg"
                >
                  👀 Voir la démo
                </a>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Installation en 2 min</span>
                </div>
              </div>
            </div>

            {/* Right - Mockup / Image */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ✓ En ligne
                </div>
                <img 
                  src="/api/placeholder/600/400" 
                  alt="Widget VTC Preview" 
                  className="rounded-lg w-full"
                />
                <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Dernière réservation</p>
                    <p className="font-bold text-gray-900">Il y a 2 minutes</p>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">42€</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="max-w-7xl mx-auto mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              Un widget complet, professionnel et facile à utiliser
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple comme bonjour
            </h2>
            <p className="text-xl text-gray-600">
              Opérationnel en moins de 5 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Créez votre compte</h3>
                <p className="text-gray-600">En 30 secondes. Email + mot de passe, c'est tout.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Personnalisez</h3>
                <p className="text-gray-600">Couleurs, tarifs, textes. Tout s'adapte à votre marque.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Intégrez</h3>
              <p className="text-gray-600">Copiez-collez le code sur votre site. C'est fini !</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le plan qui vous correspond. Changez quand vous voulez.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-2xl scale-105' 
                    : 'border-gray-200 hover:border-blue-200'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      ⭐ Populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}€</span>
                    <span className="text-gray-500 mb-2">/mois</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full py-3 px-6 rounded-lg font-bold text-center transition ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Commencer
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8">
            💳 Sans engagement • Résiliez quand vous voulez • Support inclus
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform ${activeFaq === index ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à booster vos réservations ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez les chauffeurs VTC qui ont déjà simplifié leur vie
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-bold text-lg shadow-xl"
          >
            🚀 Commencer gratuitement maintenant
          </Link>
          <p className="text-blue-100 mt-4 text-sm">
            Installation en 2 minutes • Sans engagement • Support inclus
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">© 2024 VTC Widget Pro. Tous droits réservés.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-white transition">CGV</a>
            <a href="#" className="hover:text-white transition">Confidentialité</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}