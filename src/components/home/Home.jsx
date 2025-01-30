import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import Header from '../header/Header';

const Home = () => {
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://animechan.io/api/v1/quotes/random');
        const data = await response.json();
        setQuote(data);
      } catch (error) {
        console.error('Error fetching quote:', error);
      }
    };

    fetchQuote();
  }, []);

  const cards = [
    { image: "/assets/home/Image2.jpg", route: "/Suggestion" },
    { image: "/assets/home/Image2.jpg", route: "/Calender" },
    { image: "/assets/home/Image1.jpg", route: "/Quotes" },
    { image: "/assets/home/Image1.jpg", route: "/Tracking" },
    { image: "/assets/home/Image2.jpg", route: "/wallpapers" },
    { image: "/assets/home/Image1.jpg", route: "/websites" }
  ];

  return (
    <div>
      <Header />
      {quote && (
        <div className={styles.quoteSection}>
          <p className={styles.quoteContent}>"{quote.quote}"</p>
          <p className={styles.quoteCharacter}>- {quote.character} ({quote.anime})</p>
        </div>
      )}
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