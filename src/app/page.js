'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState(null);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: "⚡",
      title: "Installation Express",
      description: "Widget pret en 120 secondes. Copier-coller, c est tout."
    },
    {
      icon: "🎨",
      title: "100% Personnalisable",
      description: "Couleurs, tarifs, textes adaptes a votre identite"
    },
    {
      icon: "📱",
      title: "Mobile-First",
      description: "Experience parfaite sur tous les appareils"
    },
    {
      icon: "💰",
      title: "Tarification Intelligente",
      description: "Calcul automatique distance reelle + supplements"
    },
    {
      icon: "📧",
      title: "Notifications Instantanees",
      description: "Chaque reservation arrive en temps reel"
    },
    {
      icon: "🔒",
      title: "Securite Enterprise",
      description: "Infrastructure Firebase 99.9% uptime"
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "19",
      popular: false,
      features: [
        "1 site web",
        "100 reservations/mois",
        "Emails automatiques",
        "Personnalisation complete",
        "Support email"
      ]
    },
    {
      name: "Professional",
      price: "39",
      popular: true,
      features: [
        "3 sites web",
        "Reservations illimitees",
        "Emails + SMS",
        "Paiement Stripe",
        "Support prioritaire",
        "Analytics avancees"
      ]
    },
    {
      name: "Enterprise",
      price: "79",
      popular: false,
      features: [
        "Sites illimites",
        "Reservations illimitees",
        "White-label complet",
        "API REST",
        "Support 24/7",
        "Manager equipe"
      ]
    }
  ];

  const faqs = [
    {
      q: "Comment fonctionne l installation ?",
      a: "Inscrivez-vous, configurez votre widget, copiez le code et collez-le sur votre site. 2 minutes chrono."
    },
    {
      q: "Compatible avec mon site ?",
      a: "Oui. WordPress, Wix, Shopify, HTML... Si vous pouvez coller du code, ca marche."
    },
    {
      q: "Y a-t-il des frais caches ?",
      a: "Non. Prix affiche = prix final. Pas de setup, pas de commission sur reservations."
    },
    {
      q: "Puis-je changer de plan ?",
      a: "Oui, upgrade ou downgrade quand vous voulez. Changement immediat."
    }
  ];

  return (
    <div className="bg-[#FBF8F3]">
      
      {/* Navigation fixe */}
      <nav className="fixed top-0 w-full z-50 bg-[#2C2420]/95 backdrop-blur-md border-b border-[#8B7355]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4A574] to-[#8B7355] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">V</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[#FBF8F3]">VTC Widget Pro</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#E8DCC4] hover:text-[#D4A574] transition font-medium">Fonctionnalites</a>
              <a href="#pricing" className="text-[#E8DCC4] hover:text-[#D4A574] transition font-medium">Tarifs</a>
              <a href="#faq" className="text-[#E8DCC4] hover:text-[#D4A574] transition font-medium">FAQ</a>
              <Link href="/auth/login" className="text-[#E8DCC4] hover:text-[#D4A574] transition font-medium">
                Connexion
              </Link>
              <Link 
                href="/auth/register"
                className="px-6 py-2.5 bg-gradient-to-r from-[#D4A574] to-[#8B7355] text-white rounded-full hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105"
              >
                Demarrer
              </Link>
            </div>
            <div className="md:hidden">
              <Link 
                href="/auth/register"
                className="px-4 py-2 bg-gradient-to-r from-[#D4A574] to-[#8B7355] text-white rounded-full text-sm font-semibold"
              >
                Demarrer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section avec animation */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 overflow-hidden bg-gradient-to-br from-[#2C2420] via-[#3D3330] to-[#2C2420]">
        {/* Effet de grille subtil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTIsMTY1LDExNiwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div 
              id="hero-text"
              data-animate
              className={`transition-all duration-1000 ${isVisible['hero-text'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              <div className="inline-block mb-6 px-4 py-2 bg-[#D4A574]/20 border border-[#D4A574]/30 rounded-full">
                <span className="text-[#D4A574] text-sm font-semibold">Widget VTC Premium</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FBF8F3] mb-6 leading-tight">
                Transformez votre site en
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#C4956C] mt-2">
                  machine a reservations
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-[#E8DCC4] mb-8 leading-relaxed">
                Widget professionnel integrable en 2 minutes. Calcul automatique, emails instantanes, 100% personnalisable.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/auth/register"
                  className="group px-8 py-4 bg-gradient-to-r from-[#D4A574] to-[#8B7355] text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-[#D4A574]/50 transition-all duration-300 hover:scale-105 text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    Commencer gratuitement
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </span>
                </Link>
                <a 
                  href="#demo"
                  className="px-8 py-4 bg-transparent border-2 border-[#D4A574] text-[#D4A574] rounded-full font-bold text-lg hover:bg-[#D4A574]/10 transition-all text-center"
                >
                  Voir la demo
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-[#E8DCC4]">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D4A574]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D4A574]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Setup en 2 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D4A574]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Support inclus</span>
                </div>
              </div>
            </div>

            <div 
              id="hero-image"
              data-animate
              className={`transition-all duration-1000 delay-300 ${isVisible['hero-image'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#D4A574] to-[#8B7355] rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-[#FBF8F3] rounded-2xl shadow-2xl p-6 border border-[#D4A574]/20">
                  <div className="aspect-video bg-gradient-to-br from-[#2C2420] to-[#3D3330] rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#D4A574] to-[#8B7355] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </div>
                      <p className="text-[#FBF8F3] font-semibold">Widget VTC</p>
                      <p className="text-[#8B7355] text-sm">Pret a integrer</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between p-4 bg-[#2C2420] rounded-lg">
                    <div>
                      <p className="text-xs text-[#8B7355]">Derniere reservation</p>
                      <p className="font-bold text-[#FBF8F3]">Il y a 2 minutes</p>
                    </div>
                    <div className="text-3xl font-bold text-[#D4A574]">42 euros</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 sm:py-16 bg-[#2C2420] border-y border-[#8B7355]/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "2 min", label: "Installation" },
              { number: "99.9%", label: "Disponibilite" },
              { number: "24/7", label: "Support" },
              { number: "0 euro", label: "Commission" }
            ].map((stat, index) => (
              <div 
                key={index}
                id={`stat-${index}`}
                data-animate
                className={`text-center transition-all duration-700 delay-${index * 100} ${isVisible[`stat-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div className="text-3xl sm:text-4xl font-bold text-[#D4A574] mb-2">{stat.number}</div>
                <div className="text-[#E8DCC4] text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 px-4 bg-[#FBF8F3]">
        <div className="max-w-7xl mx-auto">
          <div 
            id="features-title"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${isVisible['features-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2420] mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg sm:text-xl text-[#5C4F43] max-w-2xl mx-auto">
              Un widget complet, professionnel et facile a utiliser
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                id={`feature-${index}`}
                data-animate
                className={`group p-6 sm:p-8 bg-white rounded-2xl border border-[#E8DCC4] hover:border-[#D4A574] hover:shadow-xl transition-all duration-500 ${isVisible[`feature-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#2C2420] mb-3 group-hover:text-[#8B7355] transition-colors">{feature.title}</h3>
                <p className="text-[#5C4F43] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32 px-4 bg-gradient-to-br from-[#2C2420] to-[#3D3330]">
        <div className="max-w-7xl mx-auto">
          <div 
            id="pricing-title"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${isVisible['pricing-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FBF8F3] mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-lg sm:text-xl text-[#E8DCC4] max-w-2xl mx-auto">
              Choisissez le plan qui vous correspond
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                id={`plan-${index}`}
                data-animate
                className={`relative p-6 sm:p-8 rounded-2xl border-2 transition-all duration-700 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-[#D4A574] to-[#8B7355] border-[#D4A574] shadow-2xl scale-105' 
                    : 'bg-[#FBF8F3] border-[#8B7355]/30 hover:border-[#D4A574]'
                } ${isVisible[`plan-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#2C2420] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      Populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-[#2C2420]'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end justify-center gap-1">
                    <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-[#2C2420]'}`}>
                      {plan.price} euros
                    </span>
                    <span className={`mb-2 ${plan.popular ? 'text-white/80' : 'text-[#5C4F43]'}`}>/mois</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <svg className={`w-6 h-6 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-[#8B7355]'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className={plan.popular ? 'text-white' : 'text-[#5C4F43]'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full py-3 px-6 rounded-full font-bold text-center transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? 'bg-white text-[#8B7355] hover:shadow-xl'
                      : 'bg-gradient-to-r from-[#D4A574] to-[#8B7355] text-white hover:shadow-xl'
                  }`}
                >
                  Commencer
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-[#E8DCC4] mt-8">
            Sans engagement • Resiliez quand vous voulez • Support inclus
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-32 px-4 bg-[#FBF8F3]">
        <div className="max-w-3xl mx-auto">
          <div 
            id="faq-title"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${isVisible['faq-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2420] mb-4">
              Questions frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                id={`faq-${index}`}
                data-animate
                className={`bg-white rounded-xl shadow-sm border border-[#E8DCC4] overflow-hidden hover:shadow-md transition-all duration-500 ${isVisible[`faq-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-[#FBF8F3] transition-colors"
                >
                  <span className="font-semibold text-[#2C2420]">{faq.q}</span>
                  <svg 
                    className={`w-5 h-5 text-[#8B7355] transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? 'max-h-96' : 'max-h-0'}`}
                >
                  <div className="px-6 pb-4 text-[#5C4F43]">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 sm:py-32 px-4 bg-gradient-to-r from-[#2C2420] via-[#3D3330] to-[#2C2420] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTIsMTY1LDExNiwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div 
          id="cta"
          data-animate
          className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible['cta'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FBF8F3] mb-6">
            Pret a booster vos reservations ?
          </h2>
          <p className="text-lg sm:text-xl text-[#E8DCC4] mb-8 max-w-2xl mx-auto">
            Rejoignez les professionnels VTC qui ont simplifie leur activite
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#D4A574] to-[#8B7355] text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-[#D4A574]/50 transition-all duration-300 hover:scale-105"
          >
            Commencer gratuitement maintenant
          </Link>
          <p className="text-[#E8DCC4] mt-6 text-sm">
            Installation en 2 minutes • Sans engagement • Support inclus
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1512] text-[#8B7355] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">2024 VTC Widget Pro. Tous droits reserves.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-[#D4A574] transition">CGV</a>
            <a href="#" className="hover:text-[#D4A574] transition">Confidentialite</a>
            <a href="#" className="hover:text-[#D4A574] transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}