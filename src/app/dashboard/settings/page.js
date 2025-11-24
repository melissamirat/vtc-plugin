'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserWidgets, updateWidget } from '@/lib/firestore';

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [currentWidget, setCurrentWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('branding');
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now()); // Pour forcer le refresh de l'iframe

  // Détecter le hash dans l'URL pour ouvrir le bon onglet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['branding', 'texts', 'email', 'export'].includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  // Configuration par défaut
  const defaultConfig = {
    branding: {
      companyName: '',
      logo: '',
      primaryColor: '#2563eb',
      secondaryColor: '#ffffff',
      accentColor: '#3b82f6',
    },
    texts: {
      formTitle: 'Réservation VTC',
      formSubtitle: 'Calculez votre prix et réservez en quelques clics',
      submitButton: 'Réserver & Confirmer le Prix',
    },
    email: {
      adminEmail: '',
      fromName: '',
    },
  };

  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadWidgets();
  }, [user, router]);

  const loadWidgets = async () => {
    if (!user) return;

    const result = await getUserWidgets(user.uid);
    if (result.success && result.data.length > 0) {
      const widget = result.data[0];
      setCurrentWidget(widget);
      
      // Fusionner avec les valeurs par défaut
      setConfig({
        branding: {
          ...defaultConfig.branding,
          ...widget.config?.branding,
        },
        texts: {
          ...defaultConfig.texts,
          ...widget.config?.texts,
        },
        email: {
          ...defaultConfig.email,
          ...widget.config?.email,
        },
      });
    }
    setLoading(false);
  };

  const handleChange = (section, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!currentWidget) return;
    
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateWidget(currentWidget.id, {
        'config.branding': config.branding,
        'config.texts': config.texts,
        'config.email': config.email,
      });

      if (result.success) {
        setMessage({ type: 'success', text: '✅ Configuration enregistrée avec succès !' });
        setIframeKey(Date.now()); // Rafraîchir l'iframe pour voir les changements
      } else {
        setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ ' + error.message });
    }

    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWidgetUrl = () => {
    if (typeof window !== 'undefined' && currentWidget) {
      return `${window.location.origin}/widget/${currentWidget.id}`;
    }
    return '';
  };

  const getIframeCode = () => {
    return `<iframe 
  src="${getWidgetUrl()}" 
  width="100%" 
  height="800" 
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>`;
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">⚙️ Paramètres du Widget</h1>
              <p className="text-sm text-gray-600">Personnalisez l'apparence de votre formulaire de réservation</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow">
          {[
            { id: 'branding', label: '🎨 Apparence', icon: '🎨' },
            { id: 'texts', label: '✏️ Textes', icon: '✏️' },
            { id: 'email', label: '📧 Email', icon: '📧' },
            { id: 'export', label: '🚀 Exporter', icon: '🚀' },
          ].map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Branding */}
            {activeTab === 'branding' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">🎨 Personnalisation visuelle</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom de votre entreprise
                    </label>
                    <input
                      type="text"
                      value={config.branding.companyName}
                      onChange={(e) => handleChange('branding', 'companyName', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VTC Premium Paris"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL du logo (optionnel)
                    </label>
                    <input
                      type="url"
                      value={config.branding.logo}
                      onChange={(e) => handleChange('branding', 'logo', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="https://exemple.com/mon-logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">Taille recommandée : 200x60 pixels</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Couleur principale
                      </label>
                      <div className="flex gap-2 items-center">
                        <div 
                          className="w-14 h-14 rounded-xl border-4 border-white shadow-lg cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: config.branding.primaryColor }}
                        >
                          <input
                            type="color"
                            value={config.branding.primaryColor}
                            onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={config.branding.primaryColor}
                          onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Couleur secondaire
                      </label>
                      <div className="flex gap-2 items-center">
                        <div 
                          className="w-14 h-14 rounded-xl border-4 border-gray-200 shadow-lg cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: config.branding.secondaryColor }}
                        >
                          <input
                            type="color"
                            value={config.branding.secondaryColor}
                            onChange={(e) => handleChange('branding', 'secondaryColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={config.branding.secondaryColor}
                          onChange={(e) => handleChange('branding', 'secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Couleur d'accent
                      </label>
                      <div className="flex gap-2 items-center">
                        <div 
                          className="w-14 h-14 rounded-xl border-4 border-white shadow-lg cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: config.branding.accentColor }}
                        >
                          <input
                            type="color"
                            value={config.branding.accentColor}
                            onChange={(e) => handleChange('branding', 'accentColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={config.branding.accentColor}
                          onChange={(e) => handleChange('branding', 'accentColor', e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Palettes prédéfinies */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Palettes suggérées
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { name: 'Bleu Pro', primaryColor: '#2563eb', secondaryColor: '#ffffff', accentColor: '#3b82f6' },
                        { name: 'Noir Luxe', primaryColor: '#1f2937', secondaryColor: '#ffffff', accentColor: '#6b7280' },
                        { name: 'Vert Nature', primaryColor: '#059669', secondaryColor: '#ffffff', accentColor: '#10b981' },
                        { name: 'Violet Élégant', primaryColor: '#7c3aed', secondaryColor: '#ffffff', accentColor: '#8b5cf6' },
                        { name: 'Rouge Passion', primaryColor: '#dc2626', secondaryColor: '#ffffff', accentColor: '#ef4444' },
                        { name: 'Or Premium', primaryColor: '#b45309', secondaryColor: '#fffbeb', accentColor: '#f59e0b' },
                        { name: 'Rose Moderne', primaryColor: '#db2777', secondaryColor: '#ffffff', accentColor: '#ec4899' },
                        { name: 'Cyan Tech', primaryColor: '#0891b2', secondaryColor: '#ffffff', accentColor: '#06b6d4' },
                      ].map((palette) => (
                        <button
                          key={palette.name}
                          type="button"
                          onClick={() => {
                            setConfig(prev => ({
                              ...prev,
                              branding: { 
                                ...prev.branding, 
                                primaryColor: palette.primaryColor,
                                secondaryColor: palette.secondaryColor,
                                accentColor: palette.accentColor,
                              }
                            }));
                          }}
                          className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left"
                        >
                          <div className="flex gap-1 mb-2">
                            <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: palette.primaryColor }}></div>
                            <div className="w-8 h-8 rounded-lg shadow-sm border border-gray-200" style={{ backgroundColor: palette.secondaryColor }}></div>
                            <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: palette.accentColor }}></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{palette.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Textes */}
            {activeTab === 'texts' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">✏️ Textes personnalisables</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Titre du formulaire
                    </label>
                    <input
                      type="text"
                      value={config.texts.formTitle}
                      onChange={(e) => handleChange('texts', 'formTitle', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Réservation VTC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sous-titre
                    </label>
                    <input
                      type="text"
                      value={config.texts.formSubtitle}
                      onChange={(e) => handleChange('texts', 'formSubtitle', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Calculez votre prix et réservez en quelques clics"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Texte du bouton de réservation
                    </label>
                    <input
                      type="text"
                      value={config.texts.submitButton}
                      onChange={(e) => handleChange('texts', 'submitButton', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Réserver & Confirmer le Prix"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab Email */}
            {activeTab === 'email' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">📧 Notifications Email</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Votre email (où recevoir les réservations) *
                    </label>
                    <input
                      type="email"
                      value={config.email.adminEmail}
                      onChange={(e) => handleChange('email', 'adminEmail', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@votre-vtc.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Les réservations seront envoyées automatiquement à cette adresse
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom de l'expéditeur
                    </label>
                    <input
                      type="text"
                      value={config.email.fromName}
                      onChange={(e) => handleChange('email', 'fromName', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="VTC Premium"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      ℹ️ <strong>Pas de configuration technique nécessaire !</strong><br />
                      Nous gérons l'envoi des emails pour vous. Vous recevrez automatiquement une notification à chaque nouvelle réservation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Export */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                {/* Lien direct */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🔗 Lien direct</h3>
                  <p className="text-gray-600 mb-4">Partagez ce lien pour permettre à vos clients de réserver directement.</p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getWidgetUrl()}
                      className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(getWidgetUrl())}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {copied ? '✓ Copié !' : '📋 Copier'}
                    </button>
                  </div>

                  <a
                    href={getWidgetUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    🔗 Ouvrir dans un nouvel onglet →
                  </a>
                </div>

                {/* iFrame */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📦 Code iFrame</h3>
                  <p className="text-gray-600 mb-4">Intégrez ce code sur votre site WordPress, Wix, ou HTML.</p>
                  
                  <div className="relative">
                    <pre className="p-4 bg-gray-900 text-green-400 rounded-xl text-sm overflow-x-auto">
                      {getIframeCode()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(getIframeCode())}
                      className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
                    >
                      {copied ? '✓ Copié !' : 'Copier'}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3">💡 Comment intégrer sur votre site ?</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li><strong>WordPress :</strong> Ajoutez un bloc "HTML personnalisé" et collez le code iFrame</li>
                    <li><strong>Wix :</strong> Utilisez l'élément "Embed HTML" dans l'éditeur</li>
                    <li><strong>Squarespace :</strong> Ajoutez un bloc "Code" dans votre page</li>
                    <li><strong>Site HTML :</strong> Collez directement le code dans votre fichier HTML</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Bouton Sauvegarder */}
            {activeTab !== 'export' && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
              </button>
            )}
          </div>

          {/* Aperçu RÉEL en iframe */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">👁️ Aperçu en direct</h3>
                  {currentWidget && (
                    <a
                      href={`/widget/${currentWidget.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      Ouvrir ↗
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Sauvegardez pour voir les changements
                </p>
              </div>
              
              {/* iframe du vrai formulaire */}
              {currentWidget ? (
                <div className="relative bg-gray-100" style={{ height: '600px' }}>
                  <iframe
                    key={iframeKey}
                    src={`/widget/${currentWidget.id}`}
                    className="w-full h-full border-0"
                    title="Aperçu du formulaire"
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Chargement de l'aperçu...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}