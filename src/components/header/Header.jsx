import React, { useState } from 'react';

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
      <a 
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
        <img src="/logo.png" alt="Logo" className="w-56 h-auto mb-4" />
      </a>
    </div>
  );
};

export default Header;