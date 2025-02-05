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
        const response = await fetch(`https://yurippe.vercel.app/api/quotes?timestamp=${new Date().getTime()}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const quotes = await response.json();
        const shortQuotes = quotes.filter(q => q.quote.split(' ').length <= 35);

        if (shortQuotes.length > 0) {
          const randomIndex = Math.floor(Math.random() * shortQuotes.length);
          setQuote(shortQuotes[randomIndex]);
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
      }
    };

    fetchQuote();
  }, []);

  // 1000px x 377px
  const cards = [
    { image: "/assets/home/Random.jpg", route: "/random-anime" },
    { image: "/assets/home/Calender.jpg", route: "/calender" },
    { image: "/assets/home/LifeOnAnime.jpg", route: "/life-on-anime" },
    { image: "/assets/home/Image1.jpg", route: "/live-websites" },
    { image: "/assets/home/Image2.jpg", route: "/sub-vs-dub" },
    { image: "/assets/home/Image2.jpg", route: "/websites" },
    { image: "/assets/home/Image1.jpg", route: "/websites" },
    { image: "/assets/home/Image2.jpg", route: "/websites" }
    
  ];

  return (
    <div>
      <Header />
      {quote && (
        <div className={styles.quoteSection}>
          <p className={styles.quoteContent}>"{quote.quote}"</p>
          <p className={styles.quoteCharacter}>- {quote.character} ({quote.show})</p>
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
            <a href="https://buymeacoffee.com/bakabox" target="_blank" rel="noopener noreferrer" className={styles.button}>&#x2615; Buy Me a Coffee</a>
          </div>
          <a href="/privacy-policy" className={styles.privacy}>Privacy Policy</a>
        </footer>
      </div>
    </div>
  );
};

export default Home;