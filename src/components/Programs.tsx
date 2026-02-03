import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, Users, Award, DollarSign, MapPin } from "lucide-react";
import { projectId } from "../utils/supabase/info";

export function Programs() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/programs/public`;
      console.log('Fetching programs from:', url);
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Programs data:', data);
        setPrograms(data.programs || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch programs:', response.status, errorText);
      }
    } catch (error) {
      console.error('Fetch programs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (value: string, type: 'delivery' | 'format' | 'category') => {
    const labels = {
      delivery: { 'in-person': 'In Person', 'online': 'Online' },
      format: { 'individual': 'Individual', 'group': 'Group' },
      category: { 'sport-performance': 'Sport Performance', 'fitness-wellness': 'Fitness & Wellness' }
    };
    return labels[type][value as keyof typeof labels[typeof type]] || value;
  };

  const getPlaceholderGradient = (category: string) => {
    if (category === 'sport-performance') {
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else {
      return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    }
  };

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

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading programs...</div>
        ) : programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all group"
              >
                <div className="relative h-64 overflow-hidden">
                  {program.imageUrl ? (
                    <ImageWithFallback
                      src={program.imageUrl}
                      alt={program.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{background: getPlaceholderGradient(program.category)}}
                    >
                      <h3 className="text-white text-2xl font-bold text-center px-4">
                        {program.name}
                      </h3>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-white text-2xl mb-3">{program.name}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-3">{program.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {getCategoryLabel(program.delivery, 'delivery')}
                    </span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      {getCategoryLabel(program.format, 'format')}
                    </span>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                      {getCategoryLabel(program.category, 'category')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-6 text-sm text-gray-400">
                    {program.duration && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{program.duration}</span>
                      </div>
                    )}
                    {program.coachName && (
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{program.coachName}</span>
                      </div>
                    )}
                    {program.price && (
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span>${program.price}</span>
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full bg-white text-black py-3 rounded hover:bg-gray-200 transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p>No programs available at the moment.</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}