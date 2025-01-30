import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import Header from '../header/Header';

const Home = () => {
  const navigate = useNavigate();

  const cards = [
    { image: "/assets/home/Image2.jpg", route: "/Suggestion" },
    { image: "/assets/home/Image2.jpg", route: "/Calender" },
    { image: "/assets/home/Image1.jpg", route: "/Chat" },
    { image: "/assets/home/Image1.jpg", route: "/Tracking" },
    { image: "/assets/home/Image2.jpg", route: "/wallpapers" },
    { image: "/assets/home/Image1.jpg", route: "/websites" }
  ];

  return (
    <div>
      <Header />
      <div className={styles.container}>
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.route)}
            className={`${styles.card} ${styles.small}`}
          >
            <img src={card.image} alt="Card" className={styles.image} />
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>Made by Baka, Made for Baka.</p>
        <div className={styles.buttons}>
          <a href="https://buymeacoffee.com/bakabox" target="_blank" className={styles.button}>Buy Me a Coffee</a>
        </div>
        <a href="/privacy-policy" className={styles.privacy}>Privacy Policy</a>
      </footer>
    </div>
    </div>
  );
};

export default Home;