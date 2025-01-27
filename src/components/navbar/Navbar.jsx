// Header.jsx
import React from 'react';
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <header className={styles.header}>
          <h1 className={styles.title}>BakaBox</h1>
        </header>
      );
};

export default Navbar;