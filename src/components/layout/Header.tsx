
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Printer, Save, Settings, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-8 w-8 bg-designer-primary rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 1a1 1 0 10-2 0v6a1 1 0 102 0V6zm-5 1a1 1 0 00-2 0v6a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-semibold text-xl text-designer-dark">PrintEasy</span>
          </Link>
          
          <nav className="ml-8 hidden md:flex space-x-1">
            <Button variant="ghost" className="text-gray-600" asChild>
              <Link to="/templates">Templates</Link>
            </Button>
            <Button variant="ghost" className="text-gray-600" asChild>
              <Link to="/designer">Designer</Link>
            </Button>
            <Button variant="ghost" className="text-gray-600" asChild>
              <Link to="/data">Data</Link>
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
