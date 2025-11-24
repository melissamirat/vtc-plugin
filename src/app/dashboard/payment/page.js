'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserWidgets, updatePaymentModes } from '@/lib/firestore';

// Structure par défaut des paiements
const defaultPaymentModes = {
  online: {
    enabled: false,
    label: 'Paiement en ligne (Stripe)',
    requiresDeposit: true,
    depositPercent: 30
  },
  driver: {
    enabled: true,
    label: 'Paiement au chauffeur',
    methods: ['card', 'cash']
  }
};

export default function PaymentPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [widgets, setWidgets] = useState([]);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [paymentModes, setPaymentModes] = useState(defaultPaymentModes);

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
      
      // Normaliser les données de paiement avec valeurs par défaut
      const savedModes = widget.config?.paymentModes;
      
      if (savedModes) {
        // Fusionner avec les valeurs par défaut pour éviter les undefined
        setPaymentModes({
          online: {
            enabled: savedModes.online?.enabled ?? defaultPaymentModes.online.enabled,
            label: savedModes.online?.label || defaultPaymentModes.online.label,
            requiresDeposit: savedModes.online?.requiresDeposit ?? defaultPaymentModes.online.requiresDeposit,
            depositPercent: savedModes.online?.depositPercent ?? defaultPaymentModes.online.depositPercent,
          },
          driver: {
            enabled: savedModes.driver?.enabled ?? defaultPaymentModes.driver.enabled,
            label: savedModes.driver?.label || defaultPaymentModes.driver.label,
            // ⚠️ CORRECTION PRINCIPALE : S'assurer que methods est toujours un tableau
            methods: Array.isArray(savedModes.driver?.methods) 
              ? savedModes.driver.methods 
              : (Array.isArray(savedModes.methods) ? savedModes.methods : defaultPaymentModes.driver.methods),
          }
        });
      } else {
        setPaymentModes(defaultPaymentModes);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentWidget) return;
    
    if (!paymentModes.online.enabled && !paymentModes.driver.enabled) {
      setMessage({ type: 'error', text: 'Au moins un mode de paiement doit être activé' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    setSaving(true);
    const result = await updatePaymentModes(currentWidget.id, paymentModes);
    
    if (result.success) {
      setMessage({ type: 'success', text: '✓ Modes de paiement sauvegardés avec succès !' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
    
    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateOnline = (field, value) => {
    setPaymentModes({
      ...paymentModes,
      online: { ...paymentModes.online, [field]: value }
    });
  };

  const handleUpdateDriver = (field, value) => {
    setPaymentModes({
      ...paymentModes,
      driver: { ...paymentModes.driver, [field]: value }
    });
  };

  const toggleDriverMethod = (method) => {
    // Sécuriser l'accès à methods
    const currentMethods = paymentModes.driver?.methods || [];
    const methods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    
    handleUpdateDriver('methods', methods);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sécuriser l'accès aux methods pour le rendu
  const driverMethods = paymentModes.driver?.methods || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💳 Modes de paiement</h1>
              <p className="text-sm text-gray-600">Configurez comment vos clients peuvent payer</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Paiement en ligne */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border-2 transition ${paymentModes.online.enabled ? 'border-blue-500' : 'border-gray-200'}`}>
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Paiement en ligne</h3>
                  <p className="text-sm text-gray-600">Via Stripe</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentModes.online.enabled}
                  onChange={(e) => handleUpdateOnline('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {paymentModes.online.enabled && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libellé affiché
                  </label>
                  <input
                    type="text"
                    value={paymentModes.online.label}
                    onChange={(e) => handleUpdateOnline('label', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={paymentModes.online.requiresDeposit}
                      onChange={(e) => handleUpdateOnline('requiresDeposit', e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium">Acompte requis</span>
                      <p className="text-xs text-gray-600">Le client paie un pourcentage à la réservation</p>
                    </div>
                  </label>
                </div>

                {paymentModes.online.requiresDeposit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pourcentage d'acompte (%)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={paymentModes.online.depositPercent}
                      onChange={(e) => handleUpdateOnline('depositPercent', parseInt(e.target.value) || 30)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommandé: 30% - 50%
                    </p>
                  </div>
                )}

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Bientôt disponible:</strong> La configuration Stripe sera disponible prochainement.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Paiement au chauffeur */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border-2 transition ${paymentModes.driver.enabled ? 'border-green-500' : 'border-gray-200'}`}>
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚗</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Paiement au chauffeur</h3>
                  <p className="text-sm text-gray-600">À la fin de la course</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentModes.driver.enabled}
                  onChange={(e) => handleUpdateDriver('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {paymentModes.driver.enabled && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libellé affiché
                  </label>
                  <input
                    type="text"
                    value={paymentModes.driver.label}
                    onChange={(e) => handleUpdateDriver('label', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Moyens de paiement acceptés
                  </label>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={driverMethods.includes('card')}
                        onChange={() => toggleDriverMethod('card')}
                        className="w-5 h-5 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💳</span>
                        <span className="font-medium">Carte bancaire</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={driverMethods.includes('cash')}
                        onChange={() => toggleDriverMethod('cash')}
                        className="w-5 h-5 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💵</span>
                        <span className="font-medium">Espèces</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={driverMethods.includes('check')}
                        onChange={() => toggleDriverMethod('check')}
                        className="w-5 h-5 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        <span className="font-medium">Chèque</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={driverMethods.includes('transfer')}
                        onChange={() => toggleDriverMethod('transfer')}
                        className="w-5 h-5 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏦</span>
                        <span className="font-medium">Virement bancaire</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>✓ Avantage:</strong> Simple et direct, pas de frais de transaction.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h4 className="font-bold text-blue-900 mb-3">💡 Conseils</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Activez les deux modes pour plus de flexibilité</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Le paiement en ligne réduit les annulations (acompte)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Le paiement au chauffeur évite les frais de transaction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Les clients choisiront leur mode de paiement préféré</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-bold disabled:bg-gray-400 transition-all"
          >
            {saving ? '⏳ Enregistrement...' : '✓ Sauvegarder les modifications'}
          </button>
        </div>

      </main>
    </div>
  );
}