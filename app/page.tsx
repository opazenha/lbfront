"use client";

import { useEffect, useState } from "react";
import MainLayout from "./components/MainLayout";
import PlayerFilter from "./players/components/PlayerFilter";
import PlayerTable from "./players/components/PlayerTable";
import { checkApiAvailability, getPlayers } from "./players/services/api";
import {
  Player as APIPlayer,
  Player as ServicePlayer,
} from "./players/services/types";

// UI player extends service data with client-only fields
type Player = APIPlayer & {
  citizenship: string[];
  nationality: string;
  placeOfBirth: { city: string; country: string };
};

export default function Home() {
  // All players fetched from API
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  // Normalize player shape for table compatibility
  function normalizePlayer(player: ServicePlayer): Player {
    const citizenship =
      typeof player.nationality === "string"
        ? player.nationality
            .split("/")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : Array.isArray(player.nationality)
        ? player.nationality
        : [];
    return {
      ...player,
      citizenship,
      nationality: citizenship[0] || "",
      placeOfBirth: player.placeOfBirth
        ? {
            city: player.placeOfBirth.city || "",
            country: player.placeOfBirth.country || "",
          }
        : { city: "", country: "" },
    };
  }

  // Players after applying filters
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  // Players currently displayed (subset of filtered players)
  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>([]);

  // Available positions from all players
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  // Number of players to show per page
  const PLAYERS_PER_PAGE = 50;

  // Current page number
  const [currentPage, setCurrentPage] = useState(1);

  // Track if a search has been performed
  const [hasSearched, setHasSearched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      // console.log("=== STARTING INITIAL DATA LOAD ===");
      setLoading(true);
      setApiStatus("checking");
      try {
        // Fetch all players but don't display them yet
        // console.log("Calling getPlayers() to fetch player data...");
        const data = await getPlayers();
        // console.log(`Received ${data?.length || 0} players from getPlayers():`);
        if (data?.length > 0) {
          // console.log("First player sample:", JSON.stringify(data[0], null, 2));
        } else {
          // console.log("No players received from getPlayers()");
        }

        const normalized = data.map(normalizePlayer);
        setAllPlayers(normalized);
        // console.log("Set allPlayers state with data");

        // Set filtered and displayed players to show all players initially
        setFilteredPlayers(normalized);
        setDisplayedPlayers(normalized.slice(0, PLAYERS_PER_PAGE));
        // console.log(`Displaying initial ${Math.min(data.length, PLAYERS_PER_PAGE)} players out of ${data.length}`);

        // Mark that a search has been performed so the table is displayed
        setHasSearched(true);

        // Get unique positions from players
        console.log("Extracting unique positions from player data...");
        const positions = Array.from(
          new Set(
            data.map((player) => {
              return player.position;
            })
          )
        );
        positions.sort(); // Sort alphabetically
        console.log(`Found ${positions.length} unique positions:`, positions);
        setAvailablePositions(positions);

        // Check if the API is available
        console.log("Checking API availability...");
        const isApiAvailable = await checkApiAvailability();
        console.log(
          `API availability check result: ${
            isApiAvailable ? "Connected" : "Disconnected"
          }`
        );

        if (isApiAvailable) {
          setApiStatus("connected");
          setError(null);
          console.log("API status set to connected");
        } else {
          setApiStatus("disconnected");
          setError(
            "Unable to connect to the LB Sports API. Using mock data instead."
          );
          console.log("API status set to disconnected, using mock data");
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        setApiStatus("disconnected");
        setError("Failed to load player data. Please try again.");
        console.log(
          "Error caught in loadInitialData, set status to disconnected"
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Function to apply filters and update displayed players
  const applyFilters = (filters: Record<string, string>) => {
    console.log("=== APPLYING FILTERS ===");
    console.log("Starting with all players:", allPlayers.length);
    console.log("Filter criteria:", filters);

    let filtered = [...allPlayers];
    console.log("Initial filtered array length:", filtered.length);

    // Apply each filter
    if (filters.name) {
      const searchName = filters.name.toLowerCase();
      console.log(`Applying name filter: '${searchName}'`);
      filtered = filtered.filter((player) => {
        const playerName = Array.isArray(player.name)
          ? player.name.join(" ")
          : player.name;
        const nameMatch =
          typeof playerName === "string" &&
          playerName.toLowerCase().includes(searchName);
        if (!nameMatch) {
          console.log(`Player rejected by name filter: ${player.name}`);
        }
        return nameMatch;
      });
      console.log(`After name filter: ${filtered.length} players`);
    }

    if (filters.position) {
      console.log(`Applying position filter: '${filters.position}'`);
      console.log("Available positions in data:", [
        ...new Set(allPlayers.map((p) => p.position)),
      ]);
      filtered = filtered.filter((player) => {
        const positionMatch = player.position === filters.position;
        if (!positionMatch) {
          console.log(
            `Player rejected by position filter: ${player.name}, position: ${player.position}`
          );
        }
        return positionMatch;
      });
      console.log(`After position filter: ${filtered.length} players`);
    }

    if (filters.nationality) {
      const searchNationality = filters.nationality.toLowerCase();
      console.log(`Applying nationality filter: '${searchNationality}'`);
      filtered = filtered.filter((player) => {
        const nationalityMatch = player.nationality
          .toLowerCase()
          .includes(searchNationality);
        if (!nationalityMatch) {
          console.log(
            `Player rejected by nationality filter: ${player.name}, nationality: ${player.nationality}`
          );
        }
        return nationalityMatch;
      });
      console.log(`After nationality filter: ${filtered.length} players`);
    }

    if (filters.club) {
      const searchClub = filters.club.toLowerCase();
      console.log(`Applying club filter: '${searchClub}'`);
      filtered = filtered.filter((player) => {
        const clubMatch = player.club?.toLowerCase().includes(searchClub);
        if (!clubMatch) {
          console.log(
            `Player rejected by club filter: ${player.name}, club: ${player.club}`
          );
        }
        return clubMatch;
      });
      console.log(`After club filter: ${filtered.length} players`);
    }

    if (filters.isLbPlayer === "true") {
      console.log("Applying LB Player filter");
      filtered = filtered.filter((player) => {
        const lbPlayerMatch = player.isLbPlayer === true;
        if (!lbPlayerMatch) {
          console.log(
            `Player rejected by LB Player filter: ${player.name}, isLbPlayer: ${player.isLbPlayer}`
          );
        }
        return lbPlayerMatch;
      });
      console.log(`After LB Player filter: ${filtered.length} players`);
    }

    // Apply age filters if present
    const minAge = filters.minAge ? parseInt(filters.minAge, 10) : undefined;
    const maxAge = filters.maxAge ? parseInt(filters.maxAge, 10) : undefined;

    if (minAge !== undefined || maxAge !== undefined) {
      console.log(`Applying age filter: min=${minAge}, max=${maxAge}`);
      filtered = filtered.filter((player) => {
        const age =
          typeof player.age === "string"
            ? parseInt(player.age, 10)
            : player.age;
        if (typeof age !== "number" || isNaN(age)) {
          console.log(
            `Player rejected by age filter (invalid age): ${player.name}, age: ${player.age}`
          );
          return false;
        }
        const meetsMin = minAge === undefined || isNaN(minAge) || age >= minAge;
        const meetsMax = maxAge === undefined || isNaN(maxAge) || age <= maxAge;
        if (!meetsMin || !meetsMax) {
          console.log(
            `Player rejected by age filter: ${player.name}, age: ${age}, meets min: ${meetsMin}, meets max: ${meetsMax}`
          );
        }
        return meetsMin && meetsMax;
      });
      console.log(`After age filter: ${filtered.length} players`);
    }

    // Apply market value filter if present
    const minValue = filters.minValue
      ? parseFloat(filters.minValue)
      : undefined;
    const maxValue = filters.maxValue
      ? parseFloat(filters.maxValue)
      : undefined;

    if (minValue !== undefined || maxValue !== undefined) {
      console.log(
        `Applying market value filter: min=${minValue}, max=${maxValue}`
      );
      filtered = filtered.filter((player) => {
        const value = player.marketValueNumber;
        if (value === undefined || value === null) {
          console.log(
            `Player rejected by market value filter (no value): ${player.name}, market value: ${player.marketValue}`
          );
          return false;
        }
        const meetsMin =
          minValue === undefined || isNaN(minValue) || value >= minValue;
        const meetsMax =
          maxValue === undefined || isNaN(maxValue) || value <= maxValue;
        if (!meetsMin || !meetsMax) {
          console.log(
            `Player rejected by market value filter: ${player.name}, value: ${value}, meets min: ${meetsMin}, meets max: ${meetsMax}`
          );
        }
        return meetsMin && meetsMax;
      });
      console.log(`After market value filter: ${filtered.length} players`);
    }

    console.log(`Final filtered results: ${filtered.length} players`);
    if (filtered.length > 0) {
      console.log(
        "Sample of filtered players:",
        filtered.slice(0, 3).map((p) => p.name)
      );
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
    console.log("=== FILTER SUBMISSION STARTED ===");
    console.log("Filters received:", newFilters);
    setLoading(true);
    setError(null);

    try {
      console.log(`Applying filters to ${allPlayers.length} players...`);
      // Apply filters to all players
      const filtered = applyFilters(newFilters);
      console.log(
        `Filter result: ${filtered.length} players match the criteria`
      );

      setFilteredPlayers(filtered);

      // Reset pagination
      setCurrentPage(1);
      console.log("Reset pagination to page 1");

      // Show first page of results
      const displayPlayers = filtered.slice(0, PLAYERS_PER_PAGE);
      console.log(
        `Setting displayed players: ${displayPlayers.length} players (page 1)`
      );
      setDisplayedPlayers(displayPlayers);

      // Mark that a search has been performed
      setHasSearched(true);
      console.log("Search marked as performed");

      if (filtered.length === 0) {
        console.log("No matching players found, setting error message");
        setError("No players found matching your criteria.");
      }
    } catch (error) {
      console.error("Error applying filters:", error);
      setError("Error filtering player data. Please try again.");
    } finally {
      console.log("Filter submission process completed");
      setLoading(false);
    }
  };

  return (
    <MainLayout title="LB Sports Management" serverStatus={apiStatus}>
      <div className="dashboard">
        <div className="header-container hide-on-mobile">
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
          </div>
        </div>

        <PlayerFilter
          onSubmit={handleSubmit}
          loading={loading}
          availablePositions={availablePositions}
        />

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
            <PlayerTable
              players={displayedPlayers.map((player) => {
                const citizenship = Array.isArray(player.citizenship)
                  ? player.citizenship
                  : typeof player.nationality === "string"
                  ? player.nationality
                      .split("/")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : Array.isArray(player.nationality)
                  ? player.nationality
                  : [];
                return {
                  ...player,
                  citizenship,
                  nationality: citizenship[0] || "",
                  placeOfBirth: player.placeOfBirth
                    ? {
                        city: player.placeOfBirth.city || "",
                        country: player.placeOfBirth.country || "",
                      }
                    : { city: "", country: "" },
                };
              })}
              loading={loading}
            />

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
