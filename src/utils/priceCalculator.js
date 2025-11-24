/**
 * Système de calcul de tarification VTC
 */

export function calculatePrice({
  distanceKm,
  vehicleConfig,
  date,
  time,
  extraLuggage = 0,        // ANCIEN: nombre de bagages supplémentaires (déjà calculé)
  luggagePrice = 0,        // ANCIEN: prix unitaire
  totalLuggage = 0,        // NOUVEAU: nombre total de bagages demandés
  departureAddress = '',
  arrivalAddress = '',
  departureCoords = null,
  arrivalCoords = null,
  surcharges = [],
  packages = [],
  serviceZones = []        // NOUVEAU: zones de service
}) {
  
  console.log('🧮 Début calcul prix avec:', {
    distanceKm,
    vehicleType: vehicleConfig?.id,
    departure: departureAddress,
    arrival: arrivalAddress,
    departureCoords,
    arrivalCoords,
    totalLuggage,
    serviceZonesCount: serviceZones?.length || 0
  });

  const breakdown = {
    distancePrice: 0,
    luggagePrice: 0,
    surcharges: 0,
    packagePrice: 0,
    subtotal: 0,
    total: 0,
    appliedPackage: null,
    appliedZone: null,
    usedKmThreshold: false,
    details: [],
    error: null
  };

  if (!vehicleConfig || !vehicleConfig.pricing) {
    console.error('❌ Configuration véhicule invalide');
    breakdown.error = 'Configuration véhicule invalide';
    return breakdown;
  }

  // ============================================
  // 0. VÉRIFIER LA ZONE DE SERVICE
  // ============================================
  if (serviceZones && serviceZones.length > 0 && departureCoords) {
    console.log('🗺️ Vérification zone de service...');
    
    const matchingZone = findMatchingServiceZone(
      departureCoords,
      serviceZones,
      vehicleConfig.id
    );
    
    if (!matchingZone) {
      console.error('❌ Point de départ hors zone de service');
      breakdown.error = 'Désolé, cette adresse de départ n\'est pas dans notre zone de service.';
      return breakdown;
    }
    
    console.log('✅ Zone de service trouvée:', matchingZone.name);
    breakdown.appliedZone = matchingZone;
    
    // Si une zone a une tarification spécifique, l'utiliser
    if (matchingZone.vehiclePricing) {
      const zonePricing = matchingZone.vehiclePricing.find(
        vp => vp.vehicleId === vehicleConfig.id && vp.enabled
      );
      
      if (!zonePricing) {
        console.error('❌ Véhicule non disponible dans cette zone');
        breakdown.error = 'Ce véhicule n\'est pas disponible pour cette zone.';
        return breakdown;
      }
      
      // Vérifier si on utilise les tarifs par défaut du véhicule ou les tarifs de la zone
      if (zonePricing.useDefaultPricing) {
        console.log('💰 Utilisation tarification par défaut du véhicule');
        // On garde vehicleConfig tel quel - pas de modification
      } else if (zonePricing.pricing) {
        console.log('💰 Utilisation tarification personnalisée de zone:', zonePricing.pricing);
        // Remplacer la tarification du véhicule par celle de la zone
        vehicleConfig = {
          ...vehicleConfig,
          pricing: {
            ...vehicleConfig.pricing,
            minPrice: zonePricing.pricing.minPrice || vehicleConfig.pricing.minPrice,
            perKm: zonePricing.pricing.pricePerKm || zonePricing.pricing.perKm || vehicleConfig.pricing.perKm,
            pricePerKm: zonePricing.pricing.pricePerKm || vehicleConfig.pricing.perKm,
            kmThreshold: zonePricing.pricing.kmThreshold ?? vehicleConfig.pricing.kmThreshold,
            basePrice: zonePricing.pricing.basePrice || 0,
          }
        };
      }
    }
  }

  // ============================================
  // 1. VÉRIFIER SI UN FORFAIT S'APPLIQUE
  // ============================================
  const matchingPackage = findMatchingPackage(
    packages, 
    departureCoords,
    arrivalCoords,
    vehicleConfig.id,
    departureAddress,
    arrivalAddress
  );
  
  if (matchingPackage) {
    console.log('✅ Forfait trouvé:', matchingPackage.name, matchingPackage.price + '€');
    
    breakdown.packagePrice = matchingPackage.price;
    breakdown.appliedPackage = matchingPackage;
    breakdown.details.push({
      label: `Forfait: ${matchingPackage.name}`,
      amount: matchingPackage.price
    });
    breakdown.subtotal = matchingPackage.price;
    breakdown.total = matchingPackage.price;
    
  } else {
    console.log('ℹ️ Pas de forfait applicable, calcul normal');
    
    // ============================================
    // 2. CALCUL DISTANCE
    // ============================================
    const kmThreshold = vehicleConfig.pricing.kmThreshold || 0;
    const minPrice = vehicleConfig.pricing.minPrice || 0;
    
    console.log(`📏 Seuil km: ${kmThreshold}, Distance: ${distanceKm}km, Forfait min: ${minPrice}€`);

    if (kmThreshold > 0 && distanceKm < kmThreshold) {
      // EN DESSOUS du seuil : forfait minimum
      console.log(`⚠️ Distance < ${kmThreshold}km → Application forfait minimum`);
      
      breakdown.distancePrice = minPrice;
      breakdown.usedKmThreshold = true;
      breakdown.details.push({
        label: `Forfait minimum (< ${kmThreshold} km)`,
        amount: minPrice
      });
      
    } else {
      // AU-DESSUS du seuil : tarification kilométrique
      console.log(`✅ Distance ≥ ${kmThreshold}km → Tarif kilométrique`);
      
      // Supporter les deux formats: perKm (véhicule) et pricePerKm (zone)
      const pricePerKm = vehicleConfig.pricing.pricePerKm || vehicleConfig.pricing.perKm || 0;
      breakdown.distancePrice = distanceKm * pricePerKm;
      breakdown.details.push({
        label: `Distance (${distanceKm} km × ${pricePerKm.toFixed(2)}€)`,
        amount: breakdown.distancePrice
      });
    }

    breakdown.subtotal = breakdown.distancePrice;
    console.log(`💰 Sous-total après distance: ${breakdown.subtotal}€`);
  }

  // ============================================
  // 3. BAGAGES SUPPLÉMENTAIRES
  // ============================================
  
  if (totalLuggage > 0) {
    const luggageConfig = vehicleConfig.luggage || {
      included: vehicleConfig.maxLuggage || 2,
      max: (vehicleConfig.maxLuggage || 2) * 2,
      pricePerExtra: vehicleConfig.pricing?.extraLuggagePrice || 5
    };
    
    const { included, max, pricePerExtra } = luggageConfig;
    
    console.log(`🧳 Configuration bagages:`, {
      totalDemandé: totalLuggage,
      gratuits: included,
      maximum: max,
      prixSupplément: pricePerExtra
    });
    
    // Vérifier si dépasse la capacité maximum
    if (totalLuggage > max) {
      console.error(`❌ ERREUR: ${totalLuggage} bagages > capacité max (${max})`);
      breakdown.error = `Ce véhicule ne peut transporter que ${max} bagages maximum. Veuillez choisir un véhicule plus grand.`;
      // On continue le calcul mais on signale l'erreur
    }
    
    // Calculer les bagages payants (au-delà des gratuits)
    const paidLuggage = Math.max(0, Math.min(totalLuggage, max) - included);
    
    if (paidLuggage > 0) {
      breakdown.luggagePrice = paidLuggage * pricePerExtra;
      breakdown.details.push({
        label: `🧳 Bagages supplémentaires (${paidLuggage} × ${pricePerExtra.toFixed(2)}€)`,
        amount: breakdown.luggagePrice
      });
      breakdown.subtotal += breakdown.luggagePrice;
      console.log(`💰 Supplément bagages: ${paidLuggage} × ${pricePerExtra}€ = +${breakdown.luggagePrice.toFixed(2)}€`);
    } else {
      console.log(`✅ ${totalLuggage} bagage(s) inclus gratuitement (max gratuit: ${included})`);
    }
    
    // Ajouter les infos bagages au breakdown
    breakdown.luggageInfo = {
      total: totalLuggage,
      included: included,
      paid: paidLuggage,
      max: max,
      exceedsMax: totalLuggage > max
    };
  } else if (extraLuggage > 0 && luggagePrice > 0) {
    // Support ancien format (rétrocompatibilité)
    console.log(`🧳 Bagages supplémentaires (ancien format): ${extraLuggage}`);
    breakdown.luggagePrice = extraLuggage * luggagePrice;
    breakdown.details.push({
      label: `🧳 Bagages supplémentaires (${extraLuggage} × ${luggagePrice.toFixed(2)}€)`,
      amount: breakdown.luggagePrice
    });
    breakdown.subtotal += breakdown.luggagePrice;
  }

  // ============================================
  // 4. MAJORATIONS
  // ============================================
  if (date && time && surcharges && surcharges.length > 0) {
    const surchargeAmount = calculateSurcharges(date, time, surcharges);
    if (surchargeAmount > 0) {
      breakdown.surcharges = surchargeAmount;
      breakdown.details.push({
        label: 'Majorations horaires',
        amount: surchargeAmount
      });
      breakdown.subtotal += surchargeAmount;
      console.log(`⏰ Majorations: +${surchargeAmount}€`);
    }
  }

  // ============================================
  // 5. VÉRIFICATION PRIX MINIMUM GLOBAL
  // ============================================
  if (!matchingPackage) {
    const minPrice = vehicleConfig.pricing.minPrice || 0;
    if (minPrice > 0 && breakdown.subtotal < minPrice) {
      const adjustment = minPrice - breakdown.subtotal;
      breakdown.details.push({
        label: 'Ajustement forfait minimum',
        amount: adjustment
      });
      breakdown.subtotal = minPrice;
      console.log(`⬆️ Ajustement forfait minimum: +${adjustment}€`);
    }
  }

  breakdown.total = breakdown.subtotal;
  console.log(`✅ PRIX TOTAL: ${breakdown.total}€`);

  return breakdown;
}

