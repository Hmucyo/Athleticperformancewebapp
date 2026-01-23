import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, Users, Award } from "lucide-react";

const programs = [
  {
    title: "Personal Training - Bootcamp",
    description: "High-energy group training for five or more participants in a fast-paced 45-minute full-body workout. Build strength, endurance, mobility, and flexibility with science-backed methods.",
    image: "https://images.unsplash.com/photo-1589451431369-f569890dfd84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwc3RyZW5ndGglMjB3b3Jrb3V0fGVufDF8fHx8MTc2MzkzMjc3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "45 Minutes",
    level: "All Levels",
    participants: "5+ Group"
  },
  {
    title: "Sports Performance: One-on-One",
    description: "Personalized speed and performance training with video analysis and technical drills. Develop force, power, explosiveness, and efficient sprint mechanics.",
    image: "https://images.unsplash.com/photo-1758798486129-01193b330307?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBwZXJmb3JtYW5jZSUyMGp1bXB8ZW58MXx8fHwxNzYzOTMyNzc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "4, 8, 12 Package",
    level: "All Levels",
    participants: "1-on-1"
  },
  {
    title: "Authentikos Athletix Club",
    description: "Comprehensive track & field program building strength, confidence, and discipline. Science-backed training and performance psychology for long-term athletic growth.",
    image: "https://images.unsplash.com/photo-1761684887056-f76bdb852d89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwdHJhaW5pbmclMjBydW5uaW5nfGVufDF8fHx8MTc2MzkzMjc3NXww&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "Seasonal",
    level: "All Athletes",
    participants: "Club"
  },
  {
    title: "Drop In Session",
    description: "High-impact athletic training session blending speed development, power training, movement mechanics, and conditioning to elevate performance.",
    image: "https://images.unsplash.com/photo-1759787851041-0d45d2b2db84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHRyYWluaW5nJTIwZ3ltfGVufDF8fHx8MTc2MzkzMjc3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    duration: "60-75 Minutes",
    level: "All Levels",
    participants: "Drop-in"
  }
];

export function Programs() {
  return (
    <section id="programs" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-white text-4xl md:text-5xl mb-4">
            Training Programs
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Choose from our scientifically-designed programs tailored to your goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all group"
            >
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-white text-2xl mb-3">{program.title}</h3>
                <p className="text-gray-400 mb-6">{program.description}</p>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award size={16} />
                    <span>{program.level}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{program.participants}</span>
                  </div>
                </div>
                
                <button className="w-full bg-white text-black py-3 rounded hover:bg-gray-200 transition-colors">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
