import React from 'react';
import styles from './WhereToWatch.module.css';
import Header from '../header/Header';

const WhereToWatch = () => {
  const websiteList = [
    {
      id: 1,
      name: 'Miruro',
      url: 'https://www.miruro.tv/',
      logo: 'assets/websites/miruro.jpeg'
    },
    {
      id: 2,
      name: 'HiAnime',
      url: 'https://hianime.to/',
      logo: 'assets/websites/hi.png'
    },
    {
      id: 3,
      name: 'AniTaku (Gogo Anime)',
      url: 'https://anitaku.io/',
      logo: 'assets/websites/gogo.png'
    },
    {
      id: 4,
      name: 'animepahe',
      url: 'https://animepahe.ru/',
      logo: 'assets/websites/pahe.png'
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.container}>
        <div className={styles.list}>
          {websiteList.map((website) => (
            <a
              key={website.id}
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.listItem}
            >
              <img
                src={website.logo}
                alt={`${website.name} logo`}
                className={styles.logo}
              />
              <div className={styles.websiteInfo}>
                <h2 className={styles.websiteName}>{website.name}</h2>
                <p className={styles.websiteUrl}>{website.url}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className={styles.disclaimer}>
        <p>This list is for informational purposes only and is not intended as promotional content.</p>
      </div>
    </div>
  );
};

export default WhereToWatch;