/**
 * Fonctions utilitaires pour les calculs de zones de service
 */

/**
 * Vérifie si un point est dans une zone de type rayon
 */
export function isPointInRadiusZone(point, zone) {
  if (zone.geography.type !== 'radius') return false;
  
  const distance = calculateDistance(
    point.lat,
    point.lng,
    zone.geography.center.lat,
    zone.geography.center.lng
  );
  
  return distance <= zone.geography.radius;
}

/**
 * Vérifie si un point est dans une zone de type polygone
 */
export function isPointInPolygonZone(point, zone) {
  if (zone.geography.type !== 'polygon') return false;
  if (!zone.geography.polygon?.paths || zone.geography.polygon.paths.length < 3) return false;
  
  return isPointInPolygon(point, zone.geography.polygon.paths);
}

/**
 * Vérifie si un point est dans une zone administrative
 */
export function isPointInAdministrativeZone(point, zone) {
  if (zone.geography.type !== 'administrative') return false;
  
  const bounds = zone.geography.administrative.bounds;
  if (!bounds) return false;
  
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

/**
 * Trouve toutes les zones qui contiennent un point donné
 * Retourne les zones triées par priorité (plus haute en premier)
 */
export function findZonesForPoint(point, allZones) {
  const matchingZones = [];
  
  for (const zone of allZones) {
    if (!zone.enabled) continue;
    
    let isInZone = false;
    
    switch (zone.geography.type) {
      case 'radius':
        isInZone = isPointInRadiusZone(point, zone);
        break;
      case 'polygon':
        isInZone = isPointInPolygonZone(point, zone);
        break;
      case 'administrative':
        isInZone = isPointInAdministrativeZone(point, zone);
        break;
    }
    
    if (isInZone) {
      matchingZones.push(zone);
    }
  }
  
  // Trier par priorité décroissante
  return matchingZones.sort((a, b) => (b.priority || 1) - (a.priority || 1));
}

/**
 * Calcule le prix pour un trajet dans une zone donnée
 */
export function calculatePriceInZone(distance, duration, vehicleId, zone) {
  const vehiclePricing = zone.vehiclePricing?.find(vp => vp.vehicleId === vehicleId);
  
  if (!vehiclePricing || !vehiclePricing.enabled) {
    return null;
  }
  
  const { basePrice, pricePerKm, pricePerMinute, minPrice } = vehiclePricing.pricing;
  
  let totalPrice = basePrice;
  
  // Ajouter le prix au kilomètre
  if (pricePerKm > 0) {
    totalPrice += distance * pricePerKm;
  }
  
  // Ajouter le prix à la minute (si configuré)
  if (pricePerMinute > 0 && duration) {
    const durationInMinutes = duration / 60; // Convertir secondes en minutes
    totalPrice += durationInMinutes * pricePerMinute;
  }
  
  // Appliquer le prix minimum
  if (minPrice > 0 && totalPrice < minPrice) {
    totalPrice = minPrice;
  }
  
  return {
    total: Math.round(totalPrice * 100) / 100, // Arrondir à 2 décimales
    breakdown: {
      basePrice,
      distancePrice: distance * pricePerKm,
      timePrice: pricePerMinute > 0 && duration ? (duration / 60) * pricePerMinute : 0,
      minPriceApplied: totalPrice === minPrice,
      distance,
      duration
    },
    zoneName: zone.name,
    vehicleName: vehiclePricing.vehicleName
  };
}

/**
 * Calcule la distance entre deux points (formule de Haversine)
 * Retourne la distance en kilomètres
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Algorithme de ray-casting pour vérifier si un point est dans un polygone
 */
export function isPointInPolygon(point, polygon) {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;
    
    const intersect = ((yi > point.lng) !== (yj > point.lng)) &&
      (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Convertit des degrés en radians
 */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Vérifie si une réservation est autorisée selon les restrictions de la zone
 */
export function isBookingAllowedInZone(bookingDateTime, zone) {
  const now = new Date();
  const bookingDate = new Date(bookingDateTime);
  
  // Vérifier le délai minimum de réservation
  if (zone.restrictions?.minBookingHours) {
    const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);
    if (hoursUntilBooking < zone.restrictions.minBookingHours) {
      return {
        allowed: false,
        reason: `Réservation requise ${zone.restrictions.minBookingHours}h à l'avance`
      };
    }
  }
  
  // Vérifier les jours autorisés
  if (zone.restrictions?.allowedDays) {
    const dayOfWeek = bookingDate.getDay();
    if (!zone.restrictions.allowedDays.includes(dayOfWeek)) {
      return {
        allowed: false,
        reason: 'Jour non autorisé pour cette zone'
      };
    }
  }
  
  // Vérifier la plage de dates (si configurée)
  if (zone.restrictions?.dateRange) {
    const startDate = new Date(zone.restrictions.dateRange.start);
    const endDate = new Date(zone.restrictions.dateRange.end);
    
    if (bookingDate < startDate || bookingDate > endDate) {
      return {
        allowed: false,
        reason: 'Date hors de la période autorisée pour cette zone'
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Calcule la surface approximative d'une zone (en km²)
 */
export function calculateZoneArea(zone) {
  switch (zone.geography.type) {
    case 'radius':
      return Math.PI * Math.pow(zone.geography.radius, 2);
    
    case 'polygon':
      if (!zone.geography.polygon?.paths || zone.geography.polygon.paths.length < 3) {
        return 0;
      }
      return calculatePolygonArea(zone.geography.polygon.paths);
    
    case 'administrative':
      const bounds = zone.geography.administrative.bounds;
      if (!bounds) return 0;
      
      const width = calculateDistance(
        bounds.south, bounds.west,
        bounds.south, bounds.east
      );
      const height = calculateDistance(
        bounds.south, bounds.west,
        bounds.north, bounds.west
      );
      return width * height;
    
    default:
      return 0;
  }
}

/**
 * Calcule la surface d'un polygone (formule de Shoelace)
 */
function calculatePolygonArea(polygon) {
  let area = 0;
  const n = polygon.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].lat * polygon[j].lng;
    area -= polygon[j].lat * polygon[i].lng;
  }
  
  area = Math.abs(area) / 2;
  
  // Convertir en km² (approximation)
  const kmPerDegree = 111; // Approximation à l'équateur
  return area * Math.pow(kmPerDegree, 2);
}

/**
 * Obtient le meilleur tarif pour un trajet
 * Parcourt toutes les zones possibles et retourne le moins cher
 */
export function getBestPriceForRoute(pickup, dropoff, distance, duration, vehicleId, allZones) {
  // Trouver les zones qui contiennent le point de départ
  const pickupZones = findZonesForPoint(pickup, allZones);
  
  if (pickupZones.length === 0) {
    return {
      available: false,
      reason: 'Aucune zone de service ne couvre ce point de départ'
    };
  }
  
  // Calculer les prix pour chaque zone et garder le moins cher
  const prices = pickupZones
    .map(zone => calculatePriceInZone(distance, duration, vehicleId, zone))
    .filter(price => price !== null);
  
  if (prices.length === 0) {
    return {
      available: false,
      reason: 'Ce véhicule n\'est pas disponible dans les zones de service'
    };
  }
  
  // Retourner le prix le moins cher
  prices.sort((a, b) => a.total - b.total);
  
  return {
    available: true,
    ...prices[0],
    alternatives: prices.slice(1) // Autres options de prix
  };
}