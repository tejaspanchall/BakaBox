import React from 'react';
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
      name: 'AnimePahe',
      url: 'https://animepahe.ru/',
      logo: 'assets/websites/pahe.png'
    }
  ];

  return (
    <div className="m-0 p-0 box-border font-['Chivo',_sans-serif]">
      <Header />
      <div className="max-w-[800px] mx-auto p-8 sm:p-4">
        <div className="flex flex-col gap-4">
          {websiteList.map((website) => (
            <a
              key={website.id}
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-6 sm:gap-4 bg-white border border-[rgba(226,232,240,0.8)] rounded-2xl p-4 sm:p-3.5 text-decoration-none transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden hover:border-[rgba(59,130,246,0.4)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] hover:translate-x-1 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(59,130,246,0.05)] to-transparent opacity-0 transition-opacity duration-200 ease-linear group-hover:opacity-100"></div>
              
              <img
                src={website.logo}
                alt={`${website.name} logo`}
                className="w-14 h-14 sm:w-12 sm:h-12 rounded-xl object-cover flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-white p-1 border border-[rgba(226,232,240,0.8)]"
              />
              
              <div className="flex-grow min-w-0 pr-4">
                <h2 className="text-lg font-semibold text-[#1e293b] m-0 leading-[1.4] transition-colors duration-200 ease-linear group-hover:text-[#3b82f6]">
                  {website.name}
                </h2>
                <p className="text-sm text-[#64748b] mt-1 mb-0 overflow-hidden text-ellipsis whitespace-nowrap">
                  {website.url}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className="text-center mt-5 text-sm text-[#888]">
        <p>This list is for informational purposes only and is not intended as promotional content.</p>
      </div>
    </div>
  );
};

export default WhereToWatch;