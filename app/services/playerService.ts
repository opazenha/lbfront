// Transfermarkt API integration service

// Import API configuration
import { API_CONFIG } from '../config/apiConfig';

// Check if Transfermarkt API is available using the cache stats endpoint
export const checkApiAvailability = async (): Promise<boolean> => {
  // First try without timeout to see if the API is immediately available
  try {
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_STATS}`;
    console.log(`Quick API availability check at: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    console.log(`API availability check response: ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    // If the quick check fails, try again with a timeout
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_STATS}`;
      console.log(`Retrying API availability check with timeout at: ${apiUrl}`);
      
      const response = await Promise.race([
        fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API check timed out')), 15000) // Increased timeout to 15 seconds
        )
      ]) as Response;

      console.log(`API availability check response: ${response.status} ${response.statusText}`);
      return response.ok;
    } catch (retryError: any) {
      console.error("API availability check failed. Error details:");
      if (retryError instanceof Error) {
        console.error(`  Name: ${retryError.name}`);
        console.error(`  Message: ${retryError.message}`);
        if (retryError.stack) {
          console.error(`  Stack: ${retryError.stack}`);
        }
      } else {
        console.error("  Raw Error:", retryError);
      }
      console.error(`Could not connect to API at ${API_CONFIG.BASE_URL}. Make sure the API server is running and check CORS configuration.`);
      return false;
    }
  }
};

// API response types based on the documentation
export interface Nationality {
  nationalityId: number;
  secondNationalityId?: number;
}

export interface Attributes {
  positionId: number;
  // Other attributes can be added as needed
}

export interface MarketValue {
  current: {
    compact: {
      prefix: string;
      content: string;
      suffix: string;
    };
    determined: string;
  };
}

export interface PlayerDetails {
  transfermarktId: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  nationalities: Nationality;
  attributes: Attributes;
  relativeUrl?: string;
  marketValueDetails: MarketValue;
  isLbPlayer?: boolean;
}

export interface Performance {
  playerInformation: {
    season: number;
    competitionId: string;
  };
  goalStatistics: {
    goalsCount: number;
    assistsCount: number;
    scorersCount: number;
  };
  cardStatistics: {
    yellowCardsCount: number;
    redCardsCount: number;
  };
  competition: {
    name: string;
    shortName: string;
    logoUrl: string;
  };
}

export interface Aggregated {
  competitionsCount: number;
  goalStatistics: {
    goalsCount: number;
    assistsCount: number;
    scorersCount: number;
  };
  cardStatistics: {
    yellowCardsCount: number;
    redCardsCount: number;
  };
  playingTimeStatistics: {
    appearancesCount: number;
    totalMinutesPlayed: number;
  };
}

export interface PlayerData {
  transfermarktId: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  nationalities: Nationality;
  attributes: Attributes;
  relativeUrl?: string;
  marketValueDetails: {
    current: {
      value: number;
      currency: string;
      determined: string;
    };
    previous: {
      value: number;
      currency: string;
      determined: string | null;
    };
    delta: {
      value: string;
      percentage: string;
      type: string;
      visible: boolean;
    };
    highest: {
      value: number;
      currency: string;
      determined: string | null;
    };
  };
  lbPlayer?: boolean;
  performance?: Performance[];
  aggregated?: Aggregated;
}

// Simplified Player interface for our UI
export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  positionId?: number; // Add position ID for filtering
  nationality: string;
  club?: string;
  marketValue: string; // Formatted string for display (e.g., €2.00m)
  marketValueNumber?: number; // Raw numerical value for sorting/calculations
  imageUrl?: string;
  isLbPlayer?: boolean;
}

// Position mapping based on MongoDB position IDs
const positionMap: Record<number, string> = {
  1: "Goalkeeper",
  2: "Right-Back",
  3: "Center-Back",
  4: "Left-Back",
  5: "Sweeper",
  6: "Defensive Midfielder",
  7: "Central Midfielder",
  8: "Attacking Midfielder",
  9: "Right Midfielder",
  10: "Offensive Midfielder",
  11: "Left Winger",
  12: "Right Winger",
  13: "Second Striker",
  14: "Center-Forward",
};

// Reverse mapping for looking up position IDs by name
const positionNameToIdMap: Record<string, number> = Object.entries(
  positionMap
).reduce((acc, [id, name]) => {
  acc[name] = parseInt(id, 10);
  return acc;
}, {} as Record<string, number>);

