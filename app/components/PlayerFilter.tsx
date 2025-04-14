"use client";

import React, { FormEvent, useState } from "react";

interface PlayerFilterProps {
  onSubmit: (filters: Record<string, string>) => void;
  loading: boolean;
  availablePositions?: string[];
}

const PlayerFilter = ({ onSubmit, loading, availablePositions = [] }: PlayerFilterProps) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [nationality, setNationality] = useState('');
  const [club, setClub] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [isLbPlayer, setIsLbPlayer] = useState(false);
  
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Create filters object directly from state
    const filters: Record<string, string> = {};
    
    if (name) filters.name = name;
    if (position) filters.position = position;
    if (nationality) filters.nationality = nationality;
    if (club) filters.club = club;
    if (minAge) filters.minAge = minAge;
    if (maxAge) filters.maxAge = maxAge;
    
    // Add market value filters
    if (minValue) filters.minValue = minValue;
    if (maxValue) filters.maxValue = maxValue;
    
    // Add LB player filter
    if (isLbPlayer) {
      filters.isLbPlayer = 'true';
    }
    
    console.log('Submitting filters:', filters);
    console.log('Selected position ID:', position);
    console.log('Filter for LB players:', isLbPlayer);
    
    // Call the parent's onSubmit with the filters
    onSubmit(filters);
  };


  return (
    <div className="filter-container">
      <h2>Player Filter</h2>

      <form onSubmit={handleFormSubmit}>
        <div className="filter-grid">
          <div className="filter-group">
            <label htmlFor="name">Player Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by name (partial matches)"
            />
          </div>

          <div className="filter-group">
            <label>Age Range</label>
            <div className="input-flex">
              <input
                type="number"
                id="minAge"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                placeholder="Min age"
                min="15"
                max="45"
              />
              <input
                type="number"
                id="maxAge"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                placeholder="Max age"
                min="15"
                max="45"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="position">Position</label>
            <select 
              id="position" 
              value={position}
              onChange={(e) => {
                console.log('Position selected:', e.target.value);
                setPosition(e.target.value);
              }}
            >
              <option value="">All Positions</option>
              {availablePositions.map((position) => (
                <option 
                  key={position} 
                  value={position}
                >
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="club">Current Club</label>
            <input
              type="text"
              id="club"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              placeholder="Enter club name"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="nationality">Nationality</label>
            <input
              type="text"
              id="nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="Enter nationality"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="marketValue">Market Value</label>
            <div className="input-flex">
              <input
                type="number"
                id="minValue"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="Min value (€)"
                min="0"
              />
              <input
                type="number"
                id="maxValue"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="Max value (€)"
                min="0"
              />
            </div>
          </div>
          
          {/* LB Player filter */}
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isLbPlayer}
                onChange={(e) => setIsLbPlayer(e.target.checked)}
              />
              <span>LB Players only</span>
            </label>
          </div>
        </div>

        <div className="filter-actions">
          <button 
            type="button" 
            className="reset-btn"
            onClick={() => {
              setName('');
              setPosition('');
              setNationality('');
              setClub('');
              setMinAge('');
              setMaxAge('');
              setMinValue('');
              setMaxValue('');
              setIsLbPlayer(false);
            }}
          >
            Reset
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .filter-container {
          background-color: var(--card-bg);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border);
        }

        h2 {
          color: var(--primary);
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        h2:before {
          content: "";
          display: inline-block;
          width: 4px;
          height: 18px;
          background-color: var(--primary);
          border-radius: 2px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .filter-group {
          margin-bottom: 8px;
        }

        label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          color: #ededed;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
          cursor: pointer;
        }

        input,
        select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background-color: rgba(26, 26, 26, 0.8);
          color: var(--foreground);
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 1px var(--primary);
        }

        input::placeholder {
          color: #666;
        }

        .input-flex {
          display: flex;
          gap: 8px;
        }

        .filter-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        button {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .reset-btn {
          background-color: transparent;
          border: 1px solid #333;
          color: #ededed;
        }

        .reset-btn:hover {
          background-color: #222;
        }

        .submit-btn {
          background-color: var(--primary);
          border: none;
          color: #0a0a0a;
        }

        .submit-btn:hover {
          background-color: #e0b13b;
        }

        .submit-btn:disabled {
          background-color: #f0c14b;
          border: none;
          color: #0a0a0a;
        }

        .submit-btn:hover {
          background-color: #e0b13b;
        }

        .submit-btn:disabled {
          background-color: #666;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PlayerFilter;
