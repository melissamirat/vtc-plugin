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
              <h1 className="text-2xl font-bold text-gray-900">Majorations horaires</h1>
              <p className="text-sm text-gray-600">Gerez les supplements selon l heure et le jour</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Majorations actives ({surcharges.filter(s => s.enabled).length})</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Ajouter une majoration
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {surcharges.map((surcharge) => (
            <div key={surcharge.id} className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={surcharge.name}
                    onChange={(e) => handleUpdateSurcharge(surcharge.id, 'name', e.target.value)}
                    className="text-lg font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {surcharge.type === 'hourly' ? 'Majoration horaire' : 'Majoration journaliere'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={surcharge.enabled}
                      onChange={(e) => handleUpdateSurcharge(surcharge.id, 'enabled', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium">Actif</span>
                  </label>
                  <button
                    onClick={() => handleDeleteSurcharge(surcharge.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-semibold"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {surcharge.type === 'hourly' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure debut</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={surcharge.startHour}
                        onChange={(e) => handleUpdateSurcharge(surcharge.id, 'startHour', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={surcharge.endHour}
                        onChange={(e) => handleUpdateSurcharge(surcharge.id, 'endHour', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (euros)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={surcharge.amount}
                    onChange={(e) => handleUpdateSurcharge(surcharge.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {surcharge.type === 'weekly' && surcharge.days && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Jours concernes:</p>
                  <div className="flex flex-wrap gap-2">
                    {surcharge.days.map(day => (
                      <span key={day} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {dayNames[day]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:bg-gray-400"
          >
            {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
          </button>
        </div>

        {/* Modal ajout */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
              <h3 className="text-2xl font-bold mb-6">Nouvelle majoration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    value={newSurcharge.name}
                    onChange={(e) => setNewSurcharge({...newSurcharge, name: e.target.value})}
                    placeholder="Heures de pointe"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newSurcharge.type}
                    onChange={(e) => setNewSurcharge({...newSurcharge, type: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
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
                        type="number"
                        min="0"
                        max="23"
                        value={newSurcharge.startHour}
                        onChange={(e) => setNewSurcharge({...newSurcharge, startHour: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Heure fin</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={newSurcharge.endHour}
                        onChange={(e) => setNewSurcharge({...newSurcharge, endHour: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 border rounded-lg"
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
                    type="number"
                    step="0.5"
                    value={newSurcharge.amount}
                    onChange={(e) => setNewSurcharge({...newSurcharge, amount: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddSurcharge}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}