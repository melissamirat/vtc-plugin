'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserWidgets, updateVacationMode } from '@/lib/firestore';
import { defaultVacationMode } from '@/config/vehicleConfig';

export default function VacationPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [widgets, setWidgets] = useState([]);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [vacationMode, setVacationMode] = useState({
    enabled: false,
    message: 'Nous sommes actuellement en conges. Les reservations reprendront le {date}.',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;
    
    const widgetsResult = await getUserWidgets(user.uid);
    if (widgetsResult.success && widgetsResult.data.length > 0) {
      setWidgets(widgetsResult.data);
      const widget = widgetsResult.data[0];
      setCurrentWidget(widget);
      
      const config = widget.config?.vacationMode || defaultVacationMode;
      setVacationMode({
        ...config,
        startDate: config.startDate || '',
        endDate: config.endDate || ''
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentWidget) return;
    
    setSaving(true);
    const result = await updateVacationMode(currentWidget.id, vacationMode);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Mode vacances sauvegarde avec succes !' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
    
    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleToggle = (enabled) => {
    if (enabled && (!vacationMode.startDate || !vacationMode.endDate)) {
      setMessage({ type: 'error', text: 'Veuillez definir les dates de conges' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    setVacationMode({...vacationMode, enabled});
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mode vacances</h1>
              <p className="text-sm text-gray-600">Desactivez temporairement les reservations</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Status actuel */}
        <div className={`mb-8 p-6 rounded-xl border-2 ${vacationMode.enabled ? 'bg-orange-50 border-orange-300' : 'bg-green-50 border-green-300'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {vacationMode.enabled ? '🏖️ Mode vacances ACTIF' : '✅ Service ACTIF'}
              </h3>
              <p className="text-gray-700">
                {vacationMode.enabled 
                  ? 'Les reservations sont actuellement desactivees'
                  : 'Les clients peuvent effectuer des reservations normalement'
                }
              </p>
            </div>
            <button
              onClick={() => handleToggle(!vacationMode.enabled)}
              className={`px-6 py-3 rounded-lg font-bold text-white transition ${
                vacationMode.enabled 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {vacationMode.enabled ? 'Reactiver le service' : 'Activer mode vacances'}
            </button>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Configuration des conges</h3>

          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de debut *
                </label>
                <input
                  type="date"
                  value={vacationMode.startDate}
                  onChange={(e) => setVacationMode({...vacationMode, startDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {vacationMode.startDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(vacationMode.startDate)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="date"
                  value={vacationMode.endDate}
                  onChange={(e) => setVacationMode({...vacationMode, endDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {vacationMode.endDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(vacationMode.endDate)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message affiche aux clients *
              </label>
              <textarea
                value={vacationMode.message}
                onChange={(e) => setVacationMode({...vacationMode, message: e.target.value})}
                rows="4"
                placeholder="Message personnalise..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisez {'{date}'} pour inserer automatiquement la date de reprise
              </p>
            </div>

          </div>
        </div>

        {/* Apercu */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Apercu du message</h3>
          
          <div className="p-6 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏖️</div>
              <div>
                <h4 className="text-xl font-bold text-orange-900 mb-2">Service temporairement indisponible</h4>
                <p className="text-orange-800 leading-relaxed">
                  {vacationMode.message.replace('{date}', vacationMode.endDate ? formatDate(vacationMode.endDate) : '[date de reprise]')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="font-bold text-blue-900 mb-3">ℹ️ Comment ca fonctionne ?</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Quand le mode vacances est actif, le formulaire de reservation est masque</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Votre message personnalise s affiche a la place</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Le widget reste visible sur votre site, seules les reservations sont desactivees</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Pensez a reactiver le service a votre retour !</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:bg-gray-400 transition"
          >
            {saving ? 'Enregistrement...' : 'Sauvegarder la configuration'}
          </button>
        </div>

      </main>
    </div>
  );
}
