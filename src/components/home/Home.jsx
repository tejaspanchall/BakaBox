import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();

  const cards = [
    {
      image: "/assets/home/Image2.jpg",
      route: "/Calender",
    },
    {
      image: "/assets/home/Image1.jpg",
      route: "/Chat",
    },
    {
      image: "/assets/home/Image2.jpg",
      route: "/Recommandation",
    },
    {
      image: "/assets/home/Image1.jpg",
      route: "/Tracking",
    },
    {
      image: "/assets/home/Image2.jpg",
      route: "/wallpapers",
    },
    {
      image: "/assets/home/Image1.jpg",
      route: "/websites",
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
      {/* <img src="/assets/logo.png" alt="BakaBox Logo" className={styles.logo} /> */}
        <h1 className={styles.title}>BakaBox</h1>
        <p className={styles.tagline}>Your home for everything about anime</p>
      </div>

      {/* Grid of Cards */}
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <div
            key={index} // Use index as the key
            onClick={() => navigate(card.route)}
            className={`${styles.card} ${styles.small}`}
          >
            <img src={card.image} alt="Card" className={styles.image} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;