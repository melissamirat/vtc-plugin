// src/components/ui/ResponsiveComponents.jsx
// Composants UI réutilisables optimisés pour mobile

"use client";

import Link from "next/link";

// ============================================
// CARD CLIQUABLE (Stats, Menu items)
// ============================================
export function ClickableCard({ href, onClick, children, className = "", borderColor = "border-blue-500" }) {
  const baseClasses = `
    block bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg 
    p-3 sm:p-6 border-l-4 ${borderColor}
    hover:shadow-xl transition-all duration-200
    active:scale-[0.98] cursor-pointer
    touch-manipulation
  `;

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${className} w-full text-left`}>
      {children}
    </button>
  );
}

// ============================================
// STAT CARD (Pour le dashboard)
// ============================================
export function StatCard({ href, label, value, icon, borderColor = "border-blue-500", bgColor = "bg-blue-100" }) {
  return (
    <ClickableCard href={href} borderColor={borderColor}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">
            {label}
          </p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
            {value}
          </p>
        </div>
        <div className={`w-10 h-10 sm:w-14 sm:h-14 ${bgColor} rounded-lg sm:rounded-xl flex items-center justify-center`}>
          <span className="text-lg sm:text-2xl">{icon}</span>
        </div>
      </div>
    </ClickableCard>
  );
}

// ============================================
// MENU CARD (Pour la grille de configuration)
// ============================================
export function MenuCard({ href, onClick, title, description, icon, bgColor = "bg-blue-50", borderColor = "border-blue-200" }) {
  const content = (
    <>
      <div className={`w-12 h-12 sm:w-16 sm:h-16 ${bgColor} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4`}>
        <span className="text-2xl sm:text-4xl">{icon}</span>
      </div>
      <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600">{description}</p>
    </>
  );

  const baseClasses = `
    relative bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg 
    p-3 sm:p-6 border-2 ${borderColor}
    hover:shadow-xl hover:scale-[1.02] transition-all duration-200
    active:scale-[0.98] cursor-pointer
    touch-manipulation text-left w-full
  `;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
}

// ============================================
// BOUTON RESPONSIVE
// ============================================
export function Button({ 
  children, 
  onClick, 
  href,
  variant = "primary", 
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button"
}) {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs sm:text-sm",
    md: "px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base",
    lg: "px-5 py-2.5 sm:px-6 sm:py-3 text-base sm:text-lg",
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg sm:rounded-xl
    transition-all duration-200
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
    touch-manipulation
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  const content = (
    <>
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || loading}
      className={baseClasses}
    >
      {content}
    </button>
  );
}

// ============================================
// INPUT RESPONSIVE
// ============================================
export function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 sm:px-4 sm:py-3
          text-base text-gray-900
          bg-white border rounded-lg sm:rounded-xl
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-200'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// ============================================
// BADGE DE STATUT
// ============================================
export function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-300",
      label: "En attente",
      icon: "⏳"
    },
    confirmed: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-300",
      label: "Confirmée",
      icon: "✅"
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-300",
      label: "Annulée",
      icon: "❌"
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`
      inline-flex items-center gap-1 
      px-2 py-0.5 sm:px-3 sm:py-1 
      text-xs sm:text-sm font-semibold 
      rounded-full border
      ${config.bg} ${config.text} ${config.border}
    `}>
      <span>{config.icon}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
}

// ============================================
// MODAL RESPONSIVE
// ============================================
export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={`
          bg-white rounded-2xl shadow-2xl 
          p-4 sm:p-6 
          w-full ${sizes[size]}
          max-h-[90vh] overflow-y-auto
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

// ============================================
// PAGE HEADER RESPONSIVE
// ============================================
export function PageHeader({ title, subtitle, backHref, actions }) {
  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          <div className="flex items-center gap-2 sm:gap-4">
            {backHref && (
              <Link 
                href={backHref}
                className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================
// CONTAINER RESPONSIVE
// ============================================
export function Container({ children, className = "" }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// GRILLE RESPONSIVE
// ============================================
export function Grid({ children, cols = 2, className = "" }) {
  const colsConfig = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${colsConfig[cols]} gap-3 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================
export function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="text-center py-8 sm:py-12">
      <span className="text-4xl sm:text-6xl">{icon}</span>
      <h3 className="mt-4 text-base sm:text-lg font-semibold text-gray-900">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

// ============================================
// LOADING SPINNER
// ============================================
export function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full ${sizes[size]} border-blue-600 border-t-transparent`} />
    </div>
  );
}

// ============================================
// FULL PAGE LOADING
// ============================================
export function FullPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <LoadingSpinner size="lg" />
    </div>
  );
}