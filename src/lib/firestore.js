// src/lib/firestore.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

// ═══════════════════════════════════════════════════════════════════
// 👤 USERS
// ═══════════════════════════════════════════════════════════════════

export async function createUser(userId, userData) {
  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      plan: "basic",
      subscriptionStatus: "inactive",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message };
  }
}

export async function getUser(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error getting user:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUser(userId, updates) {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 WIDGETS
// ═══════════════════════════════════════════════════════════════════

export async function createWidget(userId, config = {}) {
  try {
    // Structure complète du widget
    const widgetData = {
      userId,
      isActive: true,
      allowedDomains: [],

      // État du setup wizard
      setupCompleted: config.setupCompleted ?? false,
      wizardProgress: null,

      // Config complète (branding + métier)
      config: {
        // Branding (personnalisation visuelle)
        branding: config.branding || {
          companyName: "Mon VTC",
          logo: "",
          primaryColor: "#2563eb",
          secondaryColor: "#ffffff",
          accentColor: "#3b82f6",
        },

        // Textes du formulaire
        texts: config.texts || {
          formTitle: "Réservation VTC",
          formSubtitle: "Calculez votre prix et réservez en quelques clics",
          submitButton: "Réserver & Confirmer le Prix",
        },

        // Config métier
        vehicleCategories: config.vehicleCategories || [],
        serviceZones: config.serviceZones || [],
        packages: config.packages || [],
        timeSurcharges: config.timeSurcharges || [],

        // Paiements
        paymentModes: config.paymentModes || {
          driver: { enabled: true, label: "Paiement à bord" },
          methods: ["cash", "card"],
          online: {
            enabled: false,
            label: "Paiement en ligne",
            requiresDeposit: false,
            depositPercent: 30,
          },
        },

        // Mode vacances
        vacationMode: config.vacationMode || {
          enabled: false,
          message: "Nous sommes actuellement en congés.",
          startDate: null,
          endDate: null,
        },

        // Email
        email: config.email || {
          adminEmail: "",
          fromName: "",
          smtpHost: "",
          smtpPort: 465,
          smtpUser: "",
          smtpPassword: "",
        },
      },

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "widgets"), widgetData);

    console.log("✅ Widget créé:", docRef.id);

    return { success: true, widgetId: docRef.id };
  } catch (error) {
    console.error("Error creating widget:", error);
    return { success: false, error: error.message };
  }
}

export async function getWidget(widgetId) {
  try {
    const docRef = doc(db, "widgets", widgetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Widget not found" };
    }
  } catch (error) {
    console.error("Error getting widget:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserWidgets(userId) {
  try {
    const q = query(
      collection(db, "widgets"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const widgets = [];

    querySnapshot.forEach((doc) => {
      widgets.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: widgets };
  } catch (error) {
    console.error("Error getting user widgets:", error);
    return { success: false, error: error.message };
  }
}

export async function updateWidget(widgetId, updates) {
  try {
    await updateDoc(doc(db, "widgets", widgetId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating widget:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📅 BOOKINGS
// ═══════════════════════════════════════════════════════════════════

export async function createBooking(bookingData) {
  try {
    const docRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { success: true, bookingId: docRef.id };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserBookings(userId, limitCount = 50) {
  try {
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const bookings = [];

    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: bookings };
  } catch (error) {
    console.error("Error getting user bookings:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBookingStatus(bookingId, status) {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🚗 GESTION VÉHICULES
// ═══════════════════════════════════════════════════════════════════

export async function getVehicleCategories(userId) {
  try {
    const widgetQuery = query(
      collection(db, "widgets"),
      where("userId", "==", userId),
      limit(1)
    );
    const snapshot = await getDocs(widgetQuery);

    if (!snapshot.empty) {
      const widget = snapshot.docs[0].data();
      return {
        success: true,
        data: widget.config?.vehicleCategories || [],
      };
    }
    return { success: false, error: "Widget not found" };
  } catch (error) {
    console.error("Error getting vehicle categories:", error);
    return { success: false, error: error.message };
  }
}

export async function updateVehicleCategories(widgetId, categories) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      "config.vehicleCategories": categories,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating vehicle categories:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// ⏰ GESTION MAJORATIONS
// ═══════════════════════════════════════════════════════════════════

export async function updateTimeSurcharges(widgetId, surcharges) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      "config.timeSurcharges": surcharges,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating time surcharges:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎟️ GESTION CODES PROMO
// ═══════════════════════════════════════════════════════════════════

export async function createPromoCode(userId, promoData) {
  try {
    const docRef = await addDoc(collection(db, "promoCodes"), {
      userId,
      code: promoData.code.toUpperCase(),
      type: promoData.type,
      value: promoData.value,
      maxUses: promoData.maxUses || null,
      currentUses: 0,
      validFrom: promoData.validFrom ? new Date(promoData.validFrom) : null,
      validUntil: promoData.validUntil ? new Date(promoData.validUntil) : null,
      minAmount: promoData.minAmount || 0,
      enabled: true,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating promo code:", error);
    return { success: false, error: error.message };
  }
}

export async function getPromoCodes(userId) {
  try {
    const q = query(
      collection(db, "promoCodes"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const codes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: codes };
  } catch (error) {
    console.error("Error getting promo codes:", error);
    return { success: false, error: error.message };
  }
}

export async function validatePromoCode(code, userId) {
  try {
    const q = query(
      collection(db, "promoCodes"),
      where("code", "==", code.toUpperCase()),
      where("userId", "==", userId),
      where("enabled", "==", true),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: "Code promo invalide" };
    }

    const promoData = snapshot.docs[0].data();
    const promo = { id: snapshot.docs[0].id, ...promoData };

    // Vérifier les utilisations
    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return { success: false, error: "Code promo epuise" };
    }

    // Vérifier les dates - CORRECTION ICI
    const now = new Date();

    if (promo.validFrom) {
      const validFromDate = promo.validFrom.toDate
        ? promo.validFrom.toDate()
        : new Date(promo.validFrom);
      if (validFromDate > now) {
        return { success: false, error: "Code promo pas encore valide" };
      }
    }

    if (promo.validUntil) {
      const validUntilDate = promo.validUntil.toDate
        ? promo.validUntil.toDate()
        : new Date(promo.validUntil);
      if (validUntilDate < now) {
        return { success: false, error: "Code promo expire" };
      }
    }

    return { success: true, data: promo };
  } catch (error) {
    console.error("Error validating promo code:", error);
    return { success: false, error: error.message };
  }
}

export async function usePromoCode(promoId) {
  try {
    const promoRef = doc(db, "promoCodes", promoId);
    await updateDoc(promoRef, {
      currentUses: increment(1),
    });
    return { success: true };
  } catch (error) {
    console.error("Error using promo code:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePromoCode(promoId) {
  try {
    await deleteDoc(doc(db, "promoCodes", promoId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📍 GESTION ZONES
// ═══════════════════════════════════════════════════════════════════

export async function updateServiceZones(widgetId, zones) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      "config.serviceZones": zones,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating service zones:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🏖️ MODE VACANCES
// ═══════════════════════════════════════════════════════════════════

export async function updateVacationMode(widgetId, vacationConfig) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      "config.vacationMode": vacationConfig,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating vacation mode:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 💳 MODES DE PAIEMENT
// ═══════════════════════════════════════════════════════════════════

export async function updatePaymentModes(widgetId, paymentModes) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      "config.paymentModes": paymentModes,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating payment modes:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📦 GESTION FORFAITS
// ═══════════════════════════════════════════════════════════════════

export async function updatePackages(widgetId, packages) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      "config.packages": packages,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating packages:", error);
    return { success: false, error: error.message };
  }
}

export async function getPackages(userId) {
  try {
    const widgetQuery = query(
      collection(db, "widgets"),
      where("userId", "==", userId),
      limit(1)
    );
    const snapshot = await getDocs(widgetQuery);

    if (!snapshot.empty) {
      const widget = snapshot.docs[0].data();
      return {
        success: true,
        data: widget.config?.packages || [],
      };
    }
    return { success: false, error: "Widget not found" };
  } catch (error) {
    console.error("Error getting packages:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 NOUVELLE FONCTION - Mise à jour du branding
// ═══════════════════════════════════════════════════════════════════

export async function updateWidgetBranding(widgetId, branding) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      "config.branding": branding,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating branding:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📝 NOUVELLE FONCTION - Mise à jour des textes
// ═══════════════════════════════════════════════════════════════════

export async function updateWidgetTexts(widgetId, texts) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      "config.texts": texts,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating texts:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🌐 NOUVELLE FONCTION - Mise à jour des domaines autorisés
// ═══════════════════════════════════════════════════════════════════

export async function updateAllowedDomains(widgetId, domains) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      allowedDomains: domains,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating allowed domains:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// ✅ NOUVELLE FONCTION - Marquer le setup comme complété
// ═══════════════════════════════════════════════════════════════════

export async function completeWidgetSetup(widgetId, finalConfig) {
  try {
    const widgetRef = doc(db, "widgets", widgetId);
    await updateDoc(widgetRef, {
      setupCompleted: true,
      setupCompletedAt: serverTimestamp(),
      wizardProgress: null,
      "config.vehicleCategories": finalConfig.vehicleCategories || [],
      "config.serviceZones": finalConfig.serviceZones || [],
      "config.packages": finalConfig.packages || [],
      "config.paymentModes": finalConfig.paymentModes || {},
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error completing setup:", error);
    return { success: false, error: error.message };
  }
}

// Supprimer une réservation
export async function deleteBooking(bookingId) {
  try {
    await deleteDoc(doc(db, "bookings", bookingId));
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression réservation:", error);
    return { success: false, error: error.message };
  }
}
