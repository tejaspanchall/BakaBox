import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Calender",
      description: "Learn how to tackle adversity, challenges and professional setbacks",
      rating: 4.1,
      progress: "12%",
      color: "rose",
      route: "/Calender",
      size: "large"
    },
    {
      title: "Chat",
      description: "Create a development plan that best fits your goals and sense of purpose",
      rating: 4.5,
      progress: "32%",
      color: "emerald",
      route: "/Chat",
      size: "small"
    },
    {
      title: "Recommandation",
      description: "Develop your sense of belonging and an active involvement in meaningful work",
      rating: 5.0,
      progress: "80%",
      color: "orange",
      route: "/engagement",
      size: "small"
    },
    {
      title: "Tracking",
      description: "Learn how to strategize and formulate your own professional goals",
      rating: 4.6,
      progress: "100%",
      color: "pink",
      route: "/Tracking",
      size: "medium"
    },
    {
      title: "Wallpapers",
      description: "Adapt your strategies to maximize personal and professional success",
      rating: 4.2,
      progress: "48%",
      color: "blue",
      route: "/wallpapers",
      size: "small"
    },
    {
      title: "Websites",
      description: "Gain confidence in your abilities and foment an empowered mindset",
      rating: 3.9,
      progress: "60%",
      color: "purple",
      route: "/websites",
      size: "small"
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.route)}
            className={`${styles.card} ${styles[card.size]} ${styles[card.color]}`}
          >
            <div className={styles.content}>
              <div>
                <div className={styles.label}>Organizational</div>
                <h2 className={styles.title}>{card.title}</h2>
                <p className={styles.description}>{card.description}</p>
              </div>
              
              <div className={styles.stats}>
                <div className={styles.rating}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{card.rating}</span>
                </div>
                <div className={styles.progress}>{card.progress}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;