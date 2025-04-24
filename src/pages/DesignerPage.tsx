
import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Canvas from '../components/designer/Canvas';
import Footer from '../components/layout/Footer';

const DesignerPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-hidden">
          <Canvas width={600} height={400} showGrid={true} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DesignerPage;