// Helper function to convert API response to our simplified Player interface
const mapApiResponseToPlayer = (data: any): Player => {
  // Format market value
  const value = data.marketValueDetails?.current?.value || 0;
  const currency = data.marketValueDetails?.current?.currency || "EUR";
  const formattedValue =
    value >= 1000000
      ? `€${(value / 1000000).toFixed(1)}M`
      : value >= 1000
      ? `€${(value / 1000).toFixed(0)}K`
      : `€${value}`;

  // Store the original position ID for filtering
  const positionId = data.attributes?.positionId;

  // Get club information if available
  const club = data.club || "Unknown";

  return {
    id: data.transfermarktId,
    name: data.name,
    age: data.age,
    position: positionMap[positionId] || "Unknown",
    positionId: positionId, // Store the position ID for filtering
    nationality: getNationalityName(data.nationalities?.nationalityId),
    club: club,
    marketValue: formattedValue,
    isLbPlayer: data.lbPlayer || false,
  };
};

// Transform player data from the new Transfermarkt API format to our internal Player interface
const transformPlayerFromTransfermarktApi = (data: any): Player => {
  // Get primary position
  const position = data.position || 'Unknown';
  
  // Map position to our positionId for backward compatibility
  const positionId = getPositionIdFromName(position);
  
  // Format market value
  let formattedValue = "Unknown";
  if (data.marketValue) {
    // Format the market value in millions with euro sign
    formattedValue = `${(data.marketValue / 1000000).toFixed(2)}m €`;
  }
  
  // Get nationality (use first one if there are multiple)
  const nationality = data.nationalities && data.nationalities.length > 0 
    ? data.nationalities[0] 
    : 'Unknown';
    
  // Get club information
  const club = data.club && data.club.name ? data.club.name : 'Unknown';
  
  return {
    id: data.id,
    name: data.name,
    age: data.age || 0,
    position: position,
    positionId: positionId,
    nationality: nationality,
    club: club,
    marketValue: formattedValue,
    isLbPlayer: false, // Default to false, will be updated if needed
  };
};

// Transform player profile data from the cache endpoint to our internal Player interface
const transformPlayerProfileFromCache = (data: any): Player => {
  // Handle the player profile structure from the cache endpoint
  
  // Get primary position from the position object
  const positionMain = data.position?.main || 'Unknown';
  
  // Map position to our positionId for backward compatibility
  const positionId = getPositionIdFromName(positionMain);
  
  // Get the formatted market value string from API (e.g., "€450k", "€2.00m")
  const marketValueString = data.marketValue || 'Unknown';
  
  // Parse the string to get the numerical value using our helper function
  const marketValueNumber = parseMarketValue(marketValueString);

  // Get nationality (use citizenship array)
  const nationality = data.citizenship && data.citizenship.length > 0 
    ? data.citizenship[0] 
    : 'Unknown';
    
  // Get club information
  const club = data.club?.name || 'Unknown';
  
  return {
    id: data.id,
    name: data.name,
    age: data.age || 0,
    position: positionMain,
    positionId: positionId,
    nationality: nationality,
    club: club,
    marketValue: marketValueString, // Keep the original formatted string for display
    marketValueNumber: marketValueNumber, // Store the parsed numerical value
    isLbPlayer: data.isLbPlayer === true, // Get the value from API data, default to false if missing/null
    imageUrl: data.imageUrl // Add image URL if available
  };
};

// Helper function to parse market value strings (e.g., "€450k", "€2.00m") into numbers
const parseMarketValue = (valueString: string | null | undefined): number | undefined => {
  if (!valueString || typeof valueString !== 'string' || valueString.toLowerCase() === 'unknown') {
    return undefined;
  }

  // Remove currency symbols (€, $, £ etc.) and whitespace
  const cleanedString = valueString.replace(/[^0-9.,mk]/gi, '').trim();

  let multiplier = 1;
  let numberPart = cleanedString;

  if (cleanedString.endsWith('m')) {
    multiplier = 1000000;
    numberPart = cleanedString.substring(0, cleanedString.length - 1);
  } else if (cleanedString.endsWith('k')) {
    multiplier = 1000;
    numberPart = cleanedString.substring(0, cleanedString.length - 1);
  }

  // Replace comma with dot for decimal conversion if needed
  numberPart = numberPart.replace(',', '.');

  const numericValue = parseFloat(numberPart);

  if (isNaN(numericValue)) {
    console.warn(`Could not parse market value: ${valueString}`);
    return undefined;
  }

  return numericValue * multiplier;
};


