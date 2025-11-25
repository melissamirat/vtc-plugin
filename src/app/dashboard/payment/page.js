"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getUserWidgets,
  updatePaymentConfig,
  saveStripeAccount,
} from "@/lib/firestore";

const defaultPaymentConfig = {
  stripe: {
    enabled: false,
    connected: false,
    accountId: null,
    publicKey: null,
    requiresDeposit: true,
    depositPercent: 30,
    label: "Paiement en ligne sécurisé",
  },
  paypal: {
    enabled: false,
    email: "",
    label: "Paiement PayPal",
  },
  onBoard: {
    enabled: true,
    label: "Paiement au chauffeur",
    methods: {
      card: { enabled: true, label: "Carte bancaire" },
      cash: { enabled: true, label: "Espèces" },
      check: { enabled: false, label: "Chèque" },
    },
  },
  bankTransfer: {
    enabled: false,
    label: "Virement bancaire",
    iban: "",
    bic: "",
    accountName: "",
    bankName: "",
    instructions: "Merci d'effectuer le virement avant la course.",
  },
};

export default function PaymentPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentWidget, setCurrentWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [connectingStripe, setConnectingStripe] = useState(false);

  const [config, setConfig] = useState(defaultPaymentConfig);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadData();
  }, [user, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const accountId = params.get("account");

    if (success === "true" && accountId && currentWidget) {
      saveStripeAccount(currentWidget.id, accountId);

      setConfig((prev) => ({
        ...prev,
        stripe: {
          ...prev.stripe,
          connected: true,
          accountId: accountId,
          enabled: true,
        },
      }));

      setMessage({
        type: "success",
        text: "✅ Compte Stripe connecté avec succès !",
      });

      window.history.replaceState({}, "", "/dashboard/payment");
    }
  }, [currentWidget]);

  const loadData = async () => {
    if (!user) return;

    const { getUserWidgets } = await import("@/lib/firestore");
    const widgetsResult = await getUserWidgets(user.uid);

    if (widgetsResult.success && widgetsResult.data.length > 0) {
      const widget = widgetsResult.data[0];
      setCurrentWidget(widget);

      const savedConfig = widget.config?.paymentConfig;
      if (savedConfig) {
        setConfig({
          stripe: { ...defaultPaymentConfig.stripe, ...savedConfig.stripe },
          paypal: { ...defaultPaymentConfig.paypal, ...savedConfig.paypal },
          onBoard: { ...defaultPaymentConfig.onBoard, ...savedConfig.onBoard },
          bankTransfer: {
            ...defaultPaymentConfig.bankTransfer,
            ...savedConfig.bankTransfer,
          },
        });
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentWidget) return;

    const hasAtLeastOne =
      config.stripe.enabled ||
      config.paypal.enabled ||
      config.onBoard.enabled ||
      config.bankTransfer.enabled;

    if (!hasAtLeastOne) {
      setMessage({
        type: "error",
        text: "Au moins un mode de paiement doit être activé",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    if (config.paypal.enabled && !config.paypal.email) {
      setMessage({ type: "error", text: "Email PayPal requis" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    if (config.bankTransfer.enabled && !config.bankTransfer.iban) {
      setMessage({ type: "error", text: "IBAN requis pour le virement" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    setSaving(true);
    const result = await updatePaymentConfig(currentWidget.id, config);

    if (result.success) {
      setMessage({ type: "success", text: "✓ Configuration sauvegardée !" });
    } else {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" });
    }

    setSaving(false);
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleConnectStripe = async () => {
    setConnectingStripe(true);

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          widgetId: currentWidget.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Impossible de créer le lien Stripe Connect");
      }
    } catch (error) {
      console.error("Erreur Stripe Connect:", error);
      setMessage({
        type: "error",
        text: "Erreur lors de la connexion à Stripe",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }

    setConnectingStripe(false);
  };

  const handleDisconnectStripe = async () => {
    if (!confirm("Voulez-vous vraiment déconnecter votre compte Stripe ?"))
      return;

    try {
      await fetch("/api/stripe/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: config.stripe.accountId,
        }),
      });

      setConfig((prev) => ({
        ...prev,
        stripe: {
          ...prev.stripe,
          connected: false,
          accountId: null,
          enabled: false,
        },
      }));

      setMessage({ type: "success", text: "Compte Stripe déconnecté" });
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la déconnexion" });
    }
  };

  const updateConfig = (section, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const toggleOnBoardMethod = (method) => {
    setConfig((prev) => ({
      ...prev,
      onBoard: {
        ...prev.onBoard,
        methods: {
          ...prev.onBoard.methods,
          [method]: {
            ...prev.onBoard.methods[method],
            enabled: !prev.onBoard.methods[method].enabled,
          },
        },
      },
    }));
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-stone-50 to-zinc-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-amber-500 border-r-stone-700"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-amber-500 opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-zinc-50">
      {/* Header moderne avec glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-stone-200/50 shadow-lg shadow-stone-900/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-700 via-stone-600 to-amber-600 shadow-lg shadow-stone-900/20 flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-stone-900 to-stone-700 bg-clip-text text-transparent">
              Configuration Paiements
            </h1>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 rounded-lg transition-all duration-200"
          >
            ← Retour
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Message avec effet moderne */}
        {message.text && (
          <div
            className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm transition-all duration-300 ${
              message.type === "success"
                ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border border-emerald-200/50 shadow-emerald-500/10"
                : "bg-gradient-to-r from-rose-50 to-red-50 text-rose-800 border border-rose-200/50 shadow-rose-500/10"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* SECTION 1 : PAIEMENTS EN LIGNE */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="h-10 w-1 bg-gradient-to-b from-stone-700 to-stone-500 rounded-full"></div>
              <div className="absolute inset-0 h-10 w-1 bg-gradient-to-b from-stone-700 to-stone-500 rounded-full blur-sm opacity-50"></div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Paiements en ligne</h2>
              <p className="text-xs text-stone-500 mt-0.5">Stripe & PayPal</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Stripe - Style moderne */}
            <div className="group relative bg-gradient-to-br from-white via-white to-stone-50/30 rounded-2xl border border-stone-200/60 hover:border-stone-300/80 shadow-lg shadow-stone-900/5 hover:shadow-xl hover:shadow-stone-900/10 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-indigo-500/0 group-hover:from-purple-500/5 group-hover:to-indigo-500/5 transition-all duration-500"></div>
              
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">💎</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Stripe</h3>
                      <p className="text-xs text-stone-500">Paiement CB</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer group/toggle">
                    <input
                      type="checkbox"
                      checked={config.stripe.enabled}
                      disabled={!config.stripe.connected}
                      onChange={(e) => updateConfig("stripe", "enabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gradient-to-r from-stone-200 to-stone-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-600 peer-disabled:opacity-40 peer-disabled:cursor-not-allowed"></div>
                  </label>
                </div>

                {config.stripe.connected ? (
                  <div className="space-y-2.5 pt-3 border-t border-stone-200/50">
                    <div className="px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200/50 shadow-sm">
                      <p className="text-xs font-semibold text-emerald-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Connecté
                      </p>
                      <p className="text-xs text-emerald-600 mt-0.5 font-mono">{config.stripe.accountId?.substring(0, 15)}...</p>
                    </div>

                    {config.stripe.enabled && (
                      <>
                        <input
                          type="text"
                          value={config.stripe.label}
                          onChange={(e) => updateConfig("stripe", "label", e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 shadow-sm"
                          placeholder="Libellé"
                        />

                        <label className="flex items-center gap-2.5 px-3 py-2 bg-stone-50/80 hover:bg-stone-100/80 rounded-lg cursor-pointer transition-colors duration-200">
                          <input
                            type="checkbox"
                            checked={config.stripe.requiresDeposit}
                            onChange={(e) => updateConfig("stripe", "requiresDeposit", e.target.checked)}
                            className="w-4 h-4 rounded border-stone-300 text-purple-600 focus:ring-purple-500/20"
                          />
                          <span className="text-xs font-medium text-stone-700">Acompte requis</span>
                        </label>

                        {config.stripe.requiresDeposit && (
                          <input
                            type="number"
                            min="10"
                            max="100"
                            value={config.stripe.depositPercent}
                            onChange={(e) => updateConfig("stripe", "depositPercent", parseInt(e.target.value) || 30)}
                            className="w-24 px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 shadow-sm"
                            placeholder="%"
                          />
                        )}
                      </>
                    )}

                    <button
                      onClick={handleDisconnectStripe}
                      className="w-full px-3 py-2 text-xs font-medium bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 rounded-lg hover:from-rose-100 hover:to-red-100 border border-rose-200/50 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      Déconnecter
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectStripe}
                    disabled={connectingStripe}
                    className="w-full mt-3 px-4 py-2.5 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {connectingStripe ? "Connexion..." : "🔗 Connecter Stripe"}
                  </button>
                )}
              </div>
            </div>

            {/* PayPal - Style moderne */}
            <div className="group relative bg-gradient-to-br from-white via-white to-stone-50/30 rounded-2xl border border-stone-200/60 hover:border-stone-300/80 shadow-lg shadow-stone-900/5 hover:shadow-xl hover:shadow-stone-900/10 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-500"></div>
              
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">🅿️</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">PayPal</h3>
                      <p className="text-xs text-stone-500">En ligne</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.paypal.enabled}
                      onChange={(e) => updateConfig("paypal", "enabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gradient-to-r from-stone-200 to-stone-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-600"></div>
                  </label>
                </div>

                {config.paypal.enabled && (
                  <div className="space-y-2.5 pt-3 border-t border-stone-200/50">
                    <input
                      type="email"
                      value={config.paypal.email}
                      onChange={(e) => updateConfig("paypal", "email", e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      placeholder="email@paypal.com"
                    />
                    <input
                      type="text"
                      value={config.paypal.label}
                      onChange={(e) => updateConfig("paypal", "label", e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      placeholder="Libellé"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 : PAIEMENT AU CHAUFFEUR */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="h-10 w-1 bg-gradient-to-b from-emerald-600 to-green-500 rounded-full"></div>
              <div className="absolute inset-0 h-10 w-1 bg-gradient-to-b from-emerald-600 to-green-500 rounded-full blur-sm opacity-50"></div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Paiement au chauffeur</h2>
              <p className="text-xs text-stone-500 mt-0.5">Espèces, carte, chèque</p>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-white via-white to-stone-50/30 rounded-2xl border border-stone-200/60 hover:border-stone-300/80 shadow-lg shadow-stone-900/5 hover:shadow-xl hover:shadow-stone-900/10 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-green-500/0 group-hover:from-emerald-500/5 group-hover:to-green-500/5 transition-all duration-500"></div>
            
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Paiement à bord</h3>
                    <p className="text-xs text-stone-500">Plusieurs moyens</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.onBoard.enabled}
                    onChange={(e) => updateConfig("onBoard", "enabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gradient-to-r from-stone-200 to-stone-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-600"></div>
                </label>
              </div>

              {config.onBoard.enabled && (
                <div className="space-y-2.5 pt-3 border-t border-stone-200/50">
                  <input
                    type="text"
                    value={config.onBoard.label}
                    onChange={(e) => updateConfig("onBoard", "label", e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                    placeholder="Libellé"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex flex-col items-center gap-2 px-3 py-3 bg-gradient-to-br from-stone-50 to-stone-100/50 hover:from-stone-100 hover:to-stone-200/50 rounded-xl cursor-pointer transition-all duration-200 border border-stone-200/50 hover:border-stone-300/50 shadow-sm hover:shadow group/card">
                      <input
                        type="checkbox"
                        checked={config.onBoard.methods.card.enabled}
                        onChange={() => toggleOnBoardMethod("card")}
                        className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500/20"
                      />
                      <span className="text-2xl transform group-hover/card:scale-110 transition-transform">💳</span>
                      <span className="text-xs font-medium text-stone-700">CB</span>
                    </label>

                    <label className="flex flex-col items-center gap-2 px-3 py-3 bg-gradient-to-br from-stone-50 to-stone-100/50 hover:from-stone-100 hover:to-stone-200/50 rounded-xl cursor-pointer transition-all duration-200 border border-stone-200/50 hover:border-stone-300/50 shadow-sm hover:shadow group/card">
                      <input
                        type="checkbox"
                        checked={config.onBoard.methods.cash.enabled}
                        onChange={() => toggleOnBoardMethod("cash")}
                        className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500/20"
                      />
                      <span className="text-2xl transform group-hover/card:scale-110 transition-transform">💵</span>
                      <span className="text-xs font-medium text-stone-700">Cash</span>
                    </label>

                    <label className="flex flex-col items-center gap-2 px-3 py-3 bg-gradient-to-br from-stone-50 to-stone-100/50 hover:from-stone-100 hover:to-stone-200/50 rounded-xl cursor-pointer transition-all duration-200 border border-stone-200/50 hover:border-stone-300/50 shadow-sm hover:shadow group/card">
                      <input
                        type="checkbox"
                        checked={config.onBoard.methods.check.enabled}
                        onChange={() => toggleOnBoardMethod("check")}
                        className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500/20"
                      />
                      <span className="text-2xl transform group-hover/card:scale-110 transition-transform">📝</span>
                      <span className="text-xs font-medium text-stone-700">Chèque</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3 : VIREMENT BANCAIRE */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="h-10 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
              <div className="absolute inset-0 h-10 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full blur-sm opacity-50"></div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Virement bancaire</h2>
              <p className="text-xs text-stone-500 mt-0.5">Paiement avant course</p>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-white via-white to-stone-50/30 rounded-2xl border border-stone-200/60 hover:border-stone-300/80 shadow-lg shadow-stone-900/5 hover:shadow-xl hover:shadow-stone-900/10 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/5 transition-all duration-500"></div>
            
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Virement</h3>
                    <p className="text-xs text-stone-500">IBAN & BIC</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.bankTransfer.enabled}
                    onChange={(e) => updateConfig("bankTransfer", "enabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gradient-to-r from-stone-200 to-stone-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-600"></div>
                </label>
              </div>

              {config.bankTransfer.enabled && (
                <div className="space-y-2.5 pt-3 border-t border-stone-200/50">
                  <input
                    type="text"
                    value={config.bankTransfer.iban}
                    onChange={(e) => updateConfig("bankTransfer", "iban", e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 shadow-sm font-mono"
                    placeholder="IBAN"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={config.bankTransfer.bic}
                      onChange={(e) => updateConfig("bankTransfer", "bic", e.target.value.toUpperCase())}
                      className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 shadow-sm font-mono"
                      placeholder="BIC"
                    />
                    <input
                      type="text"
                      value={config.bankTransfer.accountName}
                      onChange={(e) => updateConfig("bankTransfer", "accountName", e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 shadow-sm"
                      placeholder="Titulaire"
                    />
                  </div>

                  <textarea
                    value={config.bankTransfer.instructions}
                    onChange={(e) => updateConfig("bankTransfer", "instructions", e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 shadow-sm resize-none"
                    placeholder="Instructions..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde moderne */}
        <div className="sticky bottom-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full group relative px-6 py-3.5 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 hover:from-stone-900 hover:via-stone-800 hover:to-stone-900 text-white text-sm font-bold rounded-xl shadow-2xl shadow-stone-900/30 hover:shadow-stone-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  💾 Sauvegarder la configuration
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}