"use client";

import React, { useState, useMemo } from 'react';
import { PlayerTableProps, SortField, SortDirection } from './types';
import './styles.css';

const PlayerTable = ({ players, loading }: PlayerTableProps) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new sort field
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPlayers = useMemo(() => {
    if (!players || players.length === 0) return [];
    
    return [...players].sort((a, b) => {
      // Handle special case for marketValueNumber
      if (sortField === 'marketValue') {
        const aVal = a.marketValueNumber || 0;
        const bVal = b.marketValueNumber || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // For other fields
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      // Handle string comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      // Handle numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [players, sortField, sortDirection]);
  
  // Helper function to render player image or placeholder
  const renderPlayerImage = (player: any) => {
    if (player.imageUrl) {
      return <img src={player.imageUrl} alt={player.name} className="player-image" />
    } else {
      // Create placeholder with first letter of name
      const initial = player.name.charAt(0).toUpperCase();
      return <div className="player-image-placeholder">{initial}</div>
    }
  };
  
  // Helper function to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return (
      <span className="sort-indicator">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        Loading players...
      </div>
    );
  }

  if (!sortedPlayers || sortedPlayers.length === 0) {
    return (
      <div className="empty-state">
        No players found matching your criteria.
      </div>
    );
  }

  return (
    <table className="player-table">
      <thead>
        <tr>
          <th onClick={() => handleSort('name')}>
            Player {renderSortIndicator('name')}
          </th>
          <th onClick={() => handleSort('age')}>
            Age {renderSortIndicator('age')}
          </th>
          <th onClick={() => handleSort('position')}>
            Position {renderSortIndicator('position')}
          </th>
          <th onClick={() => handleSort('nationality')}>
            Nationality {renderSortIndicator('nationality')}
          </th>
          <th onClick={() => handleSort('club')}>
            Club {renderSortIndicator('club')}
          </th>
          <th onClick={() => handleSort('marketValue')}>
            Market Value {renderSortIndicator('marketValue')}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedPlayers.map((player) => (
          <tr
            key={player.id}
            className={player.isLbPlayer ? 'lb-player' : ''}
          >
            <td className="player-name">
              {renderPlayerImage(player)}
              <span>
                {player.name}
                {player.isLbPlayer && <span className="lb-badge">LB</span>}
              </span>
            </td>
            <td>{player.age}</td>
            <td>{player.position}</td>
            <td>{player.nationality}</td>
            <td>{player.club || 'N/A'}</td>
            <td className="market-value">{player.marketValue}</td>
            <td>
              <div className="action-buttons">
                <button className="action-button view">View</button>
                <button className="action-button edit">Edit</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PlayerTable;