// Helper function to get position ID from position name
const getPositionIdFromName = (positionName: string): number => {
  // Reverse lookup in the position map
  for (const [id, name] of Object.entries(positionMap)) {
    if (name.toLowerCase() === positionName.toLowerCase()) {
      return parseInt(id, 10);
    }
  }
  
  // If not found, try to match partial names
  const lowerName = positionName.toLowerCase();
  if (lowerName.includes('forward') || lowerName.includes('striker') || lowerName.includes('winger')) {
    return 1; // Forward
  } else if (lowerName.includes('midfield')) {
    return 2; // Midfielder
  } else if (lowerName.includes('defend') || lowerName.includes('back')) {
    return 3; // Defender
  } else if (lowerName.includes('keeper') || lowerName.includes('goalie')) {
    return 4; // Goalkeeper
  }
  
  // Default
  return 0;
};

// Helper function to get nationality name from ID
const getNationalityName = (id: number): string => {
  const nationalityMap: Record<number, string> = {
    26: "Brazilian",
    6: "Angola",
    136: "Portuguese",
    50: "French",
    157: "Spanish",
    43: "Dominican Republic",
    54: "Ghana",
    21: "Benin",
    33: "Chile",
    137: "Qatar",
    147: "Saudi Arabia",

    // Add more as needed
  };

  return nationalityMap[id] || `Nationality ID: ${id}`;
};

// Mock data for fallback when API is unavailable
const mockPlayers: Player[] = [
  {
    id: "1",
    name: "Romarinho",
    age: 34,
    position: "Right Winger",
    positionId: 12,
    nationality: "Brazilian",
    club: "Fenerbahçe",
    marketValue: "€12.5M",
    isLbPlayer: true,
  },
  {
    id: "2",
    name: "Uilton",
    age: 32,
    position: "Right Winger",
    positionId: 12,
    nationality: "Brazilian",
    club: "FC Porto",
    marketValue: "€8.2M",
  },
  {
    id: "3",
    name: "Tiago Orobó",
    age: 31,
    position: "Center-Forward",
    positionId: 14,
    nationality: "Brazilian",
    club: "Barcelona",
    marketValue: "€15.7M",
    isLbPlayer: true,
  },
  {
    id: "4",
    name: "Buller",
    age: 30,
    position: "Left Winger",
    positionId: 11,
    nationality: "Brazilian",
    club: "Manchester United",
    marketValue: "€7.3M",
  },
  {
    id: "5",
    name: "Farley Rosa",
    age: 31,
    position: "Left Winger",
    positionId: 11,
    nationality: "Brazilian / Portuguese",
    club: "FC Porto",
    marketValue: "€9.1M",
    isLbPlayer: true,
  },
  {
    id: "6",
    name: "Lucas Rocha",
    age: 29,
    position: "Center-Back",
    positionId: 3,
    nationality: "Brazilian",
    club: "AC Milan",
    marketValue: "€11.8M",
  },
  {
    id: "7",
    name: "Paulo Henrique",
    age: 26,
    position: "Defensive Midfielder",
    positionId: 6,
    nationality: "Brazilian",
    club: "Juventus",
    marketValue: "€14.2M",
    isLbPlayer: true,
  },
];

// Error handling helper
const handleApiError = (error: any): Player[] => {
  console.error("API Error:", error);
  console.warn("Falling back to mock data since API is unavailable");
  return mockPlayers;
};

