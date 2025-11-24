'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserWidgets } from '@/lib/firestore';

export default function IntegrationPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
      setWidgets(result.data);
      setSelectedWidget(result.data[0]);
    }
    setLoading(false);
  };

  const getIframeCode = () => {
    if (!selectedWidget) return '';
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `<iframe src="${siteUrl}/widget/${selectedWidget.id}" width="100%" height="800" frameborder="0" style="border-radius: 10px;"></iframe>`;
  };

  const getDirectLink = () => {
    if (!selectedWidget) return '';
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${siteUrl}/widget/${selectedWidget.id}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Integration</h1>
              <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                ← Retour
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun widget configure</h2>
            <p className="text-gray-700 mb-6">Vous devez d abord creer un widget pour obtenir le code d integration</p>
            <button 
              onClick={() => router.push('/dashboard/vehicles')} 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-xl transition font-bold"
            >
              Configurer mon widget
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integration Widget</h1>
              <p className="text-sm text-gray-600">Code d integration et apercu en direct</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Info banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Comment integrer ?</h3>
              <p className="text-white/90 text-sm">
                Copiez le code ci-dessous et collez-le sur votre site. Compatible WordPress, Wix, Shopify et tout site HTML.
              </p>
            </div>
          </div>
        </div>

        {/* Sélection widget si plusieurs */}
        {widgets.length > 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Selectionnez un widget</label>
            <select
              value={selectedWidget?.id || ''}
              onChange={(e) => setSelectedWidget(widgets.find(w => w.id === e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {widgets.map((widget) => (
                <option key={widget.id} value={widget.id}>
                  {widget.config?.branding?.companyName || `Widget ${widget.id.substring(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Colonne gauche */}
          <div className="space-y-6">
            
            {/* Widget ID */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">ID Widget</h3>
              </div>
              <div className="flex gap-2">
                <code className="flex-1 bg-gray-50 px-4 py-3 rounded-lg text-sm break-all border border-gray-200 font-mono text-gray-700">
                  {selectedWidget?.id}
                </code>
                <button 
                  onClick={() => handleCopy(selectedWidget?.id)} 
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold whitespace-nowrap"
                >
                  {copied ? '✓ OK' : 'Copier'}
                </button>
              </div>
            </div>

            {/* Lien direct */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Lien Direct</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Partagez ce lien directement</p>
              <div className="flex gap-2 mb-3">
                <code className="flex-1 bg-gray-50 px-4 py-3 rounded-lg text-sm break-all border border-gray-200 font-mono text-gray-700">
                  {getDirectLink()}
                </code>
                <button 
                  onClick={() => handleCopy(getDirectLink())} 
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold whitespace-nowrap"
                >
                  {copied ? '✓ OK' : 'Copier'}
                </button>
              </div>
              <button 
                onClick={() => window.open(getDirectLink(), '_blank')} 
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                Ouvrir dans un nouvel onglet
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </button>
            </div>

            {/* Code iframe */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Code iframe</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Pour WordPress, Wix, HTML...</p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto font-mono leading-relaxed">
{getIframeCode()}
                </pre>
                <button 
                  onClick={() => handleCopy(getIframeCode())} 
                  className="absolute top-3 right-3 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition font-semibold"
                >
                  {copied ? '✓ OK' : 'Copier'}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
              <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg">
                <span>📚</span>
                Instructions d integration
              </h4>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h5 className="font-bold text-purple-900 mb-2">WordPress</h5>
                  <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
                    <li>Allez dans <strong>Pages</strong> puis <strong>Modifier</strong></li>
                    <li>Ajoutez un <strong>bloc HTML personnalise</strong></li>
                    <li>Collez le code iframe</li>
                    <li>Publiez votre page</li>
                  </ol>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h5 className="font-bold text-purple-900 mb-2">Wix</h5>
                  <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
                    <li>Ajoutez un element <strong>Embed a Site</strong></li>
                    <li>Collez le lien direct</li>
                    <li>Ajustez la hauteur a 800px</li>
                  </ol>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h5 className="font-bold text-purple-900 mb-2">HTML / Site web</h5>
                  <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
                    <li>Collez le code iframe dans votre HTML</li>
                    <li>C est tout !</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            
            {/* Aperçu */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Apercu</h3>
                </div>
                <button 
                  onClick={() => window.open(getDirectLink(), '_blank')} 
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                >
                  Plein ecran →
                </button>
              </div>
              
              <div className="border-4 border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50">
                <iframe 
                  src={getDirectLink()} 
                  className="w-full h-[600px]" 
                  frameBorder="0"
                  title="Apercu widget"
                />
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm"
                >
                  ↻ Actualiser
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Informations Widget</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Date de creation</span>
                  <span className="font-semibold text-gray-900">
                    {selectedWidget?.createdAt?.toDate?.().toLocaleDateString('fr-FR') || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedWidget?.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedWidget?.isActive ? '✓ Actif' : '○ Inactif'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entreprise</span>
                  <span className="font-semibold text-gray-900">
                    {selectedWidget?.config?.branding?.companyName || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => router.push('/dashboard/vehicles')} 
            className="px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition font-semibold text-gray-700 hover:text-blue-600"
          >
            ⚙️ Modifier la configuration
          </button>
          <button 
            onClick={() => router.push('/dashboard/bookings')} 
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition font-bold"
          >
            📋 Voir les reservations
          </button>
        </div>
      </main>
    </div>
  );
}