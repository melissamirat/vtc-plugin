"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserWidgets, updateServiceZones } from "@/lib/firestore";
import ZoneEditor from "@/components/zones/ZoneEditor";
import ZoneCard from "@/components/zones/ZoneCard";

export default function ZonesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [widgets, setWidgets] = useState([]);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [zones, setZones] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingZone, setEditingZone] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // PREMIER useEffect - Authentification et chargement des données
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadData();
  }, [user, router]);

  // DEUXIÈME useEffect - Vérifier si Google Maps est chargé
  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
        clearInterval(checkGoogleMaps);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  const loadData = async () => {
    if (!user) return;

    const widgetsResult = await getUserWidgets(user.uid);
    if (widgetsResult.success && widgetsResult.data.length > 0) {
      setWidgets(widgetsResult.data);
      const widget = widgetsResult.data[0];
      setCurrentWidget(widget);

      // Charger les zones
      setZones(widget.config?.serviceZones || []);
      
      // Charger les véhicules directement depuis le widget
      setVehicles(widget.config?.vehicleCategories || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentWidget) return;

    setSaving(true);
    const result = await updateServiceZones(currentWidget.id, zones);

    if (result.success) {
      setMessage({
        type: "success",
        text: "✓ Zones sauvegardées avec succès !",
      });
    } else {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" });
    }

    setSaving(false);
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleCreateZone = () => {
    const newZone = {
      id: `zone-${Date.now()}`,
      name: "Nouvelle zone",
      description: "",
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      geography: {
        type: "radius",
        center: {
          lat: 48.8566,
          lng: 2.3522,
          address: "Paris, France",
          placeId: "",
        },
        radius: 10,
      },
      vehiclePricing: vehicles.map((v) => ({
        vehicleId: v.id,
        vehicleName: v.name,
        useDefaultPricing: true,
        pricing: {
          basePrice: v.pricing?.minPrice || 10.0,
          pricePerKm: v.pricing?.perKm || 2.0,
          minPrice: v.pricing?.minPrice || 20.0,
          kmThreshold: v.pricing?.kmThreshold || 0,
          pricePerMinute: 0,
        },
        enabled: true,
      })),
      priority: zones.length + 1,
      restrictions: {
        minBookingHours: 0,
        maxPassengers: null,
        allowedDays: [0, 1, 2, 3, 4, 5, 6],
      },
    };

    setEditingZone(newZone);
    setShowEditor(true);
  };

  const handleEditZone = (zone) => {
    setEditingZone({ ...zone });
    setShowEditor(true);
  };

  const handleSaveZone = (updatedZone) => {
    const existingIndex = zones.findIndex((z) => z.id === updatedZone.id);

    if (existingIndex >= 0) {
      // Mise à jour
      const newZones = [...zones];
      newZones[existingIndex] = {
        ...updatedZone,
        updatedAt: new Date().toISOString(),
      };
      setZones(newZones);
    } else {
      // Création
      setZones([...zones, updatedZone]);
    }

    setShowEditor(false);
    setEditingZone(null);
    setMessage({
      type: "success",
      text: "Zone enregistrée ! N'oubliez pas de sauvegarder.",
    });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleDeleteZone = (zoneId) => {
    if (confirm("Supprimer cette zone de service ?")) {
      setZones(zones.filter((z) => z.id !== zoneId));
      setMessage({
        type: "success",
        text: "Zone supprimée ! N'oubliez pas de sauvegarder.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleToggleZone = (zoneId) => {
    setZones(
      zones.map((z) => (z.id === zoneId ? { ...z, enabled: !z.enabled } : z))
    );
  };

  const handleDuplicateZone = (zone) => {
    const duplicated = {
      ...zone,
      id: `zone-${Date.now()}`,
      name: `${zone.name} (copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setZones([...zones, duplicated]);
    setMessage({
      type: "success",
      text: "Zone dupliquée ! N'oubliez pas de sauvegarder.",
    });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 overflow-x-hidden">
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                Zones de Service
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {zones.length} zone{zones.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm flex-shrink-0"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Message de notification */}
        {message.text && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl shadow-lg border-2 animate-in fade-in slide-in-from-top-2 ${
              message.type === "success"
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <p className="font-medium text-sm sm:text-base">{message.text}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleCreateZone}
              disabled={!mapsLoaded}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="text-lg sm:text-xl">+</span>
              Créer une zone
            </button>

            {!mapsLoaded && (
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-600 bg-amber-50 px-3 sm:px-4 py-2 rounded-lg border border-amber-200">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-amber-600"></div>
                Chargement Maps...
              </div>
            )}
          </div>

          <div className="text-xs sm:text-sm text-gray-600 bg-white px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-200 text-center">
            <span className="font-semibold text-blue-600">
              {zones.filter((z) => z.enabled).length}
            </span>{" "}
            active{zones.filter((z) => z.enabled).length !== 1 ? "s" : ""} /{" "}
            <span className="font-semibold text-gray-500">{zones.length}</span> total
          </div>
        </div>

        {/* Liste des zones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {zones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onEdit={handleEditZone}
              onDelete={handleDeleteZone}
              onToggle={handleToggleZone}
              onDuplicate={handleDuplicateZone}
            />
          ))}
        </div>

        {/* Message si aucune zone */}
        {zones.length === 0 && (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🗺️</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 px-4">
              Aucune zone configurée
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">
              Créez votre première zone de service
            </p>
            <button
              onClick={handleCreateZone}
              disabled={!mapsLoaded}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 text-sm sm:text-base"
            >
              Créer une zone
            </button>
          </div>
        )}

        {/* Bouton sauvegarder fixe */}
        {zones.length > 0 && (
          <div className="sticky bottom-3 sm:bottom-4 bg-white/90 backdrop-blur-sm border-2 border-blue-300 rounded-xl p-2.5 sm:p-3 shadow-xl">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </span>
              ) : (
                "💾 Sauvegarder"
              )}
            </button>
          </div>
        )}

        {/* Éditeur de zone (Modal) */}
        {showEditor && editingZone && (
          <ZoneEditor
            zone={editingZone}
            vehicles={vehicles}
            mapsLoaded={mapsLoaded}
            onSave={handleSaveZone}
            onCancel={() => {
              setShowEditor(false);
              setEditingZone(null);
            }}
          />
        )}
      </main>
    </div>
  );
}