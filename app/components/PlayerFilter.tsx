"use client";

import React, { FormEvent } from 'react';

interface PlayerFilterProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

const PlayerFilter = ({ onSubmit, loading }: PlayerFilterProps) => {
  const positions = [
    { id: "Goalkeeper", name: "Goalkeeper" },
    { id: "Right-Back", name: "Right-Back" },
    { id: "Left-Back", name: "Left-Back" },
    { id: "Center-Back", name: "Center-Back" },
    { id: "Central Back", name: "Central Back" },
    { id: "Defensive Midfielder", name: "Defensive Midfielder" },
    { id: "Central Midfielder", name: "Central Midfielder" },
    { id: "Attacking Midfielder", name: "Attacking Midfielder" },
    { id: "Right Winger", name: "Right Winger" },
    { id: "Left Winger", name: "Left Winger" },
    { id: "Second Striker", name: "Second Striker" },
    { id: "Striker", name: "Striker" },
  ];

  return (
    <div className="filter-container">
      <h2>Player Filter</h2>
      
      <form onSubmit={onSubmit}>
        <div className="filter-grid">
          <div className="filter-group">
            <label htmlFor="name">Player Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Enter player name"
            />
          </div>
          
          <div className="filter-group">
            <label>Age Range</label>
            <div className="input-flex">
              <input 
                type="number" 
                name="minAge" 
                placeholder="Min age" 
                min="15" 
                max="45"
              />
              <input 
                type="number" 
                name="maxAge" 
                placeholder="Max age" 
                min="15" 
                max="45"
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label htmlFor="position">Position</label>
            <select id="position" name="position">
              <option value="">All Positions</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="club">Current Club</label>
            <input 
              type="text" 
              id="club" 
              name="club" 
              placeholder="Enter club name"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="nationality">Nationality</label>
            <input 
              type="text" 
              id="nationality" 
              name="nationality" 
              placeholder="Enter nationality"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="marketValue">Market Value</label>
            <div className="input-flex">
              <input 
                type="number" 
                name="minValue" 
                placeholder="Min value (€)" 
              />
              <input 
                type="number" 
                name="maxValue" 
                placeholder="Max value (€)" 
              />
            </div>
          </div>
        </div>
        
        <div className="filter-actions">
          <button type="reset" className="reset-btn">Reset</button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
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
          content: '';
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
        
        input, select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background-color: rgba(26, 26, 26, 0.8);
          color: var(--foreground);
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        input:focus, select:focus {
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