function findMatchingPackage(packages, departureCoords, arrivalCoords, vehicleType, departureAddress, arrivalAddress) {
  if (!packages || packages.length === 0) {
    console.log('ℹ️ Aucun forfait configuré');
    return null;
  }

  const activePacks = packages.filter(p => p.enabled);
  console.log(`🔍 Recherche parmi ${activePacks.length} forfaits actifs`);

  for (const pack of activePacks) {
    console.log(`\n🎫 Test forfait: "${pack.name}"`);
    
    // Vérifier compatibilité véhicule
    if (pack.vehicleTypes && pack.vehicleTypes.length > 0) {
      if (!pack.vehicleTypes.includes(vehicleType)) {
        console.log(`  ❌ Véhicule non compatible`);
        continue;
      }
    }

    // Vérifier zones par GPS ou code postal
    const departureMatch = checkGPSZoneMatch(departureCoords, pack.departureZones, departureAddress);
    const arrivalMatch = checkGPSZoneMatch(arrivalCoords, pack.arrivalZones, arrivalAddress);

    console.log(`  📍 Départ match: ${departureMatch}`);
    console.log(`  🎯 Arrivée match: ${arrivalMatch}`);

    if (departureMatch && arrivalMatch) {
      console.log(`  🎉 FORFAIT TROUVÉ !`);
      return pack;
    }
  }

  return null;
}

