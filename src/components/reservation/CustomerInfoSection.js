import React from 'react';

/**
 * Section des informations client - VERSION MODERNE
 */
export default function CustomerInfoSection({
  formData,
  onChange,
  BRANDING,
  inputClassName,
  labelClassName,
}) {
  return (
    <fieldset
      className="mb-6 p-4 sm:p-6 border-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50"
      style={{ borderColor: BRANDING.accentColor }}
    >
      <legend
        className="px-3 text-base sm:text-lg font-bold flex items-center gap-2"
        style={{ color: BRANDING.primaryColor }}
      >
        <span className="text-2xl">👤</span>
        Vos informations
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4 sm:mt-5">
        <div className="relative group">
          <label className={`${labelClassName} flex items-center gap-2 group-hover:text-blue-600 transition-colors`}>
            <span className="text-base">👔</span>
            Nom *
          </label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={onChange}
            required
            className={`${inputClassName} hover:border-blue-300 focus:border-blue-500 transition-all ${
              formData.nom ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''
            }`}
            placeholder="Dupont"
          />
          {formData.nom && (
            <div className="absolute right-3 top-9 text-green-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="relative group">
          <label className={`${labelClassName} flex items-center gap-2 group-hover:text-blue-600 transition-colors`}>
            <span className="text-base">✨</span>
            Prénom *
          </label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={onChange}
            required
            className={`${inputClassName} hover:border-blue-300 focus:border-blue-500 transition-all ${
              formData.prenom ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''
            }`}
            placeholder="Jean"
          />
          {formData.prenom && (
            <div className="absolute right-3 top-9 text-green-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4 sm:mt-5">
        <div className="relative group">
          <label className={`${labelClassName} flex items-center gap-2 group-hover:text-blue-600 transition-colors`}>
            <span className="text-base">📱</span>
            Téléphone *
          </label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={onChange}
            required
            className={`${inputClassName} hover:border-blue-300 focus:border-blue-500 transition-all ${
              formData.telephone ? 'bg-gradient-to-r from-green-50 to-emerald-50' : ''
            }`}
            placeholder="06 12 34 56 78"
          />
          {formData.telephone && formData.telephone.length >= 10 && (
            <div className="absolute right-3 top-9 text-green-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="relative group">
          <label className={`${labelClassName} flex items-center gap-2 group-hover:text-blue-600 transition-colors`}>
            <span className="text-base">📧</span>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className={`${inputClassName} hover:border-blue-300 focus:border-blue-500 transition-all ${
              formData.email && formData.email.includes('@') ? 'bg-gradient-to-r from-purple-50 to-pink-50' : ''
            }`}
            placeholder="email@exemple.com"
          />
          {formData.email && formData.email.includes('@') && formData.email.includes('.') && (
            <div className="absolute right-3 top-9 text-green-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Indicateur de progression */}
      <div className="mt-4 sm:mt-5">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">Progression</span>
          <span className="font-bold" style={{ color: BRANDING.primaryColor }}>
            {(() => {
              const fields = [formData.nom, formData.prenom, formData.telephone, formData.email];
              const filled = fields.filter(f => f && f.trim()).length;
              return `${filled}/4`;
            })()}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${(() => {
                const fields = [formData.nom, formData.prenom, formData.telephone, formData.email];
                const filled = fields.filter(f => f && f.trim()).length;
                return (filled / 4) * 100;
              })()}%`
            }}
          />
        </div>
      </div>
    </fieldset>
  );
}