// Helper function to filter mock data with various filters
const getMockPlayersWithFilters = (filters: any = {}): Player[] => {
  console.log("Filtering mock data with filters:", filters);
  let filteredPlayers = [...mockPlayers];

  // Name filter
  if (filters.name) {
    const searchName = filters.name.toLowerCase();
    filteredPlayers = filteredPlayers.filter((player) =>
      player.name.toLowerCase().includes(searchName)
    );
    console.log(`After name filter: ${filteredPlayers.length} players`);
  }

  // Age filter
  if (filters.minAge && filters.maxAge) {
    filteredPlayers = filteredPlayers.filter(
      (player) =>
        player.age >= Number(filters.minAge) &&
        player.age <= Number(filters.maxAge)
    );
    console.log(`After age range filter: ${filteredPlayers.length} players`);
  } else if (filters.minAge) {
    filteredPlayers = filteredPlayers.filter(
      (player) => player.age >= Number(filters.minAge)
    );
    console.log(`After min age filter: ${filteredPlayers.length} players`);
  } else if (filters.maxAge) {
    filteredPlayers = filteredPlayers.filter(
      (player) => player.age <= Number(filters.maxAge)
    );
    console.log(`After max age filter: ${filteredPlayers.length} players`);
  }

  // Position filter - simplified approach
  if (filters.position) {
    const positionId = parseInt(filters.position, 10);
    const positionName = positionMap[positionId];

    console.log(`Filtering by position ID ${positionId} (${positionName})`);

    // Simple approach: if the player has a matching positionId, include them
    const positionMatches = filteredPlayers.filter(
      (player) => player.positionId === positionId
    );

    console.log(
      `Found ${positionMatches.length} players with exact position ID match`
    );

    // If we found matches, use them
    if (positionMatches.length > 0) {
      filteredPlayers = positionMatches;
    }
    // Otherwise, try matching by position name
    else if (positionName) {
      const nameMatches = mockPlayers.filter(
        (player) => player.position === positionName
      );

      console.log(
        `Found ${nameMatches.length} players with exact position name match`
      );

      if (nameMatches.length > 0) {
        filteredPlayers = nameMatches;
      } else {
        // Last resort: partial position name match
        const partialMatches = mockPlayers.filter((player) =>
          player.position.toLowerCase().includes(positionName.toLowerCase())
        );

        console.log(
          `Found ${partialMatches.length} players with partial position name match`
        );

        if (partialMatches.length > 0) {
          filteredPlayers = partialMatches;
        }
      }
    }
  }

  // Nationality filter
  if (filters.nationality) {
    const searchNationality = filters.nationality.toLowerCase();
    filteredPlayers = filteredPlayers.filter((player) =>
      player.nationality.toLowerCase().includes(searchNationality)
    );
    console.log(`After nationality filter: ${filteredPlayers.length} players`);
  }

  // Club filter
  if (filters.club) {
    const searchClub = filters.club.toLowerCase();
    filteredPlayers = filteredPlayers.filter((player) =>
      player.club?.toLowerCase().includes(searchClub)
    );
    console.log(`After club filter: ${filteredPlayers.length} players`);
  }

  // LB Player filter
  if (filters.isLbPlayer === "true") {
    filteredPlayers = filteredPlayers.filter(
      (player) => player.isLbPlayer === true
    );
    console.log(`After LB player filter: ${filteredPlayers.length} players`);
  }

  console.log(`Final filtered players: ${filteredPlayers.length}`);
  return filteredPlayers;
};

