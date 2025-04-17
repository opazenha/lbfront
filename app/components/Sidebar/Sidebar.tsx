"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../Logo';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();
  const menuItems = [
    { name: 'Players', path: '/' },
    { name: 'Partners', path: '/partners' },
    { name: 'Register', path: '/register' },
  ];

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>  
      <div className={styles.sidebarHeader}>
        <div className={styles.logoContainer}>
          <Logo size={40} />
        </div>
        <button className={styles.toggleBtn} onClick={toggleSidebar}>
          {isOpen ? '←' : '→'}
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.navList}>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <li key={index} className={styles.navItem}>
                <Link href={item.path} className={styles.navLink}>
                  <span className={styles.navIcon}>•</span>
                  {isOpen && (
                    <span className={`${styles.navText} ${
                      isActive ? styles.activeText : ''
                    }`}>
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
