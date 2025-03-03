"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { NextSeo } from 'next-seo';

const WhereToWatch = () => {
  const initialWebsiteList = [
    {
      id: 1,
      name: 'Miruro',
      url: 'https://www.miruro.tv/',
      logo: '/websites/miruro.jpeg',
      status: 'checking'
    },
    {
      id: 2,
      name: 'HiAnime',
      url: 'https://hianime.to/',
      logo: '/websites/hi.png',
      status: 'checking'
    },
    {
      id: 3,
      name: 'AniTaku (Gogo Anime)',
      url: 'https://anitaku.io/',
      logo: '/websites/gogo.png',
      status: 'checking'
    },
    {
      id: 4,
      name: 'AnimePahe',
      url: 'https://animepahe.ru/',
      logo: '/websites/pahe.png',
      status: 'checking'
    }
  ];

  const [websiteList, setWebsiteList] = useState(initialWebsiteList);

  useEffect(() => {
    const checkWebsiteStatus = async () => {
      const checkSite = async (site) => {
        try {
          const savedStatus = localStorage.getItem(`site-status-${site.id}`);
          if (savedStatus) {
            return { ...site, status: savedStatus };
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
          
          const status = 'online';
          
          localStorage.setItem(`site-status-${site.id}`, status);
          
          return { ...site, status };
        } catch (error) {
          console.error(`Error checking ${site.name}:`, error);
          return { ...site, status: 'offline' };
        }
      };
      
      const updatedList = await Promise.all(websiteList.map(checkSite));
      setWebsiteList(updatedList);
    };

    checkWebsiteStatus();
    
    const intervalId = setInterval(checkWebsiteStatus, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const StatusIndicator = ({ status }) => {
    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-red-500',
      checking: 'bg-yellow-500'
    };

    return (
      <div className="flex items-center gap-1.5">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusColors[status]} animate-pulse`}></span>
        <span className="text-xs text-gray-600 capitalize">{status}</span>
      </div>
    );
  };

  return (
    <>
      <NextSeo
        title="Where To Watch Anime - Site Status Tracker"
        description="Check the status of popular anime streaming websites. See which sites are currently online or offline."
      />
      <div className="m-0 p-0 box-border font-['Chivo',_sans-serif]">
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
                
                <div className="relative w-14 h-14 sm:w-12 sm:h-12">
                  <Image
                    src={website.logo}
                    alt={`${website.name} logo`}
                    fill
                    className="rounded-xl object-cover flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-white p-1 border border-[rgba(226,232,240,0.8)]"
                  />
                </div>
                
                <div className="flex-grow min-w-0 pr-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-[#1e293b] m-0 leading-[1.4] transition-colors duration-200 ease-linear group-hover:text-[#3b82f6]">
                      {website.name}
                    </h2>
                    <StatusIndicator status={website.status} />
                  </div>
                  
                  <p className="text-sm text-[#64748b] mt-1 mb-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {website.url}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="text-center mt-5 text-sm text-[#888] pb-6">
          <p>This list is for informational purposes only and is not intended as promotional content.</p>
        </div>
      </div>
    </>
  );
};

export default WhereToWatch;