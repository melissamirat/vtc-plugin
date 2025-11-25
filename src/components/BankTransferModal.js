"use client";

import { useState } from 'react';

export default function BankTransferModal({ 
  isOpen, 
  onClose, 
  bankInfo, 
  bookingData,
  onConfirm 
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🏦 Virement bancaire</h2>
            <p className="text-sm text-gray-600">Coordonnées bancaires</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Montant */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Montant à virer</span>
              <span className="text-2xl font-bold text-amber-600">
                {bookingData.amount.toFixed(2)}€
              </span>
            </div>
          </div>

          {/* IBAN */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              IBAN
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bankInfo.iban}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(bankInfo.iban)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Copier"
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {/* BIC */}
          {bankInfo.bic && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                BIC
              </label>
              <input
                type="text"
                value={bankInfo.bic}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
              />
            </div>
          )}

          {/* Titulaire */}
          {bankInfo.accountName && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Titulaire du compte
              </label>
              <input
                type="text"
                value={bankInfo.accountName}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          {/* Banque */}
          {bankInfo.bankName && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Banque
              </label>
              <input
                type="text"
                value={bankInfo.bankName}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          {/* Référence */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Référence à indiquer
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={`RES-${bookingData.id.slice(0, 8).toUpperCase()}`}
                readOnly
                className="flex-1 px-3 py-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg font-mono text-sm font-bold"
              />
              <button
                onClick={() => copyToClipboard(`RES-${bookingData.id.slice(0, 8).toUpperCase()}`)}
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                title="Copier"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              ⚠️ Important : Merci d'indiquer cette référence dans le libellé du virement
            </p>
          </div>
        </div>

        {/* Instructions */}
        {bankInfo.instructions && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              <strong>📝 Instructions :</strong><br />
              {bankInfo.instructions}
            </p>
          </div>
        )}

        {/* Avertissement */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
          <p className="text-xs text-amber-800">
            <strong>⚠️ Important :</strong> Votre réservation sera confirmée après réception et vérification du virement. Cela peut prendre 1-2 jours ouvrés. Vous recevrez un email de confirmation.
          </p>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            ✓ J'ai noté les infos
          </button>
        </div>
      </div>
    </div>
  );
}