function checkGPSZoneMatch(coords, zones, address) {
  if (!zones || zones.length === 0) return false;
  
  console.log(`  🌍 Test GPS pour:`, coords);
  console.log(`  📋 Zones:`, zones.map(z => typeof z === 'string' ? z : z.name));
  
  // Rayon de recherche en km pour GPS
  const RADIUS_KM = 1;
  
  for (const zone of zones) {
    // Support des codes postaux (ancien format texte)
    if (typeof zone === 'string') {
      // Code postal département (2 chiffres) - Ex: "75"
      if (/^\d{2}$/.test(zone)) {
        const postalMatches = address?.match(/\b\d{5}\b/g);
        if (postalMatches) {
          console.log(`  📮 Codes postaux trouvés:`, postalMatches);
          for (const postal of postalMatches) {
            if (postal.startsWith(zone)) {
              console.log(`  ✅ Match code postal département: ${zone}`);
              return true;
            }
          }
        }
        console.log(`  ❌ Pas de match code postal`);
        continue;
      }
      
      // Code postal complet (5 chiffres) - Ex: "75015"
      if (/^\d{5}$/.test(zone)) {
        if (address && address.includes(zone)) {
          console.log(`  ✅ Match code postal complet: ${zone}`);
          return true;
        }
        console.log(`  ❌ Pas de match code postal complet`);
        continue;
      }
      
      console.log(`  ⚠️ Zone texte non reconnue, ignorée: "${zone}"`);
      continue;
    }
    
    // Nouveau format GPS
    if (!zone.lat || !zone.lon) {
      console.log(`  ⚠️ Zone sans coordonnées, ignorée`);
      continue;
    }
    
    if (!coords || !coords.lat || !coords.lon) {
      console.log(`  ⚠️ Coordonnées manquantes`);
      continue;
    }
    
    // Calculer la distance en km avec formule de Haversine
    const distance = calculateDistance(
      coords.lat, coords.lon,
      zone.lat, zone.lon
    );
    
    console.log(`  📏 Distance à "${zone.name}": ${distance.toFixed(2)} km`);
    
    if (distance <= RADIUS_KM) {
      console.log(`  ✅ Match GPS ! (< ${RADIUS_KM} km)`);
      return true;
    }
  }
  
  console.log(`  ❌ Aucune zone ne match`);
  return false;
}

