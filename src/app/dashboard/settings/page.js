"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserWidgets, updateWidget } from "@/lib/firestore";

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [currentWidget, setCurrentWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("branding");
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());
  
  // Nouveaux états pour la gestion du logo
  const [logoInputMethod, setLogoInputMethod] = useState("url"); // "url" ou "upload"
  const [selectedLogoFile, setSelectedLogoFile] = useState(null); // Fichier image PNG/JPEG

  // Détecter le hash dans l'URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (["branding", "texts", "email", "export"].includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  const defaultConfig = {
    branding: {
      companyName: "",
      logo: "",
      // Couleurs par défaut conservées de votre code
      primaryColor: "#2563eb",
      secondaryColor: "#ffffff",
      accentColor: "#3b82f6",
    },
    texts: {
      formTitle: "Réservation VTC",
      formSubtitle: "Calculez votre prix et réservez en quelques clics",
      submitButton: "Réserver & Confirmer le Prix",
    },
    email: {
      adminEmail: "",
      fromName: "",
    },
  };

  const [config, setConfig] = useState(defaultConfig);

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
      const widget = result.data[0];
      setCurrentWidget(widget);

      setConfig({
        branding: {
          ...defaultConfig.branding,
          ...widget.config?.branding,
        },
        texts: {
          ...defaultConfig.texts,
          ...widget.config?.texts,
        },
        email: {
          ...defaultConfig.email,
          ...widget.config?.email,
        },
      });
      
      // Déterminer le mode d'entrée du logo au chargement
      if (widget.config?.branding?.logo) {
          setLogoInputMethod("url");
      } else {
          setLogoInputMethod("url"); // Conserver URL par défaut si vide
      }
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
  
  // Gestion du téléchargement de fichier
  const handleLogoUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg") {
            setSelectedLogoFile(file);
            // On s'assure que le champ URL est vide si on télécharge un fichier
            handleChange("branding", "logo", ""); 
            setMessage({ type: "info", text: `Fichier sélectionné : ${file.name}. N'oubliez pas de sauvegarder.` });
        } else {
            setSelectedLogoFile(null);
            e.target.value = null; // Clear input
            setMessage({ type: "error", text: "Format non supporté. Veuillez choisir un fichier PNG, JPG ou JPEG." });
        }
    } else {
        setSelectedLogoFile(null);
        setMessage({ type: "", text: "" });
    }
  };


  const handleSave = async () => {
    if (!currentWidget) return;

    setSaving(true);
    let finalLogoUrl = config.branding.logo; // Par défaut, on prend l'URL du champ texte

    if (selectedLogoFile && logoInputMethod === "upload") {
        // ========================================================================
        // 🚨 ICI DOIT ÊTRE INTÉGRÉE LA LOGIQUE DE TÉLÉCHARGEMENT DE FICHIER 🚨
        // 1. Upload selectedLogoFile vers un service de stockage (Firebase Storage, S3, etc.)
        // 2. Récupérer l'URL publique de l'image uploadée.
        // 3. Assigner cette URL à finalLogoUrl.
        
        // Ex:
        // const uploadResult = await uploadFile(selectedLogoFile, user.uid);
        // if (uploadResult.success) {
        //     finalLogoUrl = uploadResult.url;
        // } else {
        //     // Gérer l'erreur d'upload
        //     setSaving(false);
        //     setMessage({ type: "error", text: "Échec de l'upload du logo." });
        //     return;
        // }
        // ========================================================================
        
        // Pour cet exemple, nous conservons `finalLogoUrl` à sa valeur actuelle (vide si fichier sélectionné).
        // Si vous voulez effacer l'ancien logo en attendant le nouvel upload:
        finalLogoUrl = '';
    }
    
    // Si on est en mode URL ou si l'upload a réussi (et a mis à jour finalLogoUrl)
    const result = await updateWidget(currentWidget.id, {
      ...currentWidget,
      config: {
        ...currentWidget.config,
        branding: {
          ...config.branding,
          logo: finalLogoUrl,
        },
        texts: config.texts,
        email: config.email,
      },
    });

    if (result.success) {
      setMessage({
        type: "success",
        text: "✅ Paramètres enregistrés avec succès !",
      });
      // Effacer le fichier temporaire pour éviter un double envoi
      setSelectedLogoFile(null); 
      setIframeKey(Date.now());
    } else {
      setMessage({ type: "error", text: "❌ Erreur lors de la sauvegarde" });
    }

    setSaving(false);
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const getWidgetUrl = () => {
    if (!currentWidget) return "";
    return `${
      typeof window !== "undefined" ? window.location.origin : ""
    }/widget/${currentWidget.id}`;
  };

  const getIframeCode = () => {
    return `<iframe src="${getWidgetUrl()}" width="100%" height="800" frameborder="0" style="border:none; border-radius:12px;"></iframe>`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                ⚙️ Paramètres
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Personnalisez votre formulaire
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex-shrink-0"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Message */}
        {message.text && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : message.type === "info" 
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 bg-white p-1.5 sm:p-2 rounded-xl shadow overflow-x-auto">
          {[
            { id: "branding", label: "🎨 Apparence", shortLabel: "🎨" },
            { id: "texts", label: "✏️ Textes", shortLabel: "✏️" },
            { id: "email", label: "📧 Email", shortLabel: "📧" },
            { id: "export", label: "🔗 Exporter", shortLabel: "🔗" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[70px] px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all text-xs sm:text-base whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-lg font-medium">
                {tab.shortLabel}
              </span>{" "}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Tab Branding */}
            {activeTab === "branding" && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  🎨 Personnalisation
                </h3>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom de votre entreprise
                    </label>
                    <input
                      type="text"
                      value={config.branding.companyName}
                      onChange={(e) =>
                        handleChange("branding", "companyName", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="VTC Premium Paris"
                    />
                  </div>

                  {/* NOUVELLE SECTION LOGO URL / UPLOAD */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Logo de l'entreprise (PNG, JPG)
                    </label>
                    
                    {/* SÉLECTION DU MODE */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-3">
                      <button
                        onClick={() => {
                          setLogoInputMethod("url");
                          setSelectedLogoFile(null); // Clear file when switching
                          setMessage({ type: "", text: "" });
                        }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                          logoInputMethod === "url"
                            ? "bg-white shadow text-blue-700"
                            : "text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        Lien (URL)
                      </button>
                      <button
                        onClick={() => {
                          setLogoInputMethod("upload");
                          handleChange("branding", "logo", ""); // Clear URL when switching
                          setMessage({ type: "", text: "" });
                        }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                          logoInputMethod === "upload"
                            ? "bg-white shadow text-blue-700"
                            : "text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        Télécharger (Fichier)
                      </button>
                    </div>

                    {/* INPUT URL */}
                    {logoInputMethod === "url" && (
                        <>
                            <input
                                type="url"
                                value={config.branding.logo}
                                onChange={(e) => {
                                    handleChange("branding", "logo", e.target.value);
                                    setSelectedLogoFile(null); // Clear file state if user manually types URL
                                    setMessage({ type: "", text: "" });
                                }}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                placeholder="https://exemple.com/logo.png"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                URL de votre logo. Laissez vide si vous utilisez l'option 'Télécharger'.
                            </p>
                            {config.branding.logo && (
                                <p className="text-xs text-blue-600 mt-2">
                                    Logo actuel : <span className="font-mono text-gray-500 truncate inline-block max-w-full">{config.branding.logo}</span>
                                </p>
                            )}
                        </>
                    )}

                    {/* INPUT UPLOAD */}
                    {logoInputMethod === "upload" && (
                        <>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleLogoUploadChange}
                                className="w-full block text-sm text-gray-900 border-2 border-gray-200 rounded-xl cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Formats supportés : PNG, JPEG. Taille recommandée : 200x60px.
                            </p>
                            {selectedLogoFile && (
                                <p className="text-sm font-medium text-green-700 mt-2">
                                   Fichier sélectionné : **{selectedLogoFile.name}**
                                   <span className="text-xs text-gray-500 ml-2">(Sauvegardez pour l'uploader)</span>
                                </p>
                            )}
                        </>
                    )}
                  </div>
                  {/* FIN NOUVELLE SECTION LOGO */}


                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Couleur principale
                      </label>
                      <input
                        type="color"
                        value={config.branding.primaryColor}
                        onChange={(e) =>
                          handleChange(
                            "branding",
                            "primaryColor",
                            e.target.value
                          )
                        }
                        className="w-full h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className="w-full h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Couleur accent
                      </label>
                      <input
                        type="color"
                        value={config.branding.accentColor}
                        onChange={(e) =>
                          handleChange(
                            "branding",
                            "accentColor",
                            e.target.value
                          )
                        }
                        className="w-full h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Palettes prédéfinies - Visible uniquement sur PC */}
                  <div className="hidden md:block mt-8 pt-6 border-t-2 border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">🎨</span>
                      Palettes prédéfinies
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Cliquez sur une palette pour appliquer les couleurs instantanément
                    </p>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Palette 1: Élégance Marron */}
                      <button
                        onClick={() => {
                          handleChange("branding", "primaryColor", "#5D4037");
                          handleChange("branding", "secondaryColor", "#F5F5F4");
                          handleChange("branding", "accentColor", "#D97706");
                        }}
                        className="group relative p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#5D4037] shadow-sm"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#F5F5F4] border border-gray-200"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#D97706] shadow-sm"></div>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-gray-900">Élégance Marron</p>
                          <p className="text-xs text-gray-500">Chic & professionnel</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-stone-500/0 group-hover:from-amber-500/5 group-hover:to-stone-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                      </button>

                      {/* Palette 2: Océan Professionnel */}
                      <button
                        onClick={() => {
                          handleChange("branding", "primaryColor", "#1E40AF");
                          handleChange("branding", "secondaryColor", "#FFFFFF");
                          handleChange("branding", "accentColor", "#3B82F6");
                        }}
                        className="group relative p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#1E40AF] shadow-sm"></div>
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#3B82F6] shadow-sm"></div>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-gray-900">Océan Business</p>
                          <p className="text-xs text-gray-500">Confiance & sérieux</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                      </button>

                      {/* Palette 3: Forêt Premium */}
                      <button
                        onClick={() => {
                          handleChange("branding", "primaryColor", "#065F46");
                          handleChange("branding", "secondaryColor", "#F0FDF4");
                          handleChange("branding", "accentColor", "#10B981");
                        }}
                        className="group relative p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#065F46] shadow-sm"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] border border-gray-200"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#10B981] shadow-sm"></div>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-gray-900">Forêt Premium</p>
                          <p className="text-xs text-gray-500">Nature & luxe</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/5 group-hover:to-green-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                      </button>

                      {/* Palette 4: Nuit Luxury */}
                      <button
                        onClick={() => {
                          handleChange("branding", "primaryColor", "#1F2937");
                          handleChange("branding", "secondaryColor", "#F9FAFB");
                          handleChange("branding", "accentColor", "#F59E0B");
                        }}
                        className="group relative p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#1F2937] shadow-sm"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] border border-gray-200"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#F59E0B] shadow-sm"></div>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-gray-900">Nuit Luxury</p>
                          <p className="text-xs text-gray-500">Moderne & chic</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/0 to-amber-500/0 group-hover:from-gray-500/5 group-hover:to-amber-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                      </button>

                      {/* Palette 5: Sunset Business */}
                      <button
                        onClick={() => {
                          handleChange("branding", "primaryColor", "#DC2626");
                          handleChange("branding", "secondaryColor", "#FEF2F2");
                          handleChange("branding", "accentColor", "#F97316");
                        }}
                        className="group relative p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#DC2626] shadow-sm"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] border border-gray-200"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#F97316] shadow-sm"></div>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-gray-900">Sunset Business</p>
                          <p className="text-xs text-gray-500">Énergie & passion</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/5 group-hover:to-orange-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                      </button>

                      {/* Palette 6: Lavande Élégante */}
                      <button
                        onClick={() => {
                          handleChange("branding", "primaryColor", "#7C3AED");
                          handleChange("branding", "secondaryColor", "#FAF5FF");
                          handleChange("branding", "accentColor", "#A78BFA");
                        }}
                        className="group relative p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#7C3AED] shadow-sm"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#FAF5FF] border border-gray-200"></div>
                          <div className="w-10 h-10 rounded-lg bg-[#A78BFA] shadow-sm"></div>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-gray-900">Lavande Élégante</p>
                          <p className="text-xs text-gray-500">Créatif & distingué</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-violet-500/0 group-hover:from-purple-500/5 group-hover:to-violet-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Texts */}
            {activeTab === "texts" && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  ✏️ Textes
                </h3>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Titre du formulaire
                    </label>
                    <input
                      type="text"
                      value={config.texts.formTitle}
                      onChange={(e) =>
                        handleChange("texts", "formTitle", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Réservation VTC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sous-titre
                    </label>
                    <input
                      type="text"
                      value={config.texts.formSubtitle}
                      onChange={(e) =>
                        handleChange("texts", "formSubtitle", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Calculez votre prix"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Texte du bouton
                    </label>
                    <input
                      type="text"
                      value={config.texts.submitButton}
                      onChange={(e) =>
                        handleChange("texts", "submitButton", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Réserver"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab Email */}
            {activeTab === "email" && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  📧 Notifications
                </h3>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Votre email *
                    </label>
                    <input
                      type="email"
                      value={config.email.adminEmail}
                      onChange={(e) =>
                        handleChange("email", "adminEmail", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="contact@vtc.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Les réservations seront envoyées ici
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom expéditeur
                    </label>
                    <input
                      type="text"
                      value={config.email.fromName}
                      onChange={(e) =>
                        handleChange("email", "fromName", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="VTC Premium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab Export */}
            {activeTab === "export" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Lien direct */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    🔗 Lien direct
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Partagez ce lien avec vos clients.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getWidgetUrl()}
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-mono text-xs sm:text-sm overflow-x-auto"
                    />
                    <button
                      onClick={() => copyToClipboard(getWidgetUrl())}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                    >
                      {copied ? "✓ Copié !" : "📋 Copier"}
                    </button>
                  </div>

                  <a
                    href={getWidgetUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 sm:mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    🔗 Ouvrir →
                  </a>
                </div>

                {/* iFrame */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    📦 Code iFrame
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Intégrez sur WordPress, Wix, etc.
                  </p>

                  <div className="relative">
                    <pre className="p-3 sm:p-4 bg-gray-900 text-green-400 rounded-xl text-xs sm:text-sm overflow-x-auto">
                      {getIframeCode()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(getIframeCode())}
                      className="absolute top-2 right-2 px-2 sm:px-3 py-1 bg-gray-700 text-white rounded-lg text-xs hover:bg-gray-600"
                    >
                      {copied ? "✓" : "Copier"}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">
                    💡 Comment intégrer ?
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
                    <li>
                      <strong>WordPress :</strong> Bloc "HTML personnalisé"
                    </li>
                    <li>
                      <strong>Wix :</strong> Élément "Embed HTML"
                    </li>
                    <li>
                      <strong>Squarespace :</strong> Bloc "Code"
                    </li>
                    <li>
                      <strong>HTML :</strong> Collez directement
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Bouton Sauvegarder */}
            {activeTab !== "export" && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm sm:text-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {saving ? "⏳ Enregistrement..." : "💾 Enregistrer"}
              </button>
            )}
          </div>

          {/* Aperçu - Masqué sur mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">👁️ Aperçu</h3>
                  {currentWidget && (
                    <a
                      href={`/widget/${currentWidget.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ouvrir ↗
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Sauvegardez pour voir les changements
                </p>
              </div>

              {currentWidget && (
                <div
                  className="relative bg-gray-100"
                  style={{ height: "600px" }}
                >
                  <iframe
                    key={iframeKey}
                    src={`/widget/${currentWidget.id}`}
                    className="w-full h-full border-0"
                    title="Aperçu"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}