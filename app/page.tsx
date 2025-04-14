"use client";

import { FormEvent, useEffect, useState } from "react";
import MainLayout from "./components/MainLayout";
import PlayerFilter from "./components/PlayerFilter";
import PlayerTable from "./components/PlayerTable";
import {
  checkApiAvailability,
  getPlayers,
  Player,
} from "./services/playerService";

export default function Home() {
  // All players fetched from API
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  // Players after applying filters
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  // Players currently displayed (subset of filtered players)
  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>([]);

  // Number of players to show per page
  const PLAYERS_PER_PAGE = 50;

  // Current page number
  const [currentPage, setCurrentPage] = useState(1);

  // Track if a search has been performed
  const [hasSearched, setHasSearched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [apiStatus, setApiStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setApiStatus("checking");
      try {
        // Fetch all players but don't display them yet
        const data = await getPlayers();
        setAllPlayers(data);
        setFilteredPlayers([]);
        setDisplayedPlayers([]);

        // Check if the API is available
        const isApiAvailable = await checkApiAvailability();

        if (isApiAvailable) {
          setApiStatus("connected");
          setError(null);
        } else {
          setApiStatus("disconnected");
          setError(
            "Unable to connect to the LB Sports API. Using mock data instead."
          );
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        setApiStatus("disconnected");
        setError("Failed to load player data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Function to apply filters and update displayed players
  const applyFilters = (filters: Record<string, string>) => {
    let filtered = [...allPlayers];

    // Apply each filter
    if (filters.name) {
      const searchName = filters.name.toLowerCase();
      filtered = filtered.filter((player) =>
        player.name.toLowerCase().includes(searchName)
      );
    }

    if (filters.position) {
      filtered = filtered.filter(
        (player) => player.positionId === parseInt(filters.position)
      );
    }

    if (filters.nationality) {
      const searchNationality = filters.nationality.toLowerCase();
      filtered = filtered.filter((player) =>
        player.nationality.toLowerCase().includes(searchNationality)
      );
    }

    if (filters.club) {
      const searchClub = filters.club.toLowerCase();
      filtered = filtered.filter((player) =>
        player.club?.toLowerCase().includes(searchClub)
      );
    }

    if (filters.isLbPlayer === "true") {
      filtered = filtered.filter((player) => player.isLbPlayer === true);
    }

    // Apply market value filter if present
    const minValue = filters.minValue
      ? parseFloat(filters.minValue)
      : undefined;
    const maxValue = filters.maxValue
      ? parseFloat(filters.maxValue)
      : undefined;

    if (minValue !== undefined || maxValue !== undefined) {
      filtered = filtered.filter((player) => {
        const value = player.marketValueNumber;
        if (value === undefined || value === null) return false;
        const meetsMin =
          minValue === undefined || isNaN(minValue) || value >= minValue;
        const meetsMax =
          maxValue === undefined || isNaN(maxValue) || value <= maxValue;
        return meetsMin && meetsMax;
      });
    }

    return filtered;
  };

  // Function to load more players
  const loadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * PLAYERS_PER_PAGE; // Start from where we left off
    const endIndex = nextPage * PLAYERS_PER_PAGE;

    // Get the next batch of players
    const nextBatch = filteredPlayers.slice(startIndex, endIndex);

    setDisplayedPlayers([...displayedPlayers, ...nextBatch]);
    setCurrentPage(nextPage);
  };

  const handleSubmit = async (newFilters: Record<string, string>) => {
    setLoading(true);
    setError(null);
    setFilters(newFilters);

    try {
      // Apply filters to all players
      const filtered = applyFilters(newFilters);
      setFilteredPlayers(filtered);

      // Reset pagination
      setCurrentPage(1);

      // Show first page of results
      setDisplayedPlayers(filtered.slice(0, PLAYERS_PER_PAGE));

      // Mark that a search has been performed
      setHasSearched(true);

      if (filtered.length === 0) {
        setError("No players found matching your criteria.");
      }
    } catch (error) {
      console.error("Error applying filters:", error);
      setError("Error filtering player data. Please try again.");
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
              <span className="stat-value">{allPlayers.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">LB Players</span>
              <span className="stat-value">
                {allPlayers.filter((p: Player) => p.isLbPlayer).length}
              </span>
            </div>
            <div className={`api-status ${apiStatus}`}>
              <span className="status-indicator"></span>
              <span className="status-text">
                {apiStatus === "connected"
                  ? "API Connected"
                  : apiStatus === "disconnected"
                  ? "Using Mock Data"
                  : "Checking API..."}
              </span>
            </div>
          </div>
        </div>

        <PlayerFilter onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="error-message">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {/* Only show table after search */}
        {hasSearched && (
          <>
            <PlayerTable players={displayedPlayers} loading={loading} />

            {/* Show load more button if there are more players to display */}
            {displayedPlayers.length < filteredPlayers.length && (
              <button
                onClick={loadMore}
                className="load-more-button"
                disabled={loading}
              >
                Load More Players
              </button>
            )}
          </>
        )}

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

        .load-more-button {
          display: block;
          width: 100%;
          max-width: 200px;
          margin: 20px auto;
          padding: 12px 24px;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .load-more-button:hover {
          background-color: var(--primary-dark);
        }

        .load-more-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
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
