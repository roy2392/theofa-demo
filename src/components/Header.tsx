import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="bg-[#128c7e] text-white shadow-sm" style={{boxShadow: '0 1px 1px rgba(0,0,0,0.1)'}}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
              <img 
                src="/logo-kisheri.png" 
                alt="קישרי תעופה" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-normal text-white leading-tight">קישרי תעופה</h1>
              <p className="text-xs text-white/80 leading-tight">עוזר הנסיעות החכם שלך</p>
            </div>
          </div>
          
          {!isHome && (
            <Link 
              to="/" 
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <ArrowRight size={16} />
              <span className="text-sm">חזרה</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};