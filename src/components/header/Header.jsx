import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <div className={styles.header}>
      <a href="/" className={styles.logoLink}>
        <img src="/logo.png" alt="Logo" className={styles.logo} />
      </a>
    </div>
  );
};

export default Header;
