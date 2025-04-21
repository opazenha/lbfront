"use client";

import React from 'react';

interface HeaderProps {
  title: string;
}

interface HeaderProps {
  title: string;
  serverStatus?: string;
}

const Header = ({ title, serverStatus }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header-flex">
        <h1 className="main-title">{title}</h1>
        {serverStatus && (
          <div className={`api-status ${serverStatus}`} style={{marginLeft: 'auto'}}>
            <span className="status-indicator"></span>
            <span className="status-text">
              {serverStatus === "connected"
                ? "Server Connected"
                : serverStatus === "disconnected"
                ? "Using Mock Data"
                : "Checking Server..."}
            </span>
          </div>
        )}
      </div>
      <style jsx>{`
        .header {
          background-color: #0a0a0a;
          padding: 16px 24px;
          border-bottom: 1px solid #222;
        }
        .header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .main-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #ffc107;
        }
        @media (max-width: 640px) {
          .header {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
