"use client";

import React from "react";
import { PartnerTableProps } from "./types";
import "../PlayerTable/styles.css";

const PartnerTable: React.FC<PartnerTableProps> = ({ partners, loading }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        Loading partners...
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return <div className="empty-state">No partners found.</div>;
  }

  return (
    <table className="player-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Notes</th>
          <th>Link</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {partners.map((p, index) => (
          <tr key={index}>
            <td>{p.name}</td>
            <td>{p.notes || '-'}</td>
            <td>
              {p.transfermarktUrl ? (
                <a
  href={p.transfermarktUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="action-button view"
>
  View
</a>
              ) : (
                '-'
              )}
            </td>
            <td>{new Date(p.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PartnerTable;
