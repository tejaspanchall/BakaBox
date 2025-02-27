import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    { image: "/assets/home/Radio.jpg", route: "/radio" },
    { image: "/assets/home/Live.jpg", route: "/where-to-watch" }
  ];

  return (
    <div style={{ fontFamily: 'Chivo, sans-serif' }}>
      <Header />
      {quote && (
        <div className="text-center p-4 bg-white rounded-lg">
          <p className="text-lg italic text-gray-800">"{quote.quote}"</p>
          <p className="text-sm text-gray-600 mt-2">- {quote.character} ({quote.show})</p>
        </div>
      )}
      <div className="p-4 bg-white h-full overflow-y-auto text-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1" style={{ gridAutoRows: '185px' }}>
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.route)}
              className="rounded-3xl p-3 cursor-pointer flex justify-center items-center transition-all duration-200 ease-in-out hover:opacity-90"
              style={{ transform: 'scale(1)', ':hover': { transform: 'scale(1.02)' } }}
            >
              <img 
                src={card.image} 
                alt="Card" 
                className="w-full h-full object-cover rounded-2xl border-black" 
                style={{ borderWidth: '3px' }}
              />
            </div>
          ))}
        </div>

        <footer className="text-center mt-10 py-8 px-4">
          <p className="text-xl text-gray-800 mb-4">Made by Baka, Made for Baka.</p>
          <div className="flex justify-center gap-4 mb-4">
            <a 
              href="https://buymeacoffee.com/bakabox" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-2 px-5 text-sm text-gray-100 bg-gray-900 rounded-lg no-underline font-bold hover:bg-gray-700"
            >
              ☕ Buy Me a Coffee
            </a>
          </div>
          <a 
            href="/privacy-policy" 
            className="block text-xs text-gray-700 no-underline hover:text-gray-900"
          >
            Privacy Policy
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Home;