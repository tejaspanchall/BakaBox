'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressStart = () => {
    setIsPressed(true);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
  };

  return (
    <div className="text-center mt-8 mb-4">
      <Link 
        href="/" 
        className="inline-block cursor-pointer"
        style={{ 
          transition: 'transform 0.15s ease-in-out',
          WebkitTapHighlightColor: 'transparent',
          transform: isPressed ? 'scale(0.95)' : 'scale(1)'
        }}
        onMouseDown={handlePressStart} 
        onMouseUp={handlePressEnd} 
        onMouseLeave={handlePressEnd} 
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
      >
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={224} 
          height={80} 
          className="mb-4"
          priority
        />
      </Link>
    </div>
  );
};

export default Header;