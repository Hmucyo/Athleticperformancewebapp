import { ArrowRight } from "lucide-react";

export function CTA({ onAuthClick }: { onAuthClick: () => void }) {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
      </div>
      
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white mb-4">AUTHENTIC FITNESS & SPORTS PERFORMANCE</h3>
            <p className="text-gray-400 text-sm">
              Elevating athletic performance through data-driven training.
            </p>
          </div>
          <div>
            <h4 className="text-white mb-4">Programs</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Bootcamp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">One-on-One Training</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Athletix Club</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Drop In Session</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Coaches</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li>
                <a 
                  href="/admin" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/admin');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="hover:text-white transition-colors opacity-50 hover:opacity-100"
                >
                  Admin
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm py-6 border-t border-white/10">
          © 2025 Authentic Fitness & Sports Performance. All rights reserved.
        </div>
      </footer>
    </section>
  );
}