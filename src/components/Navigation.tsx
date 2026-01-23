import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "figma:asset/77156f911092fcfd68f4fc3bdb99d1157f1b817d.png";

export function Navigation({ onAuthClick }: { onAuthClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={logo} alt="Authentikos Athletix Club" className="h-10" />
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#programs" className="text-gray-300 hover:text-white transition-colors">
                Programs
              </a>
              <a href="#metrics" className="text-gray-300 hover:text-white transition-colors">
                Metrics
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
                Testimonials
              </a>
              <button 
                onClick={onAuthClick}
                className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#features" className="text-gray-300 hover:text-white block px-3 py-2">
              Features
            </a>
            <a href="#programs" className="text-gray-300 hover:text-white block px-3 py-2">
              Programs
            </a>
            <a href="#metrics" className="text-gray-300 hover:text-white block px-3 py-2">
              Metrics
            </a>
            <a href="#testimonials" className="text-gray-300 hover:text-white block px-3 py-2">
              Testimonials
            </a>
            <button 
              onClick={onAuthClick}
              className="bg-white text-black px-6 py-2 rounded w-full mt-2"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}