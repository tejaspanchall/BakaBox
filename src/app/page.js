'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const Home = () => {
  const router = useRouter();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      try {
        const cacheParam = `?cache=${new Date().toDateString()}`;
        
        const response = await fetch(`https://yurippe.vercel.app/api/quotes${cacheParam}`, {
          cache: 'force-cache',
          next: { revalidate: 86400 }
        });
        
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
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
    
  }, []);

  // 1000px x 377px
  const cards = [
    { image: "/home/Random.webp", route: "/random-anime" },
    { image: "/home/Calender.webp", route: "/calender" },
    { image: "/home/LifeOnAnime.webp", route: "/life-on-anime" },
    { image: "/home/Radio.webp", route: "/radio" },
    { image: "/home/Live.webp", route: "/where-to-watch" },
    { image: "/home/Trace.webp", route: "/trace-anime" },
    { image: "/home/Birthday.webp", route: "/birthday" },
    { image: "/home/Birthday.webp", route: "/love-calculator" }
  ];

  return (
    <div>
      <div className="text-center p-4 bg-white rounded-lg">
        {loading ? (
          <p className="text-lg text-gray-500">Loading quote...</p>
        ) : quote ? (
          <>
            <p className="text-lg italic text-gray-800">&ldquo;{quote.quote}&rdquo;</p>
            <p className="text-sm text-gray-600 mt-2">- {quote.character} ({quote.show})</p>
          </>
        ) : (
          <p className="text-lg text-gray-500">Quote not available</p>
        )}
      </div>
      <div className="p-4 bg-white h-full overflow-y-auto text-black">
        <div className="max-w-[1350px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 md:gap-1" style={{ gridAutoRows: '185px' }}>
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => router.push(card.route)}
              className="rounded-3xl p-3 cursor-pointer flex justify-center items-center transition-all duration-200 ease-in-out hover:opacity-90"
              style={{ transform: 'scale(1)' }}
            >
              <Image 
                src={card.image} 
                alt="Card" 
                width={1000}
                height={377}
                className="w-full h-full object-cover rounded-2xl border-black" 
                style={{ borderWidth: '3px' }}
              />
            </div>
          ))}
        </div>

        <footer className="text-center mt-10 py-8 px-4">
          <p className="text-xl text-gray-800 mb-4">Made by Baka, Made for Baka.</p>
          <div className="flex justify-center gap-2 mb-4">
            <a 
              href="https://instagram.com/tejasxpanchall" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-2 px-5 text-sm text-gray-100 bg-gray-900 rounded-lg no-underline font-bold hover:bg-gray-700 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
              </svg>
              Instagram
            </a>
            <a 
              href="https://twitter.com/tejaspanchall" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-2 px-5 text-sm text-gray-100 bg-gray-900 rounded-lg no-underline font-bold hover:bg-gray-700 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
              </svg>
              Twitter
            </a>
          </div>
          <Link 
            href="/privacy-policy" 
            className="block text-xs text-gray-700 no-underline hover:text-gray-900"
          >
            Privacy Policy
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default Home;