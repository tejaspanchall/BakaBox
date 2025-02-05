import React from 'react';
import styles from './LiveWebsites.module.css';
import Header from '../header/Header';

const LiveWebsites = () => {
  const websiteList = [
    {
      id: 1,
      name: 'Miruro',
      url: 'https://www.miruro.tv/',
      logo: 'assets/websites/miruro.jpeg'
    },
    {
      id: 2,
      name: 'AniTaku (Gogo Anime)',
      url: 'https://anitaku.io/',
      logo: 'assets/websites/gogo.png'
    },
    {
      id: 3,
      name: 'HIDIVE',
      url: 'https://www.hidive.com',
      logo: '/api/placeholder/48/48'
    },
    {
      id: 4,
      name: 'VRV',
      url: 'https://vrv.co',
      logo: '/api/placeholder/48/48'
    },
    {
      id: 5,
      name: 'Netflix Anime',
      url: 'https://www.netflix.com/browse/genre/7424',
      logo: '/api/placeholder/48/48'
    }
  ];

  return (
    <div>
    <Header />
    <div className={styles.container}>
      <div className={styles.grid}>
        {websiteList.map((website) => (
          <a
            key={website.id}
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <div className={styles.cardContent}>
              <img
                src={website.logo}
                alt={`${website.name} logo`}
                className={styles.logo}
              />
              <div className={styles.websiteInfo}>
                <h2 className={styles.websiteName}>{website.name}</h2>
                <span className={styles.visitText}>Visit Site →</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
    </div>
  );
};

export default LiveWebsites;