// Formule de Haversine pour calculer la distance entre 2 points GPS
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateSurcharges(date, time, surcharges) {
  let total = 0;
  
  if (!date || !time || !surcharges || surcharges.length === 0) return 0;
  
  try {
    const dateObj = new Date(`${date}T${time}`);
    const hour = dateObj.getHours();
    const day = dateObj.getDay();
    
    surcharges.filter(s => s.enabled).forEach(surcharge => {
      if (surcharge.type === 'hourly') {
        const { startHour, endHour } = surcharge;
        let applies = false;
        
        if (startHour > endHour) {
          if (hour >= startHour || hour < endHour) applies = true;
        } else {
          if (hour >= startHour && hour < endHour) applies = true;
        }
        
        if (applies) total += parseFloat(surcharge.amount);
      } else if (surcharge.type === 'weekly' && surcharge.days) {
        if (surcharge.days.includes(day)) {
          total += parseFloat(surcharge.amount);
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur majorations:', error);
  }
  
  return total;
}

// ============================================
// FONCTION DE VÉRIFICATION DES ZONES DE SERVICE
// ============================================

function findMatchingServiceZone(coords, serviceZones, vehicleId) {
  if (!coords || !serviceZones || serviceZones.length === 0) {
    console.log('⚠️ Pas de zones de service configurées');
    return null;
  }

  // Filtrer les zones actives
  const activeZones = serviceZones.filter(z => z.enabled);
  console.log(`🔍 Recherche parmi ${activeZones.length} zones actives`);

  // Trier par priorité (plus haute en premier)
  const sortedZones = activeZones.sort((a, b) => (b.priority || 1) - (a.priority || 1));

  for (const zone of sortedZones) {
    console.log(`\n🗺️ Test zone: "${zone.name}" (priorité: ${zone.priority || 1})`);
    
    if (!zone.geography) {
      console.log('  ⚠️ Zone sans géographie, ignorée');
      continue;
    }

    let isInZone = false;

    switch (zone.geography.type) {
      case 'radius':
        if (zone.geography.center && zone.geography.radius) {
          const distance = calculateDistance(
            coords.lat, coords.lng,
            zone.geography.center.lat, zone.geography.center.lng
          );
          console.log(`  📏 Distance au centre: ${distance.toFixed(2)} km (rayon: ${zone.geography.radius} km)`);
          isInZone = distance <= zone.geography.radius;
        }
        break;

      case 'polygon':
        if (zone.geography.polygon?.paths && zone.geography.polygon.paths.length >= 3) {
          isInZone = isPointInPolygon(coords, zone.geography.polygon.paths);
          console.log(`  📐 Point ${isInZone ? 'dans' : 'hors'} polygone`);
        }
        break;

      case 'administrative':
        if (zone.geography.administrative?.bounds) {
          const bounds = zone.geography.administrative.bounds;
          isInZone = (
            coords.lat >= bounds.south &&
            coords.lat <= bounds.north &&
            coords.lng >= bounds.west &&
            coords.lng <= bounds.east
          );
          console.log(`  🏛️ Point ${isInZone ? 'dans' : 'hors'} zone administrative`);
        }
        break;

      default:
        console.log(`  ⚠️ Type de zone inconnu: ${zone.geography.type}`);
    }

    if (isInZone) {
      console.log(`  ✅ ZONE TROUVÉE !`);
      return zone;
    }
  }

  console.log('❌ Aucune zone ne correspond');
  return null;
}

// Algorithme ray-casting pour vérifier si un point est dans un polygone
function isPointInPolygon(point, polygon) {
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

export function applyPromoCode(totalPrice, promoCode) {
  if (!promoCode) return totalPrice;
  
  let discount = 0;
  
  if (promoCode.type === 'percentage') {
    discount = totalPrice * (promoCode.value / 100);
  } else if (promoCode.type === 'fixed') {
    discount = promoCode.value;
  }
  
  return Math.max(0, totalPrice - discount);
}