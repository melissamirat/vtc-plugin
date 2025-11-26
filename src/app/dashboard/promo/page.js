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
      setMessage({ type: 'success', text: 'Code promo créé avec succès !' });
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
      setMessage({ type: 'error', text: 'Erreur lors de la création' });
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDelete = async (promoId) => {
    if (confirm('Supprimer ce code promo ?')) {
      const result = await deletePromoCode(promoId);
      if (result.success) {
        setMessage({ type: 'success', text: 'Code promo supprimé' });
        loadPromoCodes();
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-gray-50 to-gray-100">
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-stone-700 to-stone-600 bg-clip-text text-transparent truncate">Codes promo</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Gérez vos codes promotionnels</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm flex-shrink-0"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        
        {message.text && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl shadow-lg border-2 ${
            message.type === 'success' 
              ? 'bg-stone-50 border-stone-400 text-stone-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <p className="font-medium text-sm sm:text-base">{message.text}</p>
          </div>
        )}

        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <h2 className="text-base sm:text-xl font-bold text-gray-900">Codes actifs ({promoCodes.length})</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <span className="text-lg sm:text-xl">+</span>
            <span>Créer un code promo</span>
          </button>
        </div>

        {/* Liste des codes */}
        {promoCodes.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-stone-300 shadow-lg">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aucun code promo
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier code promotionnel
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
            >
              Créer un code promo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {promoCodes.map((promo) => (
              <div key={promo.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-stone-300 shadow-lg hover:shadow-2xl hover:border-stone-400 transition-all p-4 sm:p-6">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-xl sm:text-2xl font-bold text-stone-700 break-all">{promo.code}</span>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {promo.type === 'percentage' ? `${promo.value}% de réduction` : `${promo.value}€ de réduction`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-600">Utilisations:</span>
                    <span className="font-semibold">{promo.currentUses} / {promo.maxUses || '∞'}</span>
                  </div>
                  {promo.minAmount > 0 && (
                    <div className="flex justify-between items-center py-1.5 px-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-gray-600">Montant min:</span>
                      <span className="font-semibold">{promo.minAmount}€</span>
                    </div>
                  )}
                  {promo.validUntil && (
                    <div className="flex justify-between items-center py-1.5 px-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-gray-600">Expire le:</span>
                      <span className="font-semibold text-xs sm:text-sm">
                        {promo.validUntil.toDate().toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal creation */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 rounded-t-3xl sm:rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Nouveau code promo</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Code promo *</label>
                  <input
                    type="text"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                    placeholder="BIENVENUE10"
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl uppercase text-sm sm:text-base focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Type</label>
                    <select
                      value={newPromo.type}
                      onChange={(e) => setNewPromo({...newPromo, type: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                    >
                      <option value="percentage">Pourcentage</option>
                      <option value="fixed">Montant fixe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Valeur</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={newPromo.value || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setNewPromo({...newPromo, value: value === '' ? 0 : parseFloat(value)});
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="10"
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Utilisations max</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newPromo.maxUses || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setNewPromo({...newPromo, maxUses: value === '' ? null : parseInt(value)});
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="Illimité"
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Montant minimum</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={newPromo.minAmount || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setNewPromo({...newPromo, minAmount: value === '' ? 0 : parseFloat(value)});
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Valide à partir de</label>
                    <input
                      type="date"
                      value={newPromo.validFrom}
                      onChange={(e) => setNewPromo({...newPromo, validFrom: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Valide jusqu'au</label>
                    <input
                      type="date"
                      value={newPromo.validUntil}
                      onChange={(e) => setNewPromo({...newPromo, validUntil: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white p-4 sm:p-6 border-t border-gray-200 flex gap-3 sm:gap-4 rounded-b-3xl sm:rounded-b-2xl">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold text-sm sm:text-base transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-xl hover:shadow-xl font-bold text-sm sm:text-base transition-all hover:scale-[1.02]"
                >
                  ✓ Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}