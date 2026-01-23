import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ArrowRight } from "lucide-react";

export function Hero({ onAuthClick }: { onAuthClick: () => void }) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1761684887056-f76bdb852d89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwdHJhaW5pbmclMjBydW5uaW5nfGVufDF8fHx8MTc2MzkzMjc3NXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Athlete training"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-white text-5xl md:text-7xl mb-6 tracking-tight">
          TRAIN WITH
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            AUTHENTICITY & PURPOSE
          </span>
        </h1>
        <p className="text-gray-300 text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Science-backed training programs built on Human-First Excellence to elevate your performance
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onAuthClick}
            className="bg-white text-black px-8 py-4 rounded inline-flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            Start Your Journey <ArrowRight size={20} />
          </button>
        
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}