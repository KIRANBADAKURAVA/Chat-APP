import React from 'react';

import logoImage from "../assets/Chat-APP-logo-nobg.png";

function Logo({ width = '120px', height = 'auto', className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logoImage} 
        alt="Chat App Logo" 
        style={{ 
          width, 
          height,
          transform: 'perspective(1000px) rotateY(5deg) rotateX(5deg)',
        }}
        className="object-contain"
      />
    </div>
  );
}

export default Logo;