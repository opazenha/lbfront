// LB Sports API service

// API base URL - using our Next.js API proxy instead of direct connection
const API_BASE_URL = '/api/players';

// Check if API is available through our proxy
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('API availability check failed:', error);
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
  nationality: string;
  club?: string;
  marketValue: string;
  imageUrl?: string;
  isLbPlayer?: boolean;
}

// Position mapping based on Transfermarkt position IDs
const positionMap: Record<number, string> = {
  1: 'Goalkeeper',
  2: 'Right-Back',
  3: 'Left-Back',
  4: 'Center-Back',
  5: 'Defensive Midfielder',
  6: 'Central Midfielder',
  7: 'Attacking Midfielder',
  8: 'Right Winger',
  9: 'Left Winger',
  10: 'Second Striker',
  11: 'Center-Forward',
  12: 'Striker',
};

// Helper function to convert API response to our simplified Player interface
const mapApiResponseToPlayer = (data: PlayerData): Player => {
  // Format market value
  const value = data.marketValueDetails?.current?.value || 0;
  const currency = data.marketValueDetails?.current?.currency || 'EUR';
  const formattedValue = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(value);
  
  return {
    id: data.transfermarktId,
    name: data.name,
    age: data.age,
    position: positionMap[data.attributes.positionId] || 'Unknown',
    nationality: getNationalityName(data.nationalities.nationalityId),
    marketValue: formattedValue,
    isLbPlayer: data.lbPlayer,
  };
};

// Helper function to get nationality name from ID
const getNationalityName = (id: number): string => {
  const nationalityMap: Record<number, string> = {
    26: 'Brazilian',
    136: 'Portuguese',
    39: 'English',
    40: 'French',
    157: 'Spanish',
    122: 'Italian',
    54: 'German',
    3: 'Argentina',
    // Add more as needed
  };
  
  return nationalityMap[id] || `Nationality ID: ${id}`;
};

// Mock data for fallback when API is unavailable
const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Romarinho',
    age: 34,
    position: 'Right Winger',
    nationality: 'Brazilian',
    club: 'Fenerbahçe',
    marketValue: '€12.5M',
    isLbPlayer: true,
  },
  {
    id: '2',
    name: 'Uilton',
    age: 32,
    position: 'Right Winger',
    nationality: 'Brasil',
    club: 'FC Porto',
    marketValue: '€8.2M',
  },
  {
    id: '3',
    name: 'Tiago Orobó',
    age: 31,
    position: 'Striker',
    nationality: 'Brazilian',
    club: 'Barcelona',
    marketValue: '€15.7M',
    isLbPlayer: true,
  },
  {
    id: '4',
    name: 'Buller',
    age: 30,
    position: 'Left Winger',
    nationality: 'Brasil',
    club: 'Manchester United',
    marketValue: '€7.3M',
  },
  {
    id: '5',
    name: 'Farley Rosa',
    age: 31,
    position: 'Left Winger',
    nationality: 'Brazilian / Portuguese',
    club: 'FC Porto',
    marketValue: '€9.1M',
    isLbPlayer: true,
  },
  {
    id: '6',
    name: 'Lucas Rocha',
    age: 29,
    position: 'Center-Back',
    nationality: 'Brazilian',
    club: 'AC Milan',
    marketValue: '€11.8M',
  }
];

// Error handling helper
const handleApiError = (error: any): Player[] => {
  console.error('API Error:', error);
  console.warn('Falling back to mock data since API is unavailable');
  return mockPlayers;
};

// Get all players with optional filtering
export const getPlayers = async (filters: any = {}): Promise<Player[]> => {
  try {
    let url = API_BASE_URL;
    
    // Handle age filter specifically as it has a dedicated endpoint
    if (filters.minAge || filters.maxAge) {
      url = `${API_BASE_URL}/age?min=${filters.minAge || 0}&max=${filters.maxAge || 99}`;
    } 
    // Handle position filter
    else if (filters.position) {
      // Find the position ID based on the position name
      const positionId = Object.entries(positionMap).find(
        ([, value]) => value.toLowerCase() === filters.position.toLowerCase()
      )?.[0];
      
      if (positionId) {
        url = `${API_BASE_URL}/position?positionId=${positionId}`;
      }
    }
    
    // Set timeout to avoid long waiting times if API is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    console.log(`Fetching data from: ${url}`);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`API Response status: ${response.status} ${response.statusText}`);
    
    // Log response headers for debugging
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Response headers:', headers);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    // Check if the response is an array or a single object
    const playerDataArray = Array.isArray(data) ? data : [data];
    let players = playerDataArray.map(mapApiResponseToPlayer);
    
    // Apply client-side filtering for other filters
    if (filters.name) {
      const searchName = filters.name.toLowerCase();
      players = players.filter(player => 
        player.name.toLowerCase().includes(searchName)
      );
    }
    
    if (filters.nationality) {
      const searchNationality = filters.nationality.toLowerCase();
      players = players.filter(player => 
        player.nationality.toLowerCase().includes(searchNationality)
      );
    }
    
    if (filters.club && players[0].club) {
      const searchClub = filters.club.toLowerCase();
      players = players.filter(player => 
        player.club?.toLowerCase().includes(searchClub)
      );
    }
    
    return players;
  } catch (error) {
    // Log detailed error information
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('API request timed out');
    } else if (error instanceof TypeError && (error as TypeError).message.includes('Failed to fetch')) {
      console.error('Network error: API server might be down or CORS issues');
    } else {
      console.error('API Error:', error);
      
      // Safe error object extraction
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
    console.warn('Falling back to mock data since API is unavailable');
    
    // Apply filters to mock data
    let filteredPlayers = [...mockPlayers];
    
    if (filters.name) {
      const searchName = filters.name.toLowerCase();
      filteredPlayers = filteredPlayers.filter(player => 
        player.name.toLowerCase().includes(searchName)
      );
    }
    
    if (filters.minAge && filters.maxAge) {
      filteredPlayers = filteredPlayers.filter(player => 
        player.age >= Number(filters.minAge) && player.age <= Number(filters.maxAge)
      );
    } else if (filters.minAge) {
      filteredPlayers = filteredPlayers.filter(player => 
        player.age >= Number(filters.minAge)
      );
    } else if (filters.maxAge) {
      filteredPlayers = filteredPlayers.filter(player => 
        player.age <= Number(filters.maxAge)
      );
    }
    
    if (filters.position) {
      filteredPlayers = filteredPlayers.filter(player => 
        player.position.toLowerCase().includes(filters.position.toLowerCase())
      );
    }
    
    if (filters.nationality) {
      filteredPlayers = filteredPlayers.filter(player => 
        player.nationality.toLowerCase().includes(filters.nationality.toLowerCase())
      );
    }
    
    if (filters.club) {
      filteredPlayers = filteredPlayers.filter(player => 
        player.club?.toLowerCase().includes(filters.club.toLowerCase())
      );
    }
    
    return filteredPlayers;
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
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`API Response status for player ${id}: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return mapApiResponseToPlayer(data);
  } catch (error) {
    console.error('Error fetching player by ID:', error);
    
    // If API is unavailable, try to find the player in mock data
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('API request timed out, falling back to mock data');
    } else if (error instanceof TypeError && (error as TypeError).message.includes('Failed to fetch')) {
      console.warn('Network error: API server might be down or CORS issues, falling back to mock data');
    } else {
      console.warn('API error, falling back to mock data');
      
      // Safe error object extraction
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
    
    const mockPlayer = mockPlayers.find(p => p.id === id);
    return mockPlayer || null;
  }
};
