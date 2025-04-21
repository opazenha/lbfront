"use client";

import React, { useMemo, useState } from "react";
import CopyToClipboard from "../../register/components/shared/CopyToClipboard";
import "./PlayerTable.css";
import { PlayerTableProps, SortDirection, SortField } from "./types";

import Image from 'next/image';
import { Player } from "./types";
import { deletePlayerProfile } from "../services/api";

const mapPlayerForClipboard = (player: Player) => ({
  id: player.id,
  name: player.name,
  transfermarktUrl: player.transfermarktUrl || "",
  notes: player.notes || "",
  youtubeUrl: player.youtubeUrl || "",
  partnerId: player.partnerId || "",
  age: typeof player.age === 'number' ? player.age : (typeof player.age === 'string' ? parseInt(player.age, 10) || undefined : undefined),
  mainPosition: player.position,
  otherPosition: player.otherPosition,
  height: player.height || "",
  citizenship: player.citizenship,
  contractExpires: player.contractExpires || "",
  club: player.club,
  imageUrl: player.imageUrl || "",
});

const PlayerTable = ({ players, loading }: PlayerTableProps) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Default to ascending for new sort field
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return;
    const success = await deletePlayerProfile(id);
    if (success) {
      window.location.reload();
    } else {
      alert("Failed to delete player.");
    }
  };

  const sortedPlayers = useMemo(() => {
    if (!players || players.length === 0) return [];

    return [...players].sort((a, b) => {
      // Handle special case for marketValueNumber
      if (sortField === "marketValue") {
        const aVal = a.marketValueNumber || 0;
        const bVal = b.marketValueNumber || 0;
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      // For other fields
      let aVal: string | number = '', bVal: string | number = '';
      if (sortField === "nationality") {
        aVal = Array.isArray(a.citizenship) && a.citizenship[0] ? a.citizenship[0] : '';
        bVal = Array.isArray(b.citizenship) && b.citizenship[0] ? b.citizenship[0] : '';
      } else {
        aVal = (a[sortField] !== undefined && a[sortField] !== null) ? a[sortField] as string | number : (typeof a[sortField] === 'number' ? 0 : '');
        bVal = (b[sortField] !== undefined && b[sortField] !== null) ? b[sortField] as string | number : (typeof b[sortField] === 'number' ? 0 : '');
      }

      // Handle string comparison
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle numeric comparison
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [players, sortField, sortDirection]);

  // Helper function to render player image or placeholder
  const renderPlayerImage = (player: Player) => {
    if (player.imageUrl) {
      return (
        <Image src={player.imageUrl} alt={player.name} className="player-image" width={40} height={40} />
      );
    } else {
      // Create placeholder with first letter of name
      const initial = player.name.charAt(0).toUpperCase();
      return <div className="player-image-placeholder">{initial}</div>;
    }
  };

  // Helper function to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return (
      <span className="sort-indicator">
        {sortDirection === "asc" ? "↑" : "↓"}
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
    <div className="player-table-wrapper">
      <table className="player-table">
        <thead className="desktop-only">
          <tr>
            <th onClick={() => handleSort("name")}>
              Player {renderSortIndicator("name")}
            </th>
            <th onClick={() => handleSort("age")}>
              Age {renderSortIndicator("age")}
            </th>
            <th onClick={() => handleSort("position")}>
              Position {renderSortIndicator("position")}
            </th>
            <th onClick={() => handleSort("nationality")}>
              Citizenship {renderSortIndicator("nationality")}
            </th>
            <th onClick={() => handleSort("club")}>
              Club {renderSortIndicator("club")}
            </th>
            <th onClick={() => handleSort("marketValue")}>
              Market Value {renderSortIndicator("marketValue")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* MOBILE: 2 players per row */}
          {[...Array(Math.ceil(sortedPlayers.length / 2))].map((_, rowIdx) => (
            <tr className="mobile-only" key={`mobile-row-${rowIdx}`}>
    {[0, 1].map(colIdx => {
      const player = sortedPlayers[rowIdx * 2 + colIdx];
      if (!player) return <td key={`empty-${colIdx}`} className="mobile-player-info" colSpan={1}></td>;
      return (
        <td className="mobile-player-info" colSpan={1} key={player.id}>
  <div className="mobile-card-flex">

          <div className="mobile-row-1">
  <div className="mobile-player-name-block">
    {renderPlayerImage(player)}
    <span className="mobile-player-name-text">{player.name}</span>
    {player.isLbPlayer && <span className="lb-badge">LB</span>}
  </div>
  <div className="mobile-main-position-block">
    <div className="mobile-main-position">{player.position}</div>
    {Array.isArray(player.otherPosition) && player.otherPosition.length > 0 && (
      <div className="mobile-other-positions">
        {player.otherPosition.map((pos: string, i: number) => (
          <div className="mobile-other-position-entry" key={i}>{pos}</div>
        ))}
      </div>
    )}
  </div>
</div>
          <div className="mobile-row-2">
            <div className="mobile-age-block">
              <span className="mobile-label">Age:</span>
              <span className="mobile-value">{player.age}</span>
            </div>
            <div className="mobile-citizenship-block">
              <span className="mobile-label">From:</span>
              <span className="mobile-value">{Array.isArray(player.citizenship) && player.citizenship.length > 0 ? player.citizenship.join(", ") : player.nationality || ""}</span>
            </div>
            <div className="mobile-buttons-block">
              <span className="mobile-buttons">
                <a
                  href={player.transfermarktUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button view large-action-button"
                >
                  View
                </a>
                <button className="action-button delete large-action-button" onClick={() => handleDelete(player.id)}>Delete</button>
                <CopyToClipboard player={mapPlayerForClipboard(player)} className="action-button share large-action-button" />
              </span>
            </div>
          </div>
        </div>
      </td>
      );
    })}
  </tr>
))}
{/* DESKTOP: 1 player per row */}
{sortedPlayers.map((player: Player) => (
  <tr key={player.id + "-desktop"} className={player.isLbPlayer ? "lb-player desktop-only" : "desktop-only"}>
    <td className="player-name player-name-col">
      <div className="player-name-flex">
        {renderPlayerImage(player)}
        <span>
          {player.name}
          {player.isLbPlayer && <span className="lb-badge">LB</span>}
        </span>
      </div>
    </td>
    <td>{player.age}</td>
    <td>
      <span>{player.position}</span>
      {Array.isArray(player.otherPosition) && player.otherPosition.length > 0 && (
        <span className="player-other-positions">
          {player.otherPosition?.map((pos: string, i: number) => (
            <span key={i} className="player-other-position-entry">{pos}</span>
          ))}
        </span>
      )}
    </td>
    <td>
      {Array.isArray(player.citizenship) &&
      player.citizenship.length > 0
        ? player.citizenship.join(", ")
        : player.nationality || ""}
    </td>
    <td>{player.club || "N/A"}</td>
    <td className="market-value">{player.marketValue}</td>
    <td>
      <div className="action-buttons">
        <a
          href={player.transfermarktUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="action-button view"
        >
          View
        </a>
        <button className="action-button delete" onClick={() => handleDelete(player.id)}>Delete</button>
        {/* Share button replaced by CopyToClipboard */}
        <CopyToClipboard player={mapPlayerForClipboard(player)} />
      </div>
    </td>
  </tr>
))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
