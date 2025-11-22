"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createWidget, getUserWidgets, updateWidget } from "@/lib/firestore";

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [widgets, setWidgets] = useState([]);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [config, setConfig] = useState({
    branding: {
      companyName: "",
      logo: "",
      primaryColor: "#2563eb",
      secondaryColor: "#1e40af",
      accentColor: "#3b82f6",
    },
    pricing: {
      baseFee: 10.0,
      pricePerKm: {
        berline: 1.2,
        van: 1.8,
        prestige: 3.0,
      },
      supplements: {
        extraLuggage: 5.0,
        nightSurcharge: 15.0,
      },
      enableNightSurcharge: true,
      enableLuggageOption: true,
      nightHours: {
        start: 22,
        end: 6,
      },
    },
    email: {
      smtpHost: "",
      smtpPort: 465,
      smtpUser: "",
      smtpPassword: "",
      adminEmail: "",
      fromName: "",
    },
    vehicles: {
      berline: {
        enabled: true,
        name: "Berline Confort",
        description: "Véhicule standard 4 places",
        maxPassengers: 3,
      },
      van: {
        enabled: true,
        name: "Van 7 Places",
        description: "Idéal pour groupes ou familles",
        maxPassengers: 7,
      },
      prestige: {
        enabled: true,
        name: "Véhicule Prestige",
        description: "Berline haut de gamme",
        maxPassengers: 3,
      },
    },
    texts: {
      formTitle: "Réservation VTC",
      formSubtitle: "Calculez votre prix et réservez en quelques clics",
      submitButton: "Réserver & Confirmer le Prix",
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadWidgets();
  }, [user, router]);

  const loadWidgets = async () => {
    if (!user) return;

    const result = await getUserWidgets(user.uid);
    if (result.success && result.data.length > 0) {
      setWidgets(result.data);
      setCurrentWidget(result.data[0]);
      setConfig(result.data[0].config);
    }
    setLoading(false);
  };

  const handleChange = (section, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (currentWidget) {
        // Mise à jour du widget existant
        const result = await updateWidget(currentWidget.id, { config });
        if (result.success) {
          setMessage({
            type: "success",
            text: "✅ Configuration enregistrée avec succès !",
          });
        } else {
          setMessage({
            type: "error",
            text: "❌ Erreur lors de la sauvegarde",
          });
        }
      } else {
        // Création d'un nouveau widget
        const result = await createWidget(user.uid, config);
        if (result.success) {
          setMessage({ type: "success", text: "✅ Widget créé avec succès !" });
          loadWidgets(); // Recharger la liste
        } else {
          setMessage({ type: "error", text: "❌ Erreur lors de la création" });
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ " + error.message });
    }

    setSaving(false);
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configuration du Widget
              </h1>
              <p className="text-sm text-gray-600">
                Personnalisez votre widget de réservation
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de succès/erreur */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Aperçu */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Aperçu</h3>

              <div
                className="border-2 rounded-lg p-4 mb-4"
                style={{
                  borderColor: config.branding.primaryColor,
                  backgroundColor: `${config.branding.primaryColor}10`,
                }}
              >
                <h4
                  className="font-bold text-lg mb-2"
                  style={{ color: config.branding.primaryColor }}
                >
                  {config.branding.companyName || "Votre Entreprise"}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {config.texts.formTitle}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Frais de base:</span>
                    <span className="font-semibold">
                      {config.pricing.baseFee.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Berline:</span>
                    <span className="font-semibold">
                      {config.pricing.pricePerKm.berline.toFixed(2)} €/km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Van:</span>
                    <span className="font-semibold">
                      {config.pricing.pricePerKm.van.toFixed(2)} €/km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prestige:</span>
                    <span className="font-semibold">
                      {config.pricing.pricePerKm.prestige.toFixed(2)} €/km
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Enregistrement..."
                  : "💾 Enregistrer la configuration"}
              </button>

              {currentWidget && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">ID du widget:</p>
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    {currentWidget.id}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Branding */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🎨 Branding
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={config.branding.companyName}
                    onChange={(e) =>
                      handleChange("branding", "companyName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="VTC Premium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Couleur principale
                    </label>
                    <input
                      type="color"
                      value={config.branding.primaryColor}
                      onChange={(e) =>
                        handleChange("branding", "primaryColor", e.target.value)
                      }
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Couleur secondaire
                    </label>
                    <input
                      type="color"
                      value={config.branding.secondaryColor}
                      onChange={(e) =>
                        handleChange(
                          "branding",
                          "secondaryColor",
                          e.target.value
                        )
                      }
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Couleur accent
                    </label>
                    <input
                      type="color"
                      value={config.branding.accentColor}
                      onChange={(e) =>
                        handleChange("branding", "accentColor", e.target.value)
                      }
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tarifs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                💰 Tarifs
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frais de base (€)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.pricing.baseFee}
                    onChange={(e) =>
                      handleChange(
                        "pricing",
                        "baseFee",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Berline (€/km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.pricing.pricePerKm.berline}
                      onChange={(e) =>
                        handleNestedChange(
                          "pricing",
                          "pricePerKm",
                          "berline",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Van (€/km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.pricing.pricePerKm.van}
                      onChange={(e) =>
                        handleNestedChange(
                          "pricing",
                          "pricePerKm",
                          "van",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prestige (€/km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.pricing.pricePerKm.prestige}
                      onChange={(e) =>
                        handleNestedChange(
                          "pricing",
                          "pricePerKm",
                          "prestige",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bagage supplémentaire (€)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.pricing.supplements.extraLuggage}
                      onChange={(e) =>
                        handleNestedChange(
                          "pricing",
                          "supplements",
                          "extraLuggage",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplément nuit (€)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.pricing.supplements.nightSurcharge}
                      onChange={(e) =>
                        handleNestedChange(
                          "pricing",
                          "supplements",
                          "nightSurcharge",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📧 Notifications Email
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre email (où recevoir les réservations) *
                  </label>
                  <input
                    type="email"
                    value={config.email?.adminEmail || ""}
                    onChange={(e) =>
                      handleChange("email", "adminEmail", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="votre-email@exemple.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Les réservations seront envoyées automatiquement à cette
                    adresse
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de votre entreprise (apparaîtra dans l'email)
                  </label>
                  <input
                    type="text"
                    value={
                      config.email?.fromName ||
                      config.branding?.companyName ||
                      ""
                    }
                    onChange={(e) =>
                      handleChange("email", "fromName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="VTC Premium"
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️{" "}
                    <strong>Pas de configuration technique nécessaire !</strong>
                    <br />
                    Nous gérons l'envoi des emails pour vous. Vous recevrez
                    automatiquement une notification à chaque nouvelle
                    réservation.
                  </p>
                </div>
              </div>
            </div>

            {/* Textes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                ✏️ Textes personnalisables
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du formulaire
                  </label>
                  <input
                    type="text"
                    value={config.texts.formTitle}
                    onChange={(e) =>
                      handleChange("texts", "formTitle", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={config.texts.formSubtitle}
                    onChange={(e) =>
                      handleChange("texts", "formSubtitle", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texte du bouton de soumission
                  </label>
                  <input
                    type="text"
                    value={config.texts.submitButton}
                    onChange={(e) =>
                      handleChange("texts", "submitButton", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bouton de sauvegarde en bas aussi */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Enregistrement..." : "💾 Enregistrer la configuration"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
