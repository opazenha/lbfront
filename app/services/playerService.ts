// Transfermarkt API integration service

// Import API configuration
import { API_CONFIG } from "../config/apiConfig";

// Check if Transfermarkt API is available using the cache stats endpoint
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_STATS}`;
    console.log(
      `Checking API availability at: ${apiUrl} with ${
        API_CONFIG.TIMEOUT / 1000
      }s timeout`
    );

    const response = (await Promise.race([
      fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("API check timed out")),
          API_CONFIG.TIMEOUT || 10000
        )
      ),
    ])) as Response;

    console.log(
      `API availability check response: ${response.status} ${response.statusText}`
    );
    return response.ok;
  } catch (error: any) {
    console.error("API availability check failed. Error details:");
    if (error instanceof Error) {
      console.error(`  Name: ${error.name}`);
      console.error(`  Message: ${error.message}`);
      // Don't log stack trace for timeout errors
      if (error.message !== "API check timed out" && error.stack) {
        console.error(`  Stack: ${error.stack}`);
      }
    } else {
      console.error("  Raw Error:", error);
    }
    console.error(
      `Could not connect to API at ${API_CONFIG.BASE_URL}. Ensure the API server is running and check CORS configuration.`
    );
    return false;
  }
};

// Simplified Player interface for our UI
export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;

  nationality: string;
  club?: string;
  marketValue: string; // Formatted string for display (e.g., €2.00m)
  marketValueNumber?: number; // Raw numerical value for sorting/calculations
  imageUrl?: string;
  isLbPlayer?: boolean;
}

// Transform player profile data from the cache endpoint to our internal Player interface
const transformPlayerProfileFromCache = (data: any): Player => {
  // Handle the player profile structure from the cache endpoint

  // Get primary position from the position object
  const positionMain = data.position?.main || "Unknown";

  // Get the formatted market value string from API (e.g., "€450k", "€2.00m")
  const marketValueString = data.marketValue || "Unknown";

  // Parse the string to get the numerical value using our helper function
  const marketValueNumber = parseMarketValue(marketValueString);

  // Get nationality (use citizenship array)
  const nationality =
    data.citizenship && data.citizenship.length > 0
      ? data.citizenship[0]
      : "Unknown";

  // Get club information
  const club = data.club?.name || "Unknown";

  return {
    id: data.id,
    name: data.name,
    age: data.age || 0,
    position: positionMain,

    nationality: nationality,
    club: club,
    marketValue: marketValueString, // Keep the original formatted string for display
    marketValueNumber: marketValueNumber, // Store the parsed numerical value
    isLbPlayer: data.isLbPlayer === true, // Get the value from API data, default to false if missing/null
    imageUrl: data.imageUrl, // Add image URL if available
  };
};

// Helper function to parse market value strings (e.g., "€450k", "€2.00m") into numbers
const parseMarketValue = (
  valueString: string | null | undefined
): number | undefined => {
  if (
    !valueString ||
    typeof valueString !== "string" ||
    valueString.toLowerCase() === "unknown"
  ) {
    return undefined;
  }

  // Remove currency symbols (€, $, £ etc.) and whitespace
  const cleanedString = valueString.replace(/[^0-9.,mk]/gi, "").trim();

  let multiplier = 1;
  let numberPart = cleanedString;

  if (cleanedString.endsWith("m")) {
    multiplier = 1000000;
    numberPart = cleanedString.substring(0, cleanedString.length - 1);
  } else if (cleanedString.endsWith("k")) {
    multiplier = 1000;
    numberPart = cleanedString.substring(0, cleanedString.length - 1);
  }

  // Replace comma with dot for decimal conversion if needed
  numberPart = numberPart.replace(",", ".");

  const numericValue = parseFloat(numberPart);

  if (isNaN(numericValue)) {
    console.warn(`Could not parse market value: ${valueString}`);
    return undefined;
  }

  return numericValue * multiplier;
};

// Mock data for fallback when API is unavailable
const mockPlayers: Player[] = [
  {
    id: "1",
    name: "Romarinho",
    age: 34,
    position: "Right Winger",
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
    nationality: "Brazilian",
    club: "FC Porto",
    marketValue: "€8.2M",
  },
  {
    id: "3",
    name: "Tiago Orobó",
    age: 31,
    position: "Center-Forward",
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
    nationality: "Brazilian",
    club: "Manchester United",
    marketValue: "€7.3M",
  },
  {
    id: "5",
    name: "Farley Rosa",
    age: 31,
    position: "Left Winger",
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
    nationality: "Brazilian",
    club: "AC Milan",
    marketValue: "€11.8M",
  },
  {
    id: "7",
    name: "Paulo Henrique",
    age: 26,
    position: "Defensive Midfielder",
    nationality: "Brazilian",
    club: "Juventus",
    marketValue: "€14.2M",
    isLbPlayer: true,
  },
];

// Get all players with optional filtering - now using the Transfermarkt API
export const getPlayers = async (filters: any = {}): Promise<Player[]> => {
  console.log("getPlayers called with filters:", JSON.stringify(filters));

  // For backward compatibility, still support the mock data option
  if (
    filters._useMock === "true" ||
    (API_CONFIG.USE_MOCK_DATA_IF_API_DOWN && !(await checkApiAvailability()))
  ) {
    console.log(
      "Using mock data - either explicitly requested or API appears to be unavailable"
    );
    return mockPlayers;
  }

  try {
    // Now we're using the cache API to get all players at once instead of searching
    // This allows us to do more flexible client-side filtering

    // Build the URL for the cache endpoint
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_PLAYERS}`;
    // We are fetching ALL players from the cache endpoint, so no query parameters needed here.
    let queryParams: string[] = [];

    console.log("Using the cache endpoint to fetch ALL player profiles");

    // Log the filters we'll apply client-side
    if (filters.name) {
      console.log(`Will apply name filter for "${filters.name}" client-side`);
    }

    if (filters.position) {
      console.log(
        `Will apply position filter with ID ${filters.position} client-side`
      );
    }

    if (filters.minAge || filters.maxAge) {
      console.log(
        `Will apply age filters client-side: min=${
          filters.minAge || "none"
        }, max=${filters.maxAge || "none"}`
      );
    }

    if (filters.nationality) {
      console.log(
        `Will apply nationality filter for ${filters.nationality} client-side`
      );
    }

    if (filters.club) {
      console.log(`Will apply club filter for ${filters.club} client-side`);
    }

    if (filters.isLbPlayer === "true") {
      console.log("Will apply LB player filter client-side");
    }

    // Construct the full URL with query parameters
    const url = `${apiUrl}${
      queryParams.length > 0 ? "?" + queryParams.join("&") : ""
    }`;
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
      console.log("Unexpected API response format, expected an array");
      console.log("API response type:", typeof data);
      // Show a snippet of the response for debugging
      console.log(
        "API response preview:",
        JSON.stringify(data).substring(0, 200) + "..."
      );
      return [];
    }

    console.log(`Cache API returned ${data.length} player profiles`);

    if (data.length > 0) {
      console.log("First player sample:", JSON.stringify(data[0], null, 2));
    }

    // Transform the data from cache endpoint to match our Player interface
    let players = data.map((playerData: any) =>
      transformPlayerProfileFromCache(playerData)
    );

    console.log(`Transformed ${players.length} players from cache endpoint`);
    console.log(
      "Mapped players sample:",
      players.slice(0, 2).map((p: Player) => ({
        id: p.id,
        name: p.name,
        position: p.position,

        nationality: p.nationality,
        club: p.club,
        marketValue: p.marketValue,
        isLbPlayer: p.isLbPlayer,
      }))
    );

    // Apply additional client-side filtering if needed
    // Position filtering
    if (filters.position && players.length > 0) {
      console.log(`Filtering by position: ${filters.position}`);
      players = players.filter(
        (player: Player) => player.position === filters.position
      );
      console.log(
        `After client-side position filtering: ${players.length} players`
      );
    }

    // Log the full filters object received for client-side filtering
    console.log(
      "DEBUG: Client-side filters received:",
      JSON.stringify(filters)
    );

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
    const minValue = filters.minValue
      ? parseFloat(filters.minValue)
      : undefined;
    const maxValue = filters.maxValue
      ? parseFloat(filters.maxValue)
      : undefined;

    if (minValue !== undefined || maxValue !== undefined) {
      console.log(
        `DEBUG: Parsed minValue: ${minValue} (type: ${typeof minValue}), Parsed maxValue: ${maxValue} (type: ${typeof maxValue})`
      ); // Log parsed values
      console.log(
        `Applying client-side market value filtering (Min: ${minValue}, Max: ${maxValue})`
      );
      console.log(`Players before market value filter: ${players.length}`);

      let mvLogCounter = 0; // Counter to limit logging
      players = players.filter((player: Player) => {
        const value = player.marketValueNumber;
        // If marketValueNumber is undefined or null, the player does not meet the criteria
        if (value === undefined || value === null) {
          return false;
        }
        const meetsMin =
          minValue === undefined || isNaN(minValue) || value >= minValue;
        const meetsMax =
          maxValue === undefined || isNaN(maxValue) || value <= maxValue;
        const result = meetsMin && meetsMax;
        // Log details for the first few players being checked
        if (mvLogCounter < 5) {
          console.log(
            `DEBUG MV Filter: Player=${player.id}, Value=${value}, Min=${minValue}, Max=${maxValue}, meetsMin=${meetsMin}, meetsMax=${meetsMax}, Result=${result}`
          );
          mvLogCounter++;
        }
        return result;
      });

      console.log(`Players after market value filter: ${players.length}`);
    }

    return players;
  } catch (error) {
    console.error("Error fetching players from API:", error);
    console.log("Falling back to mock data due to API error.");
    // Return the raw mock players array. Filtering happens client-side.
    return mockPlayers;
  }
};

