// LB Sports API service

// API base URL - using our Next.js API proxy instead of direct connection
const API_BASE_URL = "/api/players";

// Check if API is available through our proxy
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error("API availability check failed:", error);
    return false;
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
  marketValue: string;
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

// Get all players with optional filtering
export const getPlayers = async (filters: any = {}): Promise<Player[]> => {
  console.log("getPlayers called with filters:", JSON.stringify(filters));

  // For debugging, use mock data if requested
  if (filters._useMock === "true") {
    console.log("Using mock data as requested");
    return getMockPlayersWithFilters(filters);
  }

  try {
    let url = API_BASE_URL;

    // Build query parameters for filtering
    const queryParams: string[] = [];

    // Handle position filter
    if (filters.position) {
      const positionId = filters.position;
      console.log(`Filtering by position ID: ${positionId}`);
      console.log(
        `Position name for ID ${positionId}: ${
          positionMap[parseInt(positionId, 10)] || "Unknown"
        }`
      );
      queryParams.push(`position=${positionId}`);
    }

    // Handle age filter
    if (filters.minAge) {
      const minAge = parseInt(filters.minAge, 10);
      if (!isNaN(minAge)) {
        console.log(`Filtering by minimum age: ${minAge}`);
        queryParams.push(`minAge=${minAge}`);
      }
    }

    if (filters.maxAge) {
      const maxAge = parseInt(filters.maxAge, 10);
      if (!isNaN(maxAge)) {
        console.log(`Filtering by maximum age: ${maxAge}`);
        queryParams.push(`maxAge=${maxAge}`);
      }
    }

    // Handle name filter
    if (filters.name) {
      // Use a special query parameter to indicate we want partial matches
      queryParams.push(`name=${encodeURIComponent(filters.name)}`);
      queryParams.push(`nameMatchType=partial`);
      console.log(
        `Searching for players with name containing: ${filters.name}`
      );
    }

    // Handle nationality filter
    if (filters.nationality) {
      queryParams.push(
        `nationality=${encodeURIComponent(filters.nationality)}`
      );
    }

    // Handle club filter
    if (filters.club) {
      queryParams.push(`club=${encodeURIComponent(filters.club)}`);
    }

    // Handle LB player filter
    if (filters.isLbPlayer === "true") {
      queryParams.push("isLbPlayer=true");
      console.log("Filtering for LB players only");
    }

    // Add query parameters to URL if any exist
    if (queryParams.length > 0) {
      url = `${API_BASE_URL}?${queryParams.join("&")}`;
    }

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

    // Log response headers for debugging
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("Response headers:", headers);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Response data type: ${typeof data}`);
    console.log(`API Response is array: ${Array.isArray(data)}`);
    console.log(
      `API Response length: ${Array.isArray(data) ? data.length : "N/A"}`
    );

    if (Array.isArray(data) && data.length > 0) {
      console.log("First player sample:", JSON.stringify(data[0], null, 2));
    }

    // Check if the response is an array or a single object
    const playerDataArray = Array.isArray(data) ? data : [data];
    console.log(
      `Processing ${playerDataArray.length} players from API response`
    );

    let players = playerDataArray.map(mapApiResponseToPlayer);
    console.log(
      "Mapped players sample:",
      players.slice(0, 2).map((p) => ({
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
      const positionIds = players.map((p) => p.positionId);
      console.log(
        `Position IDs in returned players: ${positionIds.join(", ")}`
      );

      // Filter again on client side if needed
      players = players.filter((player) => player.positionId === positionId);
      console.log(
        `After client-side position filtering: ${players.length} players`
      );
    }

    // Apply name filtering on client side to ensure partial matches work correctly
    if (filters.name) {
      console.log("Applying client-side name filtering for partial matches");
      const searchName = filters.name.toLowerCase();

      // Log player names before filtering for debugging
      console.log(
        "Player names before filtering:",
        players
          .slice(0, 5)
          .map((p) => p.name)
          .join(", ") + (players.length > 5 ? "..." : "")
      );

      // Filter players whose names contain the search term (case insensitive)
      players = players.filter((player) =>
        player.name.toLowerCase().includes(searchName)
      );

      console.log(
        "Player names after filtering:",
        players
          .slice(0, 5)
          .map((p) => p.name)
          .join(", ") + (players.length > 5 ? "..." : "")
      );
      console.log(
        `After client-side name filtering: ${players.length} players`
      );
    }

    // Apply age filtering on client side
    if (filters.minAge || filters.maxAge) {
      console.log("Applying client-side age filtering");

      const minAge = filters.minAge ? parseInt(filters.minAge, 10) : 0;
      const maxAge = filters.maxAge ? parseInt(filters.maxAge, 10) : 100;

      console.log(`Age range: ${minAge} - ${maxAge}`);
      console.log(
        "Player ages before filtering:",
        players.map((p) => p.age).join(", ")
      );

      players = players.filter((player) => {
        const age = player.age || 0;
        const meetsMinAge = isNaN(minAge) || age >= minAge;
        const meetsMaxAge = isNaN(maxAge) || age <= maxAge;
        return meetsMinAge && meetsMaxAge;
      });

      console.log(
        "Player ages after filtering:",
        players.map((p) => p.age).join(", ")
      );
      console.log(`After client-side age filtering: ${players.length} players`);
    }

    if (filters.nationality) {
      const searchNationality = filters.nationality.toLowerCase();
      players = players.filter((player) =>
        player.nationality.toLowerCase().includes(searchNationality)
      );
    }

    if (filters.club && players[0].club) {
      const searchClub = filters.club.toLowerCase();
      players = players.filter((player) =>
        player.club?.toLowerCase().includes(searchClub)
      );
    }

    // Apply LB player filter on client side
    if (filters.isLbPlayer === "true") {
      console.log("Applying client-side LB player filtering");
      console.log(`Players before LB filter: ${players.length}`);

      players = players.filter((player) => player.isLbPlayer === true);

      console.log(`Players after LB filter: ${players.length}`);
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

// Get player by ID
export const getPlayerById = async (id: string): Promise<Player | null> => {
  try {
    // Set timeout to avoid long waiting times if API is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    console.log(`Fetching player with ID: ${id}`);

    const response = await fetch(`${API_BASE_URL}/${id}`, {
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
      return null;
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return mapApiResponseToPlayer(data);
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