// Get all players with optional filtering - now using the Transfermarkt API
export const getPlayers = async (filters: any = {}): Promise<Player[]> => {
  console.log("getPlayers called with filters:", JSON.stringify(filters));

  // For backward compatibility, still support the mock data option
  if (filters._useMock === "true" || (API_CONFIG.USE_MOCK_DATA_IF_API_DOWN && !(await checkApiAvailability()))) {
    console.log("Using mock data - either explicitly requested or API appears to be unavailable");
    return getMockPlayersWithFilters(filters);
  }

  try {
    // Now we're using the cache API to get all players at once instead of searching
    // This allows us to do more flexible client-side filtering
    
    // Build the URL for the cache endpoint
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_PLAYERS}`;
    // We are fetching ALL players from the cache endpoint, so no query parameters needed here.
    let queryParams: string[] = [];
    
    console.log('Using the cache endpoint to fetch ALL player profiles');
    
    // Log the filters we'll apply client-side
    if (filters.name) {
      console.log(`Will apply name filter for "${filters.name}" client-side`);
    }
    
    if (filters.position) {
      console.log(`Will apply position filter with ID ${filters.position} client-side`);
    }
    
    if (filters.minAge || filters.maxAge) {
      console.log(`Will apply age filters client-side: min=${filters.minAge || 'none'}, max=${filters.maxAge || 'none'}`);
    }
    
    if (filters.nationality) {
      console.log(`Will apply nationality filter for ${filters.nationality} client-side`);
    }
    
    if (filters.club) {
      console.log(`Will apply club filter for ${filters.club} client-side`);
    }
    
    if (filters.isLbPlayer === "true") {
      console.log("Will apply LB player filter client-side");
    }

    // Construct the full URL with query parameters
    const url = `${apiUrl}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
    console.log(`Requesting API with URL: ${url}`);

    // Set timeout to avoid long waiting times if API is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    console.log(`Fetching data from: ${url}`);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    console.log(
      `API Response status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Response data type: ${typeof data}`);
    
    // The cache endpoint returns an array of player objects directly
    if (!Array.isArray(data)) {
      console.log('Unexpected API response format, expected an array');
      console.log('API response type:', typeof data);
      // Show a snippet of the response for debugging
      console.log('API response preview:', JSON.stringify(data).substring(0, 200) + '...');
      return [];
    }
    
    console.log(`Cache API returned ${data.length} player profiles`);
    
    if (data.length > 0) {
      console.log("First player sample:", JSON.stringify(data[0], null, 2));
    }

    // Transform the data from cache endpoint to match our Player interface
    let players = data.map((playerData: any) => transformPlayerProfileFromCache(playerData));
      
    console.log(`Transformed ${players.length} players from cache endpoint`);
    console.log(
      "Mapped players sample:",
      players.slice(0, 2).map((p: Player) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        positionId: p.positionId,
        nationality: p.nationality,
        club: p.club,
        marketValue: p.marketValue,
        isLbPlayer: p.isLbPlayer,
      }))
    );

    // Apply additional client-side filtering if needed
    // Position filtering should already be handled by the API, but let's double-check
    if (filters.position && players.length > 0) {
      const positionId = parseInt(filters.position, 10);
      console.log(`Double-checking position filter for ID: ${positionId}`);

      // Log position IDs of returned players
      const positionIds = players.map((p: Player) => p.positionId);
      console.log(
        `Position IDs in returned players: ${positionIds.join(", ")}`
      );

      // Filter again on client side if needed
      players = players.filter((player: Player) => player.positionId === positionId);
      console.log(
        `After client-side position filtering: ${players.length} players`
      );
    }

    // Log the full filters object received for client-side filtering
    console.log("DEBUG: Client-side filters received:", JSON.stringify(filters));

    // Apply name filtering on client side to ensure partial matches work correctly
    if (filters.name) {
      console.log("Applying client-side name filtering for partial matches");
      const searchName = filters.name.toLowerCase();

      // Log player names before filtering for debugging
      if (players.length > 0) {
        console.log(
          "Player names before filtering (sample):",
          players
            .slice(0, 5)
            .map((p: Player) => p.name)
            .join(", ") + (players.length > 5 ? "..." : "")
        );
      }

      // Filter players whose names contain the search term (case insensitive)
      players = players.filter((player: Player) => {
        // Ensure we have a valid name before attempting to search
        return player.name && player.name.toLowerCase().includes(searchName);
      });

      // Log results after filtering
      if (players.length > 0) {
        console.log(
          "Player names after filtering (sample):",
          players
            .slice(0, 5)
            .map((p: Player) => p.name)
            .join(", ") + (players.length > 5 ? "..." : "")
        );
      } else {
        console.log("No players matched the name filter criteria");
      }
      console.log(`After client-side name filtering: ${players.length} players`);
    }

    // Apply age filtering on client side
    if (filters.minAge || filters.maxAge) {
      console.log("Applying client-side age filtering");

      const minAge = filters.minAge ? parseInt(filters.minAge, 10) : 0;
      const maxAge = filters.maxAge ? parseInt(filters.maxAge, 10) : 100;

      console.log(`Age range: ${minAge} - ${maxAge}`);
      console.log(
        "Player ages before filtering:",
        players.map((p: Player) => p.age).join(", ")
      );

      players = players.filter((player: Player) => {
        const age = player.age || 0;
        const meetsMinAge = isNaN(minAge) || age >= minAge;
        const meetsMaxAge = isNaN(maxAge) || age <= maxAge;
        return meetsMinAge && meetsMaxAge;
      });

      console.log(
        "Player ages after filtering:",
        players.map((p: Player) => p.age).join(", ")
      );
      console.log(`After client-side age filtering: ${players.length} players`);
    }

    if (filters.nationality) {
      const searchNationality = filters.nationality.toLowerCase();
      players = players.filter((player: Player) =>
        player.nationality.toLowerCase().includes(searchNationality)
      );
    }

    if (filters.club && players.length > 0 && players[0].club) {
      const searchClub = filters.club.toLowerCase();
      players = players.filter((player: Player) =>
        player.club?.toLowerCase().includes(searchClub)
      );
    }

    // Apply LB player filter on client side
    if (filters.isLbPlayer === "true") {
      console.log("Applying client-side LB player filtering");
      console.log(`Players before LB filter: ${players.length}`);

      players = players.filter((player: Player) => player.isLbPlayer === true);

      console.log(`Players after LB filter: ${players.length}`);
    }

    // Apply Market Value filter on client side
    const minValue = filters.minValue ? parseFloat(filters.minValue) : undefined;
    const maxValue = filters.maxValue ? parseFloat(filters.maxValue) : undefined;

    if (minValue !== undefined || maxValue !== undefined) {
      console.log(`DEBUG: Parsed minValue: ${minValue} (type: ${typeof minValue}), Parsed maxValue: ${maxValue} (type: ${typeof maxValue})`); // Log parsed values
      console.log(`Applying client-side market value filtering (Min: ${minValue}, Max: ${maxValue})`);
      console.log(`Players before market value filter: ${players.length}`);

      let mvLogCounter = 0; // Counter to limit logging
      players = players.filter((player: Player) => {
        const value = player.marketValueNumber;
        // If marketValueNumber is undefined or null, the player does not meet the criteria
        if (value === undefined || value === null) {
            return false;
        }
        const meetsMin = minValue === undefined || isNaN(minValue) || value >= minValue;
        const meetsMax = maxValue === undefined || isNaN(maxValue) || value <= maxValue;
        const result = meetsMin && meetsMax;
        // Log details for the first few players being checked
        if (mvLogCounter < 5) {
          console.log(`DEBUG MV Filter: Player=${player.id}, Value=${value}, Min=${minValue}, Max=${maxValue}, meetsMin=${meetsMin}, meetsMax=${meetsMax}, Result=${result}`);
          mvLogCounter++;
        }
        return result;
      });

      console.log(`Players after market value filter: ${players.length}`);
    }

    return players;
  } catch (error) {
    // Log detailed error information
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("API request timed out");
    } else if (
      error instanceof TypeError &&
      (error as TypeError).message.includes("Failed to fetch")
    ) {
      console.error("Network error: API server might be down or CORS issues");
    } else {
      console.error("API Error:", error);

      // Safe error object extraction
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    }
    console.warn("Falling back to mock data since API is unavailable");

    // Fall back to mock data
    return getMockPlayersWithFilters(filters);
  }
};

