'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DevTools({ widgetId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Afficher seulement en dev
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!widgetId) {
    return null;
  }

  const resetWizard = async () => {
    if (!confirm('⚠️ Réinitialiser le wizard ?\n\nCela va:\n- Remettre setupCompleted à false\n- Effacer wizardProgress\n\nLa configuration existante sera conservée.')) {
      return;
    }

    setLoading(true);
    try {
      const widgetRef = doc(db, 'widgets', widgetId);
      await updateDoc(widgetRef, {
        setupCompleted: false,
        wizardProgress: null,
      });
      
      console.log('✅ Wizard reset avec succès !');
      console.log('🔄 Rechargement de la page...');
      
      // Force le rechargement complet de la page
      window.location.reload();
    } catch (error) {
      console.error('Erreur reset wizard:', error);
      alert('❌ Erreur: ' + error.message);
      setLoading(false);
    }
  };

  const clearConfig = async () => {
    if (!confirm('⚠️⚠️ DANGER ⚠️⚠️\n\nEffacer TOUTE la configuration ?\n\nCela va supprimer:\n- Tous les véhicules\n- Toutes les zones\n- Tous les forfaits\n- Modes de paiement\n- Progression du wizard\n\nCette action est irréversible !')) {
      return;
    }

    setLoading(true);
    try {
      const widgetRef = doc(db, 'widgets', widgetId);
      await updateDoc(widgetRef, {
        setupCompleted: false,
        wizardProgress: null,
        'config.vehicleCategories': [],
        'config.serviceZones': [],
        'config.packages': [],
        'config.paymentModes': {
          driver: { enabled: true, label: 'Paiement à bord' },
          methods: ['cash'],
          online: { 
            enabled: false, 
            label: 'Paiement en ligne', 
            requiresDeposit: false, 
            depositPercent: 30 
          },
        },
      });
      alert('✅ Configuration effacée avec succès !');
      window.location.reload();
    } catch (error) {
      console.error('Erreur clear config:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewWizardData = async () => {
    try {
      const widgetRef = doc(db, 'widgets', widgetId);
      const snapshot = await widgetRef.get();
      const data = snapshot.data();
      
      console.log('=== WIZARD DATA ===');
      console.log('setupCompleted:', data.setupCompleted);
      console.log('wizardProgress:', data.wizardProgress);
      console.log('config:', data.config);
      
      alert('📊 Données affichées dans la console (F12)');
    } catch (error) {
      console.error('Erreur view data:', error);
      alert('❌ Erreur: ' + error.message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          🛠️ Dev Tools
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl p-4 border-2 border-purple-600 w-72">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-purple-900 flex items-center gap-2">
              🛠️ Dev Tools
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                DEV
              </span>
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={resetWizard}
              disabled={loading}
              className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '⏳ Chargement...' : '🔄 Reset Wizard'}
            </button>

            <button
              onClick={clearConfig}
              disabled={loading}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '⏳ Chargement...' : '🗑️ Clear Config'}
            </button>

            <button
              onClick={viewWizardData}
              disabled={loading}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              📊 View Data (Console)
            </button>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Widget ID:</strong>
              </p>
              <p className="text-xs text-gray-700 font-mono bg-gray-50 p-1 rounded mt-1 break-all">
                {widgetId}
              </p>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400 italic">
                ⚠️ Ce composant est uniquement visible en mode développement
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}