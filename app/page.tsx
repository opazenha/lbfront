"use client";

import { useState, FormEvent, useEffect } from "react";
import MainLayout from "./components/MainLayout";
import PlayerFilter from "./components/PlayerFilter";
import PlayerTable from "./components/PlayerTable";
import { getPlayers, Player, checkApiAvailability } from "./services/playerService";

interface PlayerData {
  _id: string;
  player: {
    name: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    nationalities: {
      nationalityId: number;
      secondNationalityId: number;
    };
    attributes: {
      positionId: number;
    };
    marketValueDetails: {
      current: {
        compact: {
          prefix: string;
          content: string;
          suffix: string;
        };
        determined: string;
      };
    };
  };
  performance: Array<{
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
  }>;
  aggregated: {
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
  };
}

const positionMap: Record<number, string> = {
  1: "Goalkeeper",
  2: "Right-Back",
  3: "Left-Back",
  4: "Center-Back",
  5: "Defensive Midfielder",
  6: "Central Midfielder",
  7: "Attacking Midfielder",
  8: "Right Winger",
  9: "Left Winger",
  10: "Second Striker",
  11: "Center-Forward",
};

const countryMap: Record<number, string> = {
  6: "Europe",
  28: "Bulgaria",
  136: "Portugal",
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setApiStatus('checking');
      try {
        const data = await getPlayers();
        setPlayers(data);
        
        // Check if the API is available
        const isApiAvailable = await checkApiAvailability();
        
        if (isApiAvailable) {
          setApiStatus('connected');
          setError(null);
        } else {
          setApiStatus('disconnected');
          setError('Unable to connect to the LB Sports API. Using mock data instead.');
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setApiStatus('disconnected');
        setError('Failed to load player data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const newFilters: Record<string, string> = {};
    
    // Convert FormData to filters object
    formData.forEach((value, key) => {
      if (value && typeof value === 'string' && value.trim() !== '') {
        newFilters[key] = value.trim();
      }
    });
    
    setFilters(newFilters);
    
    try {
      const data = await getPlayers(newFilters);
      setPlayers(data);
      
      // If we already know we're disconnected, check if API is now available
      if (apiStatus !== 'connected') {
        const isApiAvailable = await checkApiAvailability();
        
        if (isApiAvailable) {
          setApiStatus('connected');
          setError(null);
        }
      }
      
      if (data.length === 0) {
        setError('No players found matching your criteria.');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setApiStatus('disconnected');
      setError("Error fetching player data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="LB Sports Management">
      <div className="dashboard">
        <div className="header-container">
          <div>
            <h2 className="section-title">Player Management</h2>
            <p className="section-description">
              Search, filter, and manage player information in our database.
            </p>
          </div>
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-label">Total Players</span>
              <span className="stat-value">{players.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">LB Players</span>
              <span className="stat-value">{players.filter(p => p.isLbPlayer).length}</span>
            </div>
            <div className={`api-status ${apiStatus}`}>
              <span className="status-indicator"></span>
              <span className="status-text">
                {apiStatus === 'connected' ? 'API Connected' : 
                 apiStatus === 'disconnected' ? 'Using Mock Data' : 'Checking API...'}
              </span>
            </div>
          </div>
        </div>
        
        <PlayerFilter onSubmit={handleSubmit} loading={loading} />
        
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}
        
        <PlayerTable 
          players={players} 
          loading={loading} 
        />
        
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color lb-player"></div>
            <span>LB Player</span>
          </div>
          <div className="legend-item">
            <div className="legend-color regular-player"></div>
            <span>Regular Player</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        
        .section-title {
          color: var(--primary);
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .section-description {
          color: var(--foreground);
          margin-bottom: 0;
          font-size: 16px;
          opacity: 0.7;
        }
        
        .stats-container {
          display: flex;
          gap: 16px;
        }
        
        .stat-item {
          background-color: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          min-width: 120px;
          text-align: center;
        }
        
        .stat-label {
          display: block;
          font-size: 12px;
          color: #999;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }
        
        .error-message {
          background-color: rgba(220, 38, 38, 0.1);
          border: 1px solid var(--error);
          color: var(--error);
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .legend {
          display: flex;
          gap: 16px;
          margin-top: 16px;
          justify-content: flex-end;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #999;
        }
        
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }
        
        .lb-player {
          background-color: rgba(240, 193, 75, 0.2);
          border: 1px solid var(--primary);
        }
        
        .regular-player {
          background-color: transparent;
          border: 1px solid var(--border);
        }
        
        .api-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          margin-left: 16px;
        }
        
        .api-status.connected {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .api-status.disconnected {
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .api-status.checking {
          background-color: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .connected .status-indicator {
          background-color: #10b981;
        }
        
        .disconnected .status-indicator {
          background-color: #ef4444;
        }
        
        .checking .status-indicator {
          background-color: #f59e0b;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.5;
          }
        }
      `}</style>
    </MainLayout>
  );
}
