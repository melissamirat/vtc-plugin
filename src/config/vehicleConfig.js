// Configuration par défaut des véhicules
export const defaultVehicleCategories = [
  {
    id: 'berline',
    name: 'Berline Confort',
    description: 'Véhicule standard 4 places',
    maxPassengers: 3,
    luggage: {
      included: 2,        // Nombre de bagages GRATUITS inclus
      max: 4,            // Nombre MAXIMUM de bagages transportables
      pricePerExtra: 5.0 // Prix par bagage SUPPLÉMENTAIRE (au-delà de "included")
    },
    icon: '🚗',
    enabled: true,
    pricing: {
      mode: 'km',
      perKm: 1.2,
      perMinute: 0,
      perHour: 0,
      minPrice: 15.0,
      kmThreshold: 5
    }
  },
  {
    id: 'van',
    name: 'Van 7 Places',
    description: 'Idéal pour groupes ou familles',
    maxPassengers: 7,
    luggage: {
      included: 6,        // 6 bagages gratuits
      max: 10,           // 10 bagages max
      pricePerExtra: 5.0 // 5€ par bagage au-delà de 6
    },
    icon: '🚐',
    enabled: true,
    pricing: {
      mode: 'km',
      perKm: 1.8,
      perMinute: 0,
      perHour: 0,
      minPrice: 25.0,
      kmThreshold: 5
    }
  },
  {
    id: 'prestige',
    name: 'Véhicule Prestige',
    description: 'Berline haut de gamme',
    maxPassengers: 3,
    luggage: {
      included: 2,        // 2 bagages gratuits
      max: 3,            // 3 bagages max
      pricePerExtra: 10.0 // 10€ par bagage au-delà de 2 (plus cher)
    },
    icon: '🏎️',
    enabled: true,
    pricing: {
      mode: 'km',
      perKm: 3.0,
      perMinute: 0,
      perHour: 0,
      minPrice: 40.0,
      kmThreshold: 5
    }
  }
];

// Majorations horaires par défaut
export const defaultTimeSurcharges = [
  {
    id: 'night',
    name: 'Nuit (22h-6h)',
    type: 'hourly',
    startHour: 22,
    endHour: 6,
    amount: 15.0,
    enabled: true
  },
  {
    id: 'weekend',
    name: 'Weekend (Sam-Dim)',
    type: 'weekly',
    days: [6, 0],
    amount: 10.0,
    enabled: false
  }
];

// Zones géographiques par défaut
export const defaultServiceZones = [];


// Forfaits par défaut
export const defaultPackages = [
  {
    id: 'cdg-paris',
    name: 'Aéroport CDG → Paris (75)',
    enabled: true,
    price: 100.0,
    departureZones: ['charles de gaulle', 'cdg', 'roissy', '95700'],
    arrivalZones: ['75', 'paris'],
    vehicleTypes: [],
    description: 'Forfait depuis Charles de Gaulle vers Paris intra-muros'
  },
  {
    id: 'paris-cdg',
    name: 'Paris (75) → Aéroport CDG',
    enabled: true,
    price: 100.0,
    departureZones: ['75', 'paris'],
    arrivalZones: ['charles de gaulle', 'cdg', 'roissy', '95700'],
    vehicleTypes: [],
    description: 'Forfait depuis Paris vers Charles de Gaulle'
  },
  {
    id: 'orly-paris',
    name: 'Aéroport Orly → Paris (75)',
    enabled: true,
    price: 80.0,
    departureZones: ['orly', '94310', '94390'],
    arrivalZones: ['75', 'paris'],
    vehicleTypes: [],
    description: 'Forfait depuis Orly vers Paris intra-muros'
  }
];

// Modes de paiement
export const defaultPaymentModes = {
  online: {
    enabled: true,
    label: 'Paiement en ligne (Stripe)',
    requiresDeposit: true,
    depositPercent: 30
  },
  driver: {
    enabled: true,
    label: 'Paiement au chauffeur',
    methods: ['card', 'cash', 'check']
  }
};

// Configuration mode vacances
export const defaultVacationMode = {
  enabled: false,
  message: 'Nous sommes actuellement en congés. Les réservations reprendront le {date}.',
  startDate: null,
  endDate: null
};