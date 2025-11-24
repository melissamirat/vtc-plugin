'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPromoCodes, createPromoCode, deletePromoCode } from '@/lib/firestore';

export default function PromoPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    maxUses: null,
    validFrom: '',
    validUntil: '',
    minAmount: 0
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadPromoCodes();
  }, [user, router]);

  const loadPromoCodes = async () => {
    if (!user) return;
    const result = await getPromoCodes(user.uid);
    if (result.success) {
      setPromoCodes(result.data);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newPromo.code.trim()) {
      setMessage({ type: 'error', text: 'Le code est obligatoire' });
      return;
    }

    const result = await createPromoCode(user.uid, newPromo);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Code promo cree avec succes !' });
      setShowAddModal(false);
      setNewPromo({
        code: '',
        type: 'percentage',
        value: 10,
        maxUses: null,
        validFrom: '',
        validUntil: '',
        minAmount: 0
      });
      loadPromoCodes();
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la creation' });
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDelete = async (promoId) => {
    if (confirm('Supprimer ce code promo ?')) {
      const result = await deletePromoCode(promoId);
      if (result.success) {
        setMessage({ type: 'success', text: 'Code promo supprime' });
        loadPromoCodes();
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Codes promo</h1>
              <p className="text-sm text-gray-600">Gerez vos codes promotionnels</p>
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
          <h2 className="text-xl font-bold">Codes actifs ({promoCodes.length})</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Creer un code promo
          </button>
        </div>

        {/* Liste des codes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promoCodes.map((promo) => (
            <div key={promo.id} className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-2xl font-bold text-blue-600">{promo.code}</span>
                  <p className="text-sm text-gray-500 mt-1">
                    {promo.type === 'percentage' ? `${promo.value}% de reduction` : `${promo.value} euros de reduction`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilisations:</span>
                  <span className="font-semibold">{promo.currentUses} / {promo.maxUses || 'illimite'}</span>
                </div>
                {promo.minAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant min:</span>
                    <span className="font-semibold">{promo.minAmount} euros</span>
                  </div>
                )}
                {promo.validUntil && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expire le:</span>
                    <span className="font-semibold">
                      {promo.validUntil.toDate().toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal creation */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
              <h3 className="text-2xl font-bold mb-6">Nouveau code promo</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code promo *</label>
                  <input
                    type="text"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                    placeholder="BIENVENUE10"
                    className="w-full px-4 py-2 border rounded-lg uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={newPromo.type}
                      onChange={(e) => setNewPromo({...newPromo, type: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="percentage">Pourcentage</option>
                      <option value="fixed">Montant fixe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valeur</label>
                    <input
                      type="number"
                      value={newPromo.value}
                      onChange={(e) => setNewPromo({...newPromo, value: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Utilisations max</label>
                    <input
                      type="number"
                      value={newPromo.maxUses || ''}
                      onChange={(e) => setNewPromo({...newPromo, maxUses: e.target.value ? parseInt(e.target.value) : null})}
                      placeholder="Illimite"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Montant minimum</label>
                    <input
                      type="number"
                      value={newPromo.minAmount}
                      onChange={(e) => setNewPromo({...newPromo, minAmount: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Valide a partir de</label>
                    <input
                      type="date"
                      value={newPromo.validFrom}
                      onChange={(e) => setNewPromo({...newPromo, validFrom: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valide jusqu au</label>
                    <input
                      type="date"
                      value={newPromo.validUntil}
                      onChange={(e) => setNewPromo({...newPromo, validUntil: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
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
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Creer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
