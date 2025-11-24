"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserWidgets, updatePackages } from "@/lib/firestore";
import { defaultPackages } from "@/config/vehicleConfig";

export default function PackagesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [widgets, setWidgets] = useState([]);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [packages, setPackages] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  // Recherche d'adresses
  const [departureSearch, setDepartureSearch] = useState("");
  const [arrivalSearch, setArrivalSearch] = useState("");
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
  const [searchingDeparture, setSearchingDeparture] = useState(false);
  const [searchingArrival, setSearchingArrival] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    departureZones: [],
    arrivalZones: [],
    vehicleTypes: [],
    description: "",
    enabled: true,
  });

  // Départements français
  const departments = [
    { code: "75", name: "Paris" },
    { code: "77", name: "Seine-et-Marne" },
    { code: "78", name: "Yvelines" },
    { code: "91", name: "Essonne" },
    { code: "92", name: "Hauts-de-Seine" },
    { code: "93", name: "Seine-Saint-Denis" },
    { code: "94", name: "Val-de-Marne" },
    { code: "95", name: "Val-d'Oise" },
    { code: "06", name: "Alpes-Maritimes" },
    { code: "13", name: "Bouches-du-Rhône" },
    { code: "33", name: "Gironde" },
    { code: "59", name: "Nord" },
    { code: "69", name: "Rhône" },
  ];

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;

    const widgetsResult = await getUserWidgets(user.uid);
    if (widgetsResult.success && widgetsResult.data.length > 0) {
      setWidgets(widgetsResult.data);
      const widget = widgetsResult.data[0];
      setCurrentWidget(widget);
      setPackages(widget.config?.packages || defaultPackages);
      setVehicles(widget.config?.vehicleCategories || []);
    }
    setLoading(false);
  };

  // Recherche d'adresses avec Google Maps Places API
  const searchAddress = async (query, type) => {
    if (query.length < 3) {
      if (type === "departure") setDepartureSuggestions([]);
      else setArrivalSuggestions([]);
      return;
    }

    try {
      if (type === "departure") setSearchingDeparture(true);
      else setSearchingArrival(true);

      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Erreur Google API:", data.status);
        if (type === "departure") setSearchingDeparture(false);
        else setSearchingArrival(false);
        return;
      }

      const predictions = data.predictions || [];

      const suggestions = await Promise.all(
        predictions.slice(0, 8).map(async (prediction) => {
          try {
            const detailsResponse = await fetch(
              `/api/places/details?place_id=${encodeURIComponent(
                prediction.place_id
              )}`
            );

            const detailsData = await detailsResponse.json();

            if (detailsData.status === "OK") {
              const place = detailsData.result;
              const location = place.geometry?.location;

              let city = "";
              let postcode = "";

              place.address_components?.forEach((component) => {
                if (component.types.includes("locality")) {
                  city = component.long_name;
                }
                if (component.types.includes("postal_code")) {
                  postcode = component.short_name;
                }
              });

              let icon = "📍";
              const types = place.types || [];
              if (
                types.includes("train_station") ||
                types.includes("transit_station")
              ) {
                icon = "🚂";
              } else if (types.includes("airport")) {
                icon = "✈️";
              }

              return {
                label: prediction.description,
                city: city,
                postcode: postcode,
                context: `${city}${postcode ? " (" + postcode + ")" : ""}`,
                type: types[0] || "address",
                lat: location.lat,
                lon: location.lng,
                source: "google",
                icon: icon,
              };
            }
          } catch (err) {
            console.error("Erreur détails:", err);
          }
          return null;
        })
      );

      const validSuggestions = suggestions.filter((s) => s !== null);

      if (type === "departure") {
        setDepartureSuggestions(validSuggestions);
      } else {
        setArrivalSuggestions(validSuggestions);
      }
    } catch (error) {
      console.error("Erreur recherche adresse:", error);
    } finally {
      if (type === "departure") setSearchingDeparture(false);
      else setSearchingArrival(false);
    }
  };

  // Débounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (departureSearch) searchAddress(departureSearch, "departure");
    }, 300);
    return () => clearTimeout(timer);
  }, [departureSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (arrivalSearch) searchAddress(arrivalSearch, "arrival");
    }, 300);
    return () => clearTimeout(timer);
  }, [arrivalSearch]);

  const handleSave = async () => {
    if (!currentWidget) return;

    setSaving(true);
    const result = await updatePackages(currentWidget.id, packages);

    if (result.success) {
      setMessage({
        type: "success",
        text: "✓ Forfaits sauvegardés avec succès !",
      });
    } else {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" });
    }

    setSaving(false);
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const openAddModal = () => {
    setEditingPackage(null);
    setFormData({
      name: "",
      price: 0,
      departureZones: [],
      arrivalZones: [],
      vehicleTypes: [],
      description: "",
      enabled: true,
    });
    setDepartureSearch("");
    setArrivalSearch("");
    setShowModal(true);
  };

  const openEditModal = (pack) => {
    setEditingPackage(pack);
    setFormData({
      name: pack.name,
      price: pack.price,
      departureZones: pack.departureZones || [],
      arrivalZones: pack.arrivalZones || [],
      vehicleTypes: pack.vehicleTypes || [],
      description: pack.description || "",
      enabled: pack.enabled,
    });
    setDepartureSearch("");
    setArrivalSearch("");
    setShowModal(true);
  };

  const handleSubmitPackage = () => {
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Le nom est obligatoire" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    if (
      formData.departureZones.length === 0 ||
      formData.arrivalZones.length === 0
    ) {
      setMessage({
        type: "error",
        text: "Les zones de départ et arrivée sont obligatoires",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    if (!formData.vehicleTypes || formData.vehicleTypes.length === 0) {
      setMessage({
        type: "error",
        text: "Sélectionnez au moins un véhicule compatible",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }
    if (editingPackage) {
      // Modification
      setPackages(
        packages.map((p) =>
          p.id === editingPackage.id ? { ...p, ...formData } : p
        )
      );
      setMessage({
        type: "success",
        text: `✓ Forfait "${formData.name}" modifié ! N'oubliez pas de sauvegarder.`,
      });
    } else {
      // Création
      const pack = {
        id: `package-${Date.now()}`,
        ...formData,
        price: parseFloat(formData.price),
      };
      setPackages([...packages, pack]);
      setMessage({
        type: "success",
        text: `✓ Forfait "${pack.name}" créé ! N'oubliez pas de sauvegarder.`,
      });
    }

    setShowModal(false);
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleDeletePackage = (id) => {
    if (confirm("Supprimer ce forfait ?")) {
      setPackages(packages.filter((p) => p.id !== id));
      setMessage({
        type: "success",
        text: "Forfait supprimé ! N'oubliez pas de sauvegarder.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const toggleVehicleType = (vehicleId) => {
    const types = formData.vehicleTypes || [];
    const newTypes = types.includes(vehicleId)
      ? types.filter((t) => t !== vehicleId)
      : [...types, vehicleId];
    setFormData({ ...formData, vehicleTypes: newTypes });
  };

  const addZone = (zoneType, value) => {
    const field = zoneType === "departure" ? "departureZones" : "arrivalZones";
    const currentZones = formData[field] || [];

    if (
      !currentZones.includes(value) &&
      !currentZones.some((z) => typeof z !== "string" && z.name === value)
    ) {
      setFormData({
        ...formData,
        [field]: [...currentZones, value],
      });
    }
  };

  const removeZone = (zoneType, index) => {
    const field = zoneType === "departure" ? "departureZones" : "arrivalZones";
    const newZones = [...formData[field]];
    newZones.splice(index, 1);
    setFormData({
      ...formData,
      [field]: newZones,
    });
  };

  const addAddressZone = (zoneType, suggestion) => {
    const field = zoneType === "departure" ? "departureZones" : "arrivalZones";
    const currentZones = formData[field] || [];

    const zone = {
      name: suggestion.label.split(",")[0].trim(),
      lat: suggestion.lat,
      lon: suggestion.lon,
      label: suggestion.label,
    };

    const alreadyExists = currentZones.some(
      (z) =>
        Math.abs(z.lat - zone.lat) < 0.001 && Math.abs(z.lon - zone.lon) < 0.001
    );

    if (!alreadyExists) {
      setFormData({
        ...formData,
        [field]: [...currentZones, zone],
      });
    }

    if (zoneType === "departure") {
      setDepartureSearch("");
      setDepartureSuggestions([]);
    } else {
      setArrivalSearch("");
      setArrivalSuggestions([]);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  from-green-100 via-grey-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-gray-600 bg-clip-text text-transparent">
                Gestion des Forfaits
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {packages.length} forfait{packages.length !== 1 ? "s" : ""}{" "}
                configuré{packages.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Message de feedback */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-lg border-2 animate-in fade-in slide-in-from-top-2 ${
              message.type === "success"
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Bouton ajouter */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-gray-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nouveau forfait
          </button>
        </div>

        {/* Liste des forfaits */}
        {packages.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-green-200 shadow-lg">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aucun forfait
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier forfait pour automatiser vos tarifs
            </p>
            <button
              onClick={openAddModal}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
            >
              Créer un forfait
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {packages.map((pack) => (
              <div
                key={pack.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-2xl hover:border-green-300 transition-all p-6"
              >
                {/* Header du forfait */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {pack.name}
                      </h3>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                          pack.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {pack.enabled ? "✓ Actif" : "○ Inactif"}
                      </span>
                    </div>
                    {pack.description && (
                      <p className="text-sm text-gray-600">
                        {pack.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(pack)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pack.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Prix */}
                <div className="mb-4">
                  <div className="inline-flex items-baseline px-4 py-2 bg-gradient-to-r from-green-500 to-gray-500 text-white rounded-xl shadow-md">
                    <span className="text-3xl font-bold">{pack.price}</span>
                    <span className="text-lg ml-1">€</span>
                  </div>
                </div>

                {/* Zones */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📍</span>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Départ
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(pack.departureZones || []).map((zone, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200"
                        >
                          {typeof zone === "string" ? zone : zone.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎯</span>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Arrivée
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(pack.arrivalZones || []).map((zone, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                        >
                          {typeof zone === "string" ? zone : zone.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Véhicules */}
                {pack.vehicleTypes && pack.vehicleTypes.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                      Véhicules compatibles
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pack.vehicleTypes.map((vId) => {
                        const vehicle = vehicles.find((v) => v.id === vId);
                        return vehicle ? (
                          <span
                            key={vId}
                            className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 flex items-center gap-1"
                          >
                            <span>{vehicle.icon}</span>
                            <span>{vehicle.name}</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bouton sauvegarder fixe */}
        {packages.length > 0 && (
          <div className="sticky bottom-6 bg-white/90 backdrop-blur-sm border-2 border-green-300 rounded-2xl p-4 shadow-2xl">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-gray-600 text-white rounded-xl hover:shadow-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enregistrement...
                </span>
              ) : (
                "💾 Sauvegarder les modifications"
              )}
            </button>
          </div>
        )}

        {/* Modal création/édition */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
              {/* Header du modal */}
              <div className="px-6 py-5 bg-gradient-to-r from-green-600 to-gray-600 text-white">
                <h3 className="text-2xl font-bold">
                  {editingPackage
                    ? "✏️ Modifier le forfait"
                    : "➕ Nouveau forfait"}
                </h3>
                <p className="text-sm text-white/80 mt-1">
                  {editingPackage
                    ? "Modifiez les informations du forfait"
                    : "Configurez votre nouveau forfait à prix fixe"}
                </p>
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  {/* Infos de base */}
                  <div className="bg-gradient-to-br from-green-50 to-gray-50 rounded-2xl p-5 border-2 border-green-200">
                    <h4 className="font-bold text-lg mb-4 text-green-900">
                      📋 Informations générales
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          Nom du forfait *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Ex: CDG → Paris Centre"
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          Prix (€) *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          placeholder="100"
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Description (optionnel)
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Ex: Forfait aéroport avec assistance bagages"
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.enabled}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              enabled: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Activer ce forfait immédiatement
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Zone de départ */}
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-5 border-2 border-blue-200">
                    <h4 className="font-bold text-lg mb-3 text-blue-900 flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      Zones de départ
                    </h4>

                    {/* Tags sélectionnés */}
                    <div className="mb-4 flex flex-wrap gap-2 min-h-[50px] p-3 bg-white rounded-xl border-2 border-blue-200">
                      {formData.departureZones.length === 0 ? (
                        <span className="text-gray-400 text-sm italic">
                          Recherchez une gare, aéroport ou sélectionnez un
                          département
                        </span>
                      ) : (
                        formData.departureZones.map((zone, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl text-sm font-semibold shadow-md"
                          >
                            {typeof zone === "string" ? zone : zone.name}
                            <button
                              onClick={() => removeZone("departure", idx)}
                              className="hover:text-red-200 font-bold text-lg"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Recherche */}
                    <div className="mb-4 relative">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        🔍 Rechercher une adresse :
                      </label>
                      <input
                        type="text"
                        value={departureSearch}
                        onChange={(e) => setDepartureSearch(e.target.value)}
                        placeholder="Gare de Lyon, Aéroport CDG, Paris..."
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      {searchingDeparture && (
                        <div className="absolute right-4 top-11">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                      )}

                      {/* Suggestions */}
                      {departureSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blue-300 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                          {departureSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                addAddressZone("departure", suggestion)
                              }
                              className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0 transition-colors flex items-start gap-3"
                            >
                              <span className="text-2xl flex-shrink-0">
                                {suggestion.icon}
                              </span>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                  {suggestion.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {suggestion.context}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Départements */}
                    <div>
                      <p className="text-sm font-semibold mb-2 text-gray-700">
                        📌 Ou sélectionnez un département :
                      </p>
                      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                        {departments.map((dept) => (
                          <button
                            key={dept.code}
                            onClick={() => addZone("departure", dept.code)}
                            title={dept.name}
                            className={`px-3 py-2 text-sm font-semibold border-2 rounded-lg transition-all ${
                              formData.departureZones.includes(dept.code)
                                ? "bg-gradient-to-r from-blue-500 to-green-500 text-white border-blue-600 shadow-md"
                                : "bg-white hover:bg-blue-50 border-gray-300 text-gray-700"
                            }`}
                          >
                            {dept.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Zone d'arrivée */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
                    <h4 className="font-bold text-lg mb-3 text-green-900 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      Zones d'arrivée
                    </h4>

                    {/* Tags sélectionnés */}
                    <div className="mb-4 flex flex-wrap gap-2 min-h-[50px] p-3 bg-white rounded-xl border-2 border-green-200">
                      {formData.arrivalZones.length === 0 ? (
                        <span className="text-gray-400 text-sm italic">
                          Recherchez une gare, aéroport ou sélectionnez un
                          département
                        </span>
                      ) : (
                        formData.arrivalZones.map((zone, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md"
                          >
                            {typeof zone === "string" ? zone : zone.name}
                            <button
                              onClick={() => removeZone("arrival", idx)}
                              className="hover:text-red-200 font-bold text-lg"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Recherche */}
                    <div className="mb-4 relative">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        🔍 Rechercher une adresse :
                      </label>
                      <input
                        type="text"
                        value={arrivalSearch}
                        onChange={(e) => setArrivalSearch(e.target.value)}
                        placeholder="Gare du Nord, Paris, Lyon..."
                        className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                      />
                      {searchingArrival && (
                        <div className="absolute right-4 top-11">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        </div>
                      )}

                      {/* Suggestions */}
                      {arrivalSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-green-300 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                          {arrivalSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                addAddressZone("arrival", suggestion)
                              }
                              className="w-full px-4 py-3 text-left hover:bg-green-50 border-b last:border-b-0 transition-colors flex items-start gap-3"
                            >
                              <span className="text-2xl flex-shrink-0">
                                {suggestion.icon}
                              </span>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                  {suggestion.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {suggestion.context}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Départements */}
                    <div>
                      <p className="text-sm font-semibold mb-2 text-gray-700">
                        📌 Ou sélectionnez un département :
                      </p>
                      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                        {departments.map((dept) => (
                          <button
                            key={dept.code}
                            onClick={() => addZone("arrival", dept.code)}
                            title={dept.name}
                            className={`px-3 py-2 text-sm font-semibold border-2 rounded-lg transition-all ${
                              formData.arrivalZones.includes(dept.code)
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600 shadow-md"
                                : "bg-white hover:bg-green-50 border-gray-300 text-gray-700"
                            }`}
                          >
                            {dept.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Véhicules compatibles */}
                  {vehicles.length > 0 && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-50 rounded-2xl p-5 border-2 border-gray-200">
                      <h4 className="font-bold text-lg mb-3 text-gray-900">
                        🚗 Types de véhicules compatibles
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          (optionnel - vide = tous)
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {vehicles
                          .filter((v) => v.enabled)
                          .map((vehicle) => (
                            <label
                              key={vehicle.id}
                              className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                                (formData.vehicleTypes || []).includes(
                                  vehicle.id
                                )
                                  ? "bg-gradient-to-r from-gray-100 to-gray-100 border-gray-400 shadow-md"
                                  : "bg-white border-gray-300 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={(formData.vehicleTypes || []).includes(
                                  vehicle.id
                                )}
                                onChange={() => toggleVehicleType(vehicle.id)}
                                className="w-5 h-5 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                              />
                              <span className="text-2xl">{vehicle.icon}</span>
                              <span className="text-sm font-semibold text-gray-700">
                                {vehicle.name}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Info bulle */}
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-sm text-green-800">
                      <strong>💡 Astuce :</strong> Les forfaits sont
                      automatiquement détectés grâce aux coordonnées GPS (rayon
                      1km) et aux codes postaux. Tapez "Gare de Lyon" ou
                      "Aéroport CDG" pour une détection précise !
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer du modal */}
              <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitPackage}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-gray-600 text-white rounded-xl hover:shadow-xl font-bold transition-all hover:scale-[1.02]"
                >
                  {editingPackage
                    ? "✓ Modifier le forfait"
                    : "✓ Créer le forfait"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
