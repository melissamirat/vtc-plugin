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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `<iframe src="${siteUrl}/widget/${selectedWidget.id}" width="100%" height="900px" frameborder="0" style="border: none;"></iframe>`;
  };

  const getDirectLink = () => {
    if (!selectedWidget) return '';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${siteUrl}/widget/${selectedWidget.id}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Code integration</h1>
              <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-gray-200 rounded-lg">
                Retour
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 mb-4">Configurez d abord un widget</p>
            <button onClick={() => router.push('/dashboard/settings')} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
              Configurer
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Code integration</h1>
              <p className="text-sm text-gray-600">Integrez votre widget</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-gray-200 rounded-lg">
              Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {widgets.length > 1 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <label className="block text-sm font-medium mb-2">Selectionnez un widget</label>
            <select
              value={selectedWidget?.id || ''}
              onChange={(e) => setSelectedWidget(widgets.find(w => w.id === e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {widgets.map((widget) => (
                <option key={widget.id} value={widget.id}>
                  {widget.config?.branding?.companyName || widget.id}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-6">
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Widget ID</h3>
              <div className="flex gap-2">
                <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg text-sm break-all">
                  {selectedWidget?.id}
                </code>
                <button onClick={() => handleCopy(selectedWidget?.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {copied ? 'OK' : 'Copier'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Lien direct</h3>
              <p className="text-sm text-gray-600 mb-3">Partagez ce lien</p>
              <div className="flex gap-2 mb-3">
                <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg text-sm break-all">
                  {getDirectLink()}
                </code>
                <button onClick={() => handleCopy(getDirectLink())} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {copied ? 'OK' : 'Copier'}
                </button>
              </div>
              <button onClick={() => window.open(getDirectLink(), '_blank')} className="text-sm text-blue-600">
                Ouvrir dans nouvel onglet
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Code iframe</h3>
              <p className="text-sm text-gray-600 mb-3">Pour WordPress, Wix, HTML...</p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{getIframeCode()}</pre>
                <button onClick={() => handleCopy(getIframeCode())} className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-xs rounded">
                  {copied ? 'OK' : 'Copier'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 mb-3">Instructions</h4>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <strong>WordPress</strong>
                  <ol className="list-decimal ml-5 mt-1">
                    <li>Pages puis Modifier</li>
                    <li>Bloc HTML</li>
                    <li>Collez iframe</li>
                    <li>Publiez</li>
                  </ol>
                </div>
                <div>
                  <strong>Wix</strong>
                  <ol className="list-decimal ml-5 mt-1">
                    <li>Embed a Site</li>
                    <li>Collez lien</li>
                    <li>900px hauteur</li>
                  </ol>
                </div>
                <div>
                  <strong>HTML</strong>
                  <ol className="list-decimal ml-5 mt-1">
                    <li>Collez iframe</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Apercu</h3>
                <button onClick={() => window.open(getDirectLink(), '_blank')} className="text-sm text-blue-600">
                  Plein ecran
                </button>
              </div>
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <iframe src={getDirectLink()} width="100%" height="900px" frameBorder="0" className="w-full" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Cree le</span>
                  <span className="font-semibold">
                    {selectedWidget?.createdAt?.toDate?.().toLocaleDateString('fr-FR') || '-'}
                  </span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Statut</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedWidget?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedWidget?.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entreprise</span>
                  <span className="font-semibold">{selectedWidget?.config?.branding?.companyName || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={() => router.push('/dashboard/settings')} className="flex-1 px-6 py-3 bg-gray-200 rounded-lg font-semibold">
            Modifier config
          </button>
          <button onClick={() => router.push('/dashboard/reservations')} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
            Voir reservations
          </button>
        </div>
      </main>
    </div>
  );
}