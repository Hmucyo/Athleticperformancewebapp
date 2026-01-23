import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcus Johnson",
    sport: "Track & Field",
    quote: "AFSP helped me shave 0.3 seconds off my 100m time. The data-driven approach made all the difference.",
    rating: 5
  },
  {
    name: "Sarah Chen",
    sport: "Basketball",
    quote: "The personalized training programs and expert coaching took my game to the next level. Highly recommend!",
    rating: 5
  },
  {
    name: "David Martinez",
    sport: "Football",
    quote: "I've tried many training programs, but AFSP stands out with its scientific approach and real results.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-white text-4xl md:text-5xl mb-4">
            Athlete Success Stories
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Hear from athletes who transformed their performance with AFSP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-lg p-8 hover:border-white/20 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} fill="#fbbf24" className="text-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
              
              <div className="border-t border-white/10 pt-4">
                <div className="text-white">{testimonial.name}</div>
                <div className="text-gray-500 text-sm">{testimonial.sport}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}