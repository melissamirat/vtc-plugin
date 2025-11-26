'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserWidgets, updateTimeSurcharges } from '@/lib/firestore';
import { defaultTimeSurcharges } from '@/config/vehicleConfig';

export default function SurchargesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [widgets, setWidgets] = useState([]);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [surcharges, setSurcharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newSurcharge, setNewSurcharge] = useState({
    name: '',
    type: 'hourly',
    startHour: 0,
    endHour: 0,
    days: [],
    amount: 0,
    enabled: true
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
      setSurcharges(widget.config?.timeSurcharges || defaultTimeSurcharges);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentWidget) return;
    
    setSaving(true);
    const result = await updateTimeSurcharges(currentWidget.id, surcharges);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Majorations sauvegardees avec succes !' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
    
    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleAddSurcharge = () => {
    const newItem = {
      id: `surcharge-${Date.now()}`,
      ...newSurcharge
    };
    setSurcharges([...surcharges, newItem]);
    setShowAddModal(false);
    setNewSurcharge({
      name: '',
      type: 'hourly',
      startHour: 0,
      endHour: 0,
      days: [],
      amount: 0,
      enabled: true
    });
  };

  const handleDeleteSurcharge = (id) => {
    if (confirm('Supprimer cette majoration ?')) {
      setSurcharges(surcharges.filter(s => s.id !== id));
    }
  };

  const handleUpdateSurcharge = (id, field, value) => {
    setSurcharges(surcharges.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const toggleDay = (day) => {
    const days = newSurcharge.days.includes(day)
      ? newSurcharge.days.filter(d => d !== day)
      : [...newSurcharge.days, day];
    setNewSurcharge({...newSurcharge, days});
  };

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-gray-50 to-gray-100">
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-700 to-stone-600 bg-clip-text text-transparent">Majorations horaires</h1>
              <p className="text-sm text-gray-600 mt-0.5">Gérez les suppléments selon l'heure et le jour</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg border-2 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-stone-50 border-stone-400 text-stone-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {surcharges.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Majorations actives ({surcharges.filter(s => s.enabled).length})</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Ajouter une majoration
            </button>
          </div>
        )}

        {/* Liste des majorations */}
        {surcharges.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-stone-300 shadow-lg">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aucune majoration
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre première majoration pour ajuster les tarifs selon les horaires
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
            >
              Créer une majoration
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {surcharges.map((surcharge) => (
              <div key={surcharge.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-stone-300 shadow-lg hover:shadow-2xl hover:border-stone-400 transition-all p-6">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={surcharge.name}
                    onChange={(e) => handleUpdateSurcharge(surcharge.id, 'name', e.target.value)}
                    className="text-xl font-bold text-gray-900 border-b-2 border-transparent hover:border-stone-300 focus:border-stone-500 outline-none w-full transition-colors"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    {surcharge.type === 'hourly' ? 'Majoration horaire' : 'Majoration journalière'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    surcharge.enabled 
                      ? 'bg-stone-100 text-stone-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={surcharge.enabled}
                      onChange={(e) => handleUpdateSurcharge(surcharge.id, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-stone-600 focus:ring-stone-500"
                    />
                    <span className="text-xs font-semibold">
                      {surcharge.enabled ? '✓ Actif' : '○ Inactif'}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteSurcharge(surcharge.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {surcharge.type === 'hourly' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Heure début</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={surcharge.startHour || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          const num = value === '' ? 0 : Math.min(23, Math.max(0, parseInt(value)));
                          handleUpdateSurcharge(surcharge.id, 'startHour', num);
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Heure fin</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={surcharge.endHour || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          const num = value === '' ? 0 : Math.min(23, Math.max(0, parseInt(value)));
                          handleUpdateSurcharge(surcharge.id, 'endHour', num);
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="23"
                        className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Montant (€)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={surcharge.amount || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      handleUpdateSurcharge(surcharge.id, 'amount', value === '' ? 0 : parseFloat(value) || 0);
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="5"
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                  />
                </div>
              </div>

              {surcharge.type === 'weekly' && surcharge.days && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Jours concernés:</p>
                  <div className="flex flex-wrap gap-2">
                    {surcharge.days.map(day => (
                      <span key={day} className="px-3 py-1.5 bg-stone-50 text-stone-700 rounded-lg text-sm font-medium border border-stone-300">
                        {dayNames[day]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
        )}

        {surcharges.length > 0 && (
          <div className="sticky bottom-4 bg-white border border-stone-300 rounded-xl p-2.5 shadow-lg">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-5 py-2.5 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-lg hover:shadow-lg font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </span>
              ) : (
                "💾 Sauvegarder"
              )}
            </button>
          </div>
        )}

        {/* Modal ajout */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle majoration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    value={newSurcharge.name}
                    onChange={(e) => setNewSurcharge({...newSurcharge, name: e.target.value})}
                    placeholder="Heures de pointe"
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newSurcharge.type}
                    onChange={(e) => setNewSurcharge({...newSurcharge, type: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                  >
                    <option value="hourly">Horaire (plages d heures)</option>
                    <option value="weekly">Journaliere (jours de la semaine)</option>
                  </select>
                </div>

                {newSurcharge.type === 'hourly' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Heure debut</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newSurcharge.startHour || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          const num = value === '' ? 0 : Math.min(23, Math.max(0, parseInt(value)));
                          setNewSurcharge({...newSurcharge, startHour: num});
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Heure fin</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newSurcharge.endHour || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          const num = value === '' ? 0 : Math.min(23, Math.max(0, parseInt(value)));
                          setNewSurcharge({...newSurcharge, endHour: num});
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="23"
                        className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {newSurcharge.type === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Jours de la semaine</label>
                    <div className="grid grid-cols-2 gap-2">
                      {dayNames.map((name, index) => (
                        <label key={index} className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={newSurcharge.days.includes(index)}
                            onChange={() => toggleDay(index)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Montant (euros) *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newSurcharge.amount || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setNewSurcharge({...newSurcharge, amount: value === '' ? 0 : parseFloat(value) || 0});
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="5"
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddSurcharge}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-xl hover:shadow-xl font-bold transition-all hover:scale-[1.02]"
                >
                  ✓ Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}