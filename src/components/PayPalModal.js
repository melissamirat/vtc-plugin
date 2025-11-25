"use client";

import { useState, useEffect } from 'react';

export default function PayPalModal({ 
  isOpen, 
  onClose, 
  paypalEmail, 
  bookingData,
  onConfirm 
}) {
  const [paypalLink, setPaypalLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && paypalEmail && bookingData) {
      generatePayPalLink();
    }
  }, [isOpen, paypalEmail, bookingData]);

  const generatePayPalLink = () => {
    // Générer le lien PayPal.Me
    const amount = bookingData.amount.toFixed(2);
    const reference = `RES-${bookingData.id.slice(0, 8).toUpperCase()}`;
    
    // Format: https://paypal.me/username/amount
    const username = paypalEmail.split('@')[0]; // Extraire le username de l'email
    const link = `https://paypal.me/${username}/${amount}EUR`;
    
    setPaypalLink(link);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPayPal = () => {
    window.open(paypalLink, '_blank');
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🅿️ Paiement PayPal</h2>
            <p className="text-sm text-gray-600">Transfert sécurisé</p>
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
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Montant à payer</span>
              <span className="text-2xl font-bold text-blue-600">
                {bookingData.amount.toFixed(2)}€
              </span>
            </div>
          </div>

          {/* Email destinataire */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email PayPal du destinataire
            </label>
            <input
              type="text"
              value={paypalEmail}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>

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
                {copied ? '✓' : '📋'}
              </button>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              ⚠️ Merci d'indiquer cette référence dans le message du paiement
            </p>
          </div>

          {/* Lien PayPal */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Lien de paiement direct
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={paypalLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs overflow-x-auto"
              />
              <button
                onClick={() => copyToClipboard(paypalLink)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Copier"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <p className="text-sm text-blue-800">
            <strong>💡 Comment procéder :</strong>
          </p>
          <ol className="text-xs text-blue-700 mt-2 space-y-1 pl-4">
            <li>1. Cliquez sur "Ouvrir PayPal" ci-dessous</li>
            <li>2. Connectez-vous à votre compte PayPal</li>
            <li>3. Vérifiez le montant ({bookingData.amount.toFixed(2)}€)</li>
            <li>4. Ajoutez la référence dans le message</li>
            <li>5. Validez le paiement</li>
          </ol>
        </div>

        {/* Avertissement */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
          <p className="text-xs text-amber-800">
            <strong>⚠️ Important :</strong> Votre réservation sera confirmée après réception du paiement PayPal. Vous recevrez un email de confirmation.
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
            onClick={handleOpenPayPal}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            🅿️ Ouvrir PayPal
          </button>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
        >
          ✓ J'ai effectué le paiement
        </button>
      </div>
    </div>
  );
}