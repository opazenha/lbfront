"use client";

import React from 'react';
import Image from 'next/image';
import { Player as PlayerType } from '../services/playerService';

// This interface is now redundant as we're using the imported type
interface LocalPlayer {
  id: string;
  name: string;
  age: number;
  position: string;
  nationality: string;
  club: string;
  marketValue: string;
  imageUrl?: string;
}

interface PlayerTableProps {
  players: PlayerType[];
  loading: boolean;
}

const PlayerTable = ({ players, loading }: PlayerTableProps) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading player data...</p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="empty-state">
        <p>No players found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="player-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Age</th>
            <th>Position</th>
            <th>Nationality</th>
            <th>Club</th>
            <th>Market Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id} className={player.isLbPlayer ? 'lb-player-row' : ''}>
              <td className="player-cell">
                <div className="player-info">
                  {player.imageUrl ? (
                    <Image 
                      src={player.imageUrl} 
                      alt={player.name} 
                      width={40} 
                      height={40} 
                      className="player-image"
                    />
                  ) : (
                    <div className="player-image-placeholder">
                      {player.name.charAt(0)}
                    </div>
                  )}
                  <span className="player-name">
                    {player.name}
                    {player.isLbPlayer && <span className="lb-badge">LB</span>}
                  </span>
                </div>
              </td>
              <td>{player.age}</td>
              <td>{player.position}</td>
              <td>{player.nationality}</td>
              <td>{player.club || 'N/A'}</td>
              <td className="market-value">{player.marketValue}</td>
              <td>
                <div className="action-buttons">
                  <button className="view-btn">View</button>
                  <button className="edit-btn">Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .table-container {
          background-color: #111;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .player-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        
        th {
          background-color: #1a1a1a;
          color: #f0c14b;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px solid #333;
        }
        
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #222;
          color: #ededed;
          font-size: 14px;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        tr:hover {
          background-color: #1a1a1a;
        }
        
        .player-cell {
          min-width: 200px;
        }
        
        .player-info {
          display: flex;
          align-items: center;
        }
        
        .player-image {
          border-radius: 50%;
          object-fit: cover;
          margin-right: 12px;
        }
        
        .player-image-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f0c14b;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0a;
          font-weight: bold;
          font-size: 16px;
        }
        
        .player-name {
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .lb-badge {
          background-color: #f0c14b;
          color: #0a0a0a;
          font-size: 10px;
          padding: 2px 4px;
          border-radius: 3px;
          font-weight: bold;
        }
        
        .lb-player-row {
          background-color: rgba(240, 193, 75, 0.05);
        }
        
        .market-value {
          font-weight: 600;
          color: #f0c14b;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        button {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .view-btn {
          background-color: #1a1a1a;
          border: 1px solid #333;
          color: #ededed;
        }
        
        .view-btn:hover {
          background-color: #222;
        }
        
        .edit-btn {
          background-color: #f0c14b;
          border: none;
          color: #0a0a0a;
        }
        
        .edit-btn:hover {
          background-color: #e0b13b;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background-color: #111;
          border-radius: 8px;
          color: #ededed;
          height: 300px;
          gap: 16px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(240, 193, 75, 0.3);
          border-radius: 50%;
          border-top-color: #f0c14b;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .empty-state {
          padding: 40px;
          text-align: center;
          background-color: #111;
          border-radius: 8px;
          color: #ededed;
        }
      `}</style>
    </div>
  );
};

export default PlayerTable;
