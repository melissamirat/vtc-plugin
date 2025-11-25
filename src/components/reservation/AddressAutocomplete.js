import React from 'react';

export default function AddressAutocomplete({
  label,
  name,
  value,
  onChange,
  onSearch,
  suggestions,
  onSelectAddress,
  isValidated,
  required = true,
  placeholder = "Tapez votre adresse...",
  inputClassName,
  labelClassName,
}) {
  const handleInputChange = (e) => {
    onChange(e);
    // Ne rechercher QUE si l'utilisateur tape (pas si on set la valeur programmatiquement)
    if (e.target.value.length >= 3) {
      onSearch(e.target.value);
    }
  };

  const handleSelect = (suggestion) => {
    onSelectAddress(suggestion);
  };

  return (
    <div className="relative">
      <label className={labelClassName}>
        {label} {required && "*"}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        className={`${inputClassName} ${
          isValidated ? "border-green-500 bg-green-50" : ""
        }`}
      />

      {/* Liste suggestions - SEULEMENT si non validé */}
      {!isValidated && suggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer border-b text-sm sm:text-base flex items-start gap-2"
            >
              <span className="text-lg flex-shrink-0">{suggestion.icon || "📍"}</span>
              <div className="flex-1">
                <div>{suggestion.properties.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation message */}
      {isValidated && (
        <p className="text-xs sm:text-sm text-green-600 mt-1 font-medium">
          ✅ Adresse validée
        </p>
      )}
    </div>
  );
}