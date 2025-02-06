import React, { useState } from 'react';
import styles from './Header.module.css';

const Header = () => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressStart = () => {
    setIsPressed(true);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
  };

  return (
    <div className={styles.header}>
      <a 
        href="/" 
        className={`${styles.logoLink} ${isPressed ? styles.pressed : ''}`}
        onMouseDown={handlePressStart} 
        onMouseUp={handlePressEnd} 
        onMouseLeave={handlePressEnd} 
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
      >
        <img src="/logo.png" alt="Logo" className={styles.logo} />
      </a>
    </div>
  );
};

export default Header;