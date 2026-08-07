// Comprehensive Airline Registry for Shafsky Aviation Platform
// Master source of truth for intelligent airline search & autocomplete.

export interface AirlineEntry {
  iata: string;
  icao: string;
  name: string;
  country: string;
  logo: string;
}

export const AIRLINE_REGISTRY: AirlineEntry[] = [
  { iata: "AI", icao: "AIC", name: "Air India", country: "India", logo: "https://images.aviation-edge.com/airline-logos/AI.png" },
  { iata: "6E", icao: "IGO", name: "IndiGo", country: "India", logo: "https://images.aviation-edge.com/airline-logos/6E.png" },
  { iata: "SG", icao: "SEJ", name: "SpiceJet", country: "India", logo: "https://images.aviation-edge.com/airline-logos/SG.png" },
  { iata: "QP", icao: "AKJ", name: "Akasa Air", country: "India", logo: "https://images.aviation-edge.com/airline-logos/QP.png" },
  { iata: "IX", icao: "AXB", name: "Air India Express", country: "India", logo: "https://images.aviation-edge.com/airline-logos/IX.png" },
  { iata: "UK", icao: "VTI", name: "Vistara", country: "India", logo: "https://images.aviation-edge.com/airline-logos/UK.png" },
  { iata: "I5", icao: "IAD", name: "AirAsia India", country: "India", logo: "https://images.aviation-edge.com/airline-logos/I5.png" },
  { iata: "9I", icao: "LLR", name: "Alliance Air", country: "India", logo: "https://images.aviation-edge.com/airline-logos/9I.png" },
  { iata: "S5", icao: "RSL", name: "Star Air", country: "India", logo: "https://images.aviation-edge.com/airline-logos/S5.png" },
  { iata: "EK", icao: "UAE", name: "Emirates", country: "United Arab Emirates", logo: "https://images.aviation-edge.com/airline-logos/EK.png" },
  { iata: "QR", icao: "QTR", name: "Qatar Airways", country: "Qatar", logo: "https://images.aviation-edge.com/airline-logos/QR.png" },
  { iata: "BA", icao: "BAW", name: "British Airways", country: "United Kingdom", logo: "https://images.aviation-edge.com/airline-logos/BA.png" },
  { iata: "EY", icao: "ETD", name: "Etihad Airways", country: "United Arab Emirates", logo: "https://images.aviation-edge.com/airline-logos/EY.png" },
  { iata: "LH", icao: "DLH", name: "Lufthansa", country: "Germany", logo: "https://images.aviation-edge.com/airline-logos/LH.png" },
  { iata: "AF", icao: "AFR", name: "Air France", country: "France", logo: "https://images.aviation-edge.com/airline-logos/AF.png" },
  { iata: "KL", icao: "KLM", name: "KLM Royal Dutch Airlines", country: "Netherlands", logo: "https://images.aviation-edge.com/airline-logos/KL.png" },
  { iata: "SQ", icao: "SIA", name: "Singapore Airlines", country: "Singapore", logo: "https://images.aviation-edge.com/airline-logos/SQ.png" },
  { iata: "CX", icao: "CPA", name: "Cathay Pacific", country: "Hong Kong", logo: "https://images.aviation-edge.com/airline-logos/CX.png" },
  { iata: "TK", icao: "THY", name: "Turkish Airlines", country: "Turkey", logo: "https://images.aviation-edge.com/airline-logos/TK.png" },
  { iata: "AA", icao: "AAL", name: "American Airlines", country: "United States", logo: "https://images.aviation-edge.com/airline-logos/AA.png" },
  { iata: "UA", icao: "UAL", name: "United Airlines", country: "United States", logo: "https://images.aviation-edge.com/airline-logos/UA.png" },
  { iata: "DL", icao: "DAL", name: "Delta Air Lines", country: "United States", logo: "https://images.aviation-edge.com/airline-logos/DL.png" },
  { iata: "SV", icao: "SVA", name: "Saudia", country: "Saudi Arabia", logo: "https://images.aviation-edge.com/airline-logos/SV.png" },
  { iata: "FZ", icao: "FDB", name: "Flydubai", country: "United Arab Emirates", logo: "https://images.aviation-edge.com/airline-logos/FZ.png" },
  { iata: "WY", icao: "OMA", name: "Oman Air", country: "Oman", logo: "https://images.aviation-edge.com/airline-logos/WY.png" },
  { iata: "J9", icao: "JZR", name: "Jazeera Airways", country: "Kuwait", logo: "https://images.aviation-edge.com/airline-logos/J9.png" },
  { iata: "GF", icao: "GFA", name: "Gulf Air", country: "Bahrain", logo: "https://images.aviation-edge.com/airline-logos/GF.png" },
  { iata: "MH", icao: "MAS", name: "Malaysia Airlines", country: "Malaysia", logo: "https://images.aviation-edge.com/airline-logos/MH.png" },
  { iata: "TG", icao: "THA", name: "Thai Airways", country: "Thailand", logo: "https://images.aviation-edge.com/airline-logos/TG.png" },
  { iata: "VS", icao: "VIR", name: "Virgin Atlantic", country: "United Kingdom", logo: "https://images.aviation-edge.com/airline-logos/VS.png" },
  { iata: "AC", icao: "ACA", name: "Air Canada", country: "Canada", logo: "https://images.aviation-edge.com/airline-logos/AC.png" },
  { iata: "QF", icao: "QFA", name: "Qantas Airways", country: "Australia", logo: "https://images.aviation-edge.com/airline-logos/QF.png" },
];

export function searchAirlines(query: string): AirlineEntry[] {
  if (!query || !query.trim()) return AIRLINE_REGISTRY.slice(0, 10);
  const q = query.trim().toUpperCase();

  return AIRLINE_REGISTRY.filter((item) => {
    const nameMatch = item.name.toUpperCase().includes(q);
    const iataMatch = item.iata.toUpperCase() === q || item.iata.toUpperCase().startsWith(q);
    const icaoMatch = item.icao.toUpperCase() === q || item.icao.toUpperCase().startsWith(q);
    const countryMatch = item.country.toUpperCase().includes(q);
    return nameMatch || iataMatch || icaoMatch || countryMatch;
  }).slice(0, 15);
}