// Get player by ID - Now using the cache endpoint
export const getPlayerById = async (id: string): Promise<Player | null> => {
  try {
    // Check if we should use mock data if API is unavailable
    const apiAvailable = await checkApiAvailability();
    if (API_CONFIG.USE_MOCK_DATA_IF_API_DOWN && !apiAvailable) {
      console.warn(
        "API appears to be unavailable, using mock data for player details"
      );
      const mockPlayer = mockPlayers.find((p) => p.id === id);
      return mockPlayer || null;
    }

    // First we'll try to find the player in the cache
    // This approach is more efficient than requesting individual player profiles
    console.log(`Finding player ${id} from the player cache`);

    // Set timeout to avoid long waiting times if API is down
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_CONFIG.TIMEOUT || 5000
    );

    // Fetch from cache endpoint, with a limit of 50 to get as many players as possible
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_PLAYERS}?limit=50`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      }
    );

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
        console.log(
          `Player ${id} not found in cache, falling back to mock data`
        );
        const mockPlayer = mockPlayers.find((p) => p.id === id);
        return mockPlayer || null;
      }
    } else {
      // If response is not an array, it might be a direct player profile
      if (data.id === id) {
        return transformPlayerProfileFromCache(data);
      }

      console.error("Unexpected response format from cache endpoint");
      return null;
    }
  } catch (error) {
    console.error(`Error fetching player with ID ${id} from cache:`, error);
    console.log(`Falling back to mock data for player ID ${id}.`);
    // Find the player in the mock data
    const mockPlayer = mockPlayers.find((p) => p.id === id) || null;
    return mockPlayer;
  }
};
