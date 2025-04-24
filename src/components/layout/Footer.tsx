
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-2">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="text-sm text-gray-500">
          Canvas: 4" x 6" (300dpi)
        </div>
        <div className="text-sm text-gray-500">
          <span className="mr-4">Grid: On</span>
          <span>Zoom: 100%</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
