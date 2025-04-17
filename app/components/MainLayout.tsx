"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  serverStatus?: string;
}

const MainLayout = ({ children, title, serverStatus }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Header title={title} serverStatus={serverStatus} />
        <div className="content-container">
          {children}
        </div>
      </main>
      
      <style jsx>{`
        .layout {
          display: flex;
          min-height: 100vh;
          background-color: #0a0a0a;
        }
        
        .main-content {
          flex: 1;
          transition: margin-left 0.3s ease;
          background-color: #0a0a0a;
          background-image: url('/stadium-bg.svg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          position: relative;
        }
        
        .main-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 10, 10, 0.7);
          z-index: 0;
        }
        
        .sidebar-open {
          margin-left: 240px;
        }
        
        .sidebar-closed {
          margin-left: 60px;
        }
        
        .content-container {
          padding: 24px;
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
