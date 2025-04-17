"use client";


import Link from 'next/link';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Players', path: '/players' },
    { name: 'Register', path: '/register' },
    { name: 'Clients', path: '/clients' },
    { name: 'Transfers', path: '/transfers' },
    { name: 'Contacts', path: '/contacts' },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header sidebar-title">
        <div className="logo-container">
          <Logo size={isOpen ? 40 : 30} />
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isOpen ? '←' : '→'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link href={item.path} className="nav-link">
                <span className="nav-icon">•</span>
                {isOpen && <span className="nav-text">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <style jsx>{`
        .sidebar {
          background-color: #0a0a0a;
          height: 100vh;
          transition: width 0.3s ease;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }
        
        .open {
          width: 240px;
        }
        
        .closed {
          width: 60px;
        }
        
        .sidebar-header {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #222;
          height: 70px;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        
        .logo {
          object-fit: contain;
        }
        
        .toggle-btn {
          background: none;
          border: none;
          color: #f0c14b;
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .toggle-btn:hover {
          background-color: #222;
        }
        
        .sidebar-nav {
          padding: 16px 0;
          flex: 1;
          overflow-y: auto;
        }
        
        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          color: #ededed;
          text-decoration: none;
          transition: background-color 0.2s;
          white-space: nowrap;
        }
        
        .nav-link:hover {
          background-color: #222;
        }
        
        .nav-icon {
          margin-right: 12px;
          color: #f0c14b;
          font-size: 18px;
          min-width: 20px;
          text-align: center;
        }
        
        .nav-text {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
