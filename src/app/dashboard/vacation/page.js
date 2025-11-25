'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserWidgets, updateVacationMode } from '@/lib/firestore';
// import { defaultVacationMode } from '@/config/vehicleConfig'; // Commenté car non défini ici

const defaultVacationMode = {
  enabled: false,
  message: 'Nous sommes actuellement en congés. Les réservations reprendront le {date}.',
  startDate: '',
  endDate: ''
};

export default function VacationPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [currentWidget, setCurrentWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [vacationMode, setVacationMode] = useState(defaultVacationMode);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;
    
    // Assurez-vous que l'importation est correcte si vous utilisez un appel dynamique
    const { getUserWidgets } = await import('@/lib/firestore');
    
    const widgetsResult = await getUserWidgets(user.uid);
    if (widgetsResult.success && widgetsResult.data.length > 0) {
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
    
    // Validation des dates si le mode est activé
    if (vacationMode.enabled && (!vacationMode.startDate || !vacationMode.endDate)) {
        setMessage({ type: 'error', text: 'Veuillez définir les dates de congés pour activer le mode vacances.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return;
    }

    setSaving(true);
    const result = await updateVacationMode(currentWidget.id, vacationMode);
    
    if (result.success) {
      setMessage({ type: 'success', text: '✓ Mode vacances sauvegardé avec succès !' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
    
    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleToggle = (enabled) => {
    if (enabled && (!vacationMode.startDate || !vacationMode.endDate)) {
      setMessage({ type: 'error', text: 'Veuillez définir les dates de congés avant d\'activer le mode vacances.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    setVacationMode({...vacationMode, enabled});
    // On sauvegarde immédiatement l'état activé/désactivé
    handleSave();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (error) {
        return dateStr;
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* Couleur du spinner (blue-600) mappée à --color-primary (Marron) */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Mode Vacances 🏖️
              </h1>
              <p className="text-sm text-gray-600">
                Désactivez temporairement les réservations en ligne
              </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
            >
              ← Retour au Tableau de bord
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Message d'alerte */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Status actuel - Design Moderne */}
        <div className={`mb-8 p-6 rounded-2xl shadow-xl transition-all duration-300 ${vacationMode.enabled ? 'bg-orange-50 border border-orange-200 shadow-orange-100' : 'bg-green-50 border border-green-200 shadow-green-100'}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className={`text-xl md:text-2xl font-extrabold mb-1 ${vacationMode.enabled ? 'text-orange-800' : 'text-green-800'}`}>
                {vacationMode.enabled ? '🏖️ Mode vacances ACTIF' : '✅ Service ACTIF et disponible'}
              </h3>
              <p className="text-sm text-gray-600">
                {vacationMode.enabled 
                  ? `Les réservations sont suspendues. Reprise le ${vacationMode.endDate ? formatDate(vacationMode.endDate) : '[Date de fin non définie]'}`
                  : 'Les clients peuvent effectuer des réservations normalement. Aucune restriction.'
                }
              </p>
            </div>
            <button
              onClick={() => handleToggle(!vacationMode.enabled)}
              className={`px-6 py-3 min-w-[200px] rounded-xl font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl text-sm ${
                vacationMode.enabled 
                  ? 'bg-green-600 hover:bg-green-700' // Green to reactivate
                  : 'bg-orange-600 hover:bg-orange-700' // Orange to activate vacation mode
              }`}
            >
              {vacationMode.enabled ? '✅ Réactiver le service' : '⚙️ Activer mode vacances'}
            </button>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3">
            Paramètres des congés
          </h3>

          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={vacationMode.startDate}
                  onChange={(e) => setVacationMode({...vacationMode, startDate: e.target.value})}
                  // focus:ring-blue-500 est mappé à --color-primary-light (Marron)
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                {vacationMode.startDate && (
                  <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-lg">
                    Début : **{formatDate(vacationMode.startDate)}**
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de fin (Reprise) *
                </label>
                <input
                  type="date"
                  value={vacationMode.endDate}
                  onChange={(e) => setVacationMode({...vacationMode, endDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                {vacationMode.endDate && (
                  <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-lg">
                    Reprise : **{formatDate(vacationMode.endDate)}**
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message affiché aux clients *
              </label>
              <textarea
                value={vacationMode.message}
                onChange={(e) => setVacationMode({...vacationMode, message: e.target.value})}
                rows="4"
                placeholder="Message personnalisé..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisez <code className='text-xs font-mono text-blue-700'>{'{date}'}</code> pour insérer automatiquement la date de reprise.
              </p>
            </div>

          </div>
        </div>

        {/* Aperçu du message */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">
            Aperçu pour le client
          </h3>
          
          <div className="p-5 bg-orange-50 border-2 border-orange-300 rounded-xl shadow-md">
            <div className="flex items-start gap-4">
              <div className="text-3xl text-orange-600">⚠️</div>
              <div>
                <h4 className="text-lg font-bold text-orange-900 mb-1">
                  Service Temporairement Indisponible
                </h4>
                <p className="text-orange-800 leading-relaxed text-sm">
                  {vacationMode.message.replace('{date}', vacationMode.endDate ? formatDate(vacationMode.endDate) : '[date de reprise non définie]')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations - utilise la couleur primaire (marron) */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h4 className="font-bold text-blue-700 mb-3">
            <span className="text-xl">💡</span> Fonctionnement du mode vacances
          </h4>
          <ul className="space-y-2 text-sm text-blue-800 list-inside">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold text-base">•</span>
              <span>**Suspension :** Le formulaire de réservation est masqué lorsque le mode est actif.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold text-base">•</span>
              <span>**Visibilité :** Votre message personnalisé s'affiche à la place du formulaire.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold text-base">•</span>
              <span>**Rappel :** Pensez à désactiver le mode (ou Réactiver le service) à votre retour pour accepter de nouvelles commandes !</span>
            </li>
          </ul>
        </div>

        {/* Actions - Bouton Sauvegarder */}
        <div className="flex">
          <button
            onClick={handleSave}
            disabled={saving}
            // bg-blue-600/hover:bg-blue-700 est mappé à --color-primary (Marron)
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold disabled:bg-gray-400 transition-all shadow-md hover:shadow-lg"
          >
            {saving ? '⏳ Enregistrement en cours...' : '💾 Sauvegarder la configuration'}
          </button>
        </div>

      </main>
    </div>
  );
}