// Get player by ID - Now using the cache endpoint
export const getPlayerById = async (id: string): Promise<Player | null> => {
  try {
    // Check if we should use mock data if API is unavailable
    const apiAvailable = await checkApiAvailability();
    if (API_CONFIG.USE_MOCK_DATA_IF_API_DOWN && !apiAvailable) {
      console.warn("API appears to be unavailable, using mock data for player details");
      const mockPlayer = mockPlayers.find(p => p.id === id);
      return mockPlayer || null;
    }
    
    // First we'll try to find the player in the cache
    // This approach is more efficient than requesting individual player profiles
    console.log(`Finding player ${id} from the player cache`);
    
    // Set timeout to avoid long waiting times if API is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT || 5000);

    // Fetch from cache endpoint, with a limit of 50 to get as many players as possible
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_PLAYERS}?limit=50`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    console.log(
      `API Response status for player ${id}: ${response.status} ${response.statusText}`
    );

    if (response.status === 404) {
      console.log(`Player with ID ${id} not found`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache endpoint returns an array of player profiles
    if (Array.isArray(data)) {
      // Find the player with the matching ID in the cache
      const playerData = data.find((player: any) => player.id === id);
      
      if (playerData) {
        console.log(`Found player ${id} in cache`);
        return transformPlayerProfileFromCache(playerData);
      } else {
        console.log(`Player ${id} not found in cache, falling back to mock data`);
        const mockPlayer = mockPlayers.find(p => p.id === id);
        return mockPlayer || null;
      }
    } else {
      // If response is not an array, it might be a direct player profile
      if (data.id === id) {
        return transformPlayerProfileFromCache(data);
      }
      
      console.error('Unexpected response format from cache endpoint');
      return null;
    }
  } catch (error) {
    console.error("Error fetching player by ID:", error);

    // If API is unavailable, try to find the player in mock data
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("API request timed out, falling back to mock data");
    } else if (
      error instanceof TypeError &&
      (error as TypeError).message.includes("Failed to fetch")
    ) {
      console.warn(
        "Network error: API server might be down or CORS issues, falling back to mock data"
      );
    } else {
      console.warn("API error, falling back to mock data");

      // Safe error object extraction
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    }

    const mockPlayer = mockPlayers.find((p) => p.id === id);
    return mockPlayer || null;
  }
};
