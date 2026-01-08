/**
 * locationService.ts - GPS location tracking and reverse geocoding service
 *
 * This service handles:
 * 1. Getting current GPS location using browser's Geolocation API
 * 2. Reverse geocoding using OpenStreetMap Nominatim API (free, no API key needed)
 * 3. Permission checking
 *
 * How it works:
 * 1. Request location permission from browser
 * 2. Get current GPS coordinates using navigator.geolocation
 * 3. Convert coordinates to address using OpenStreetMap Nominatim
 * 4. Return LocationData with all information
 *
 * Why GPS location?
 * - Helps users remember WHERE they last saw an item
 * - Useful for items that are frequently moved
 * - Can search items by location later
 */

/**
 * Interface to hold location information
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  locationName: string;
}

/**
 * Check if browser supports Geolocation API
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Get current location with reverse geocoding
 *
 * This function:
 * 1. Checks if geolocation is supported
 * 2. Requests permission and gets current GPS coordinates
 * 3. Converts coordinates to address using OpenStreetMap
 * 4. Returns LocationData
 *
 * @returns Promise<LocationData> with coordinates and address
 * @throws Error if geolocation is not supported or permission denied
 */
export async function getCurrentLocation(): Promise<LocationData> {
  // Check if geolocation is supported
  if (!isGeolocationSupported()) {
    throw new Error('Geolocation is not supported by your browser');
  }

  // Get current position
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,  // Request GPS-level accuracy
        timeout: 10000,  // 10 second timeout
        maximumAge: 0,  // Don't use cached position
      }
    );
  });

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // Reverse geocode to get address
  const locationName = await reverseGeocode(latitude, longitude);

  return {
    latitude,
    longitude,
    locationName,
  };
}

/**
 * Reverse geocode coordinates to get human-readable address
 *
 * This uses OpenStreetMap Nominatim API (free, no API key needed)
 * Converts GPS coordinates like (40.7128, -74.0060)
 * to an address like "New York, NY, USA"
 *
 * @param latitude - The latitude coordinate
 * @param longitude - The longitude coordinate
 * @returns Human-readable address string
 */
async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    // OpenStreetMap Nominatim reverse geocoding API
    // This is free and doesn't require an API key
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent header
        'User-Agent': 'MemoryAssistant/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    // Format the address from the response
    const locationName = formatAddress(data, latitude, longitude);

    return locationName;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Fallback to coordinates if geocoding fails
    return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
  }
}

/**
 * Format address data from Nominatim API into a readable string
 *
 * Priority:
 * 1. Building/venue name (e.g., "Starbucks")
 * 2. House number + street (e.g., "123 Main St")
 * 3. City + State (e.g., "New York, NY")
 * 4. Country (e.g., "United States")
 * 5. Fallback to coordinates
 */
function formatAddress(data: any, latitude: number, longitude: number): string {
  if (!data || !data.address) {
    return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
  }

  const address = data.address;
  const parts: string[] = [];

  // Add building or venue name
  if (address.amenity) {
    parts.push(address.amenity);
  } else if (address.building) {
    parts.push(address.building);
  } else if (address.house_name) {
    parts.push(address.house_name);
  }

  // Add street address
  const street = [address.house_number, address.road].filter(Boolean).join(' ');
  if (street) {
    parts.push(street);
  }

  // Add locality (city/town/village)
  const locality =
    address.city || address.town || address.village || address.hamlet;
  if (locality) {
    parts.push(locality);
  }

  // Add state/province
  if (address.state) {
    parts.push(address.state);
  }

  // Add country if we have less than 2 parts
  if (address.country && parts.length < 2) {
    parts.push(address.country);
  }

  // If we got something, join with commas
  if (parts.length > 0) {
    return parts.join(', ');
  }

  // Fallback to display_name if available
  if (data.display_name) {
    // Take first 3 parts of display_name (to keep it concise)
    const displayParts = data.display_name.split(',').slice(0, 3);
    return displayParts.join(',').trim();
  }

  // Final fallback to coordinates
  return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
}

/**
 * Format coordinate to 4 decimal places
 * e.g., 40.712776 -> "40.7128"
 */
function formatCoordinate(coordinate: number): string {
  return coordinate.toFixed(4);
}

/**
 * Calculate distance between two GPS coordinates in kilometers
 * Uses the Haversine formula
 *
 * This is useful for:
 * - Showing distance from current location
 * - Finding nearby items
 * - Sorting items by proximity
 *
 * @param lat1 - First latitude
 * @param lon1 - First longitude
 * @param lat2 - Second latitude
 * @param lon2 - Second longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in kilometers

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format distance in a human-readable way
 * e.g., 0.5 km -> "500 m", 1.2 km -> "1.2 km", 50 km -> "50 km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    // Convert to meters if less than 1 km
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  } else if (distanceKm < 10) {
    // Show 1 decimal place for distances under 10 km
    return `${distanceKm.toFixed(1)} km`;
  } else {
    // Show whole number for larger distances
    return `${Math.round(distanceKm)} km`;
  }
}
