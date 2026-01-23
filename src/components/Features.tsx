import { Activity, Target, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-Time Analytics",
    description: "Track your performance metrics in real-time with advanced analytics and insights."
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set personalized goals and monitor your progress with detailed milestone tracking."
  },
  {
    icon: TrendingUp,
    title: "Performance Growth",
    description: "Visualize your improvement over time with comprehensive performance data."
  },
  {
    icon: Users,
    title: "Expert Coaching",
    description: "Connect with certified coaches who understand your athletic journey."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-white text-4xl md:text-5xl mb-4">
            Built for Athletes
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Everything you need to track, analyze, and improve your athletic performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-white/5 to-white/0 border border-white/10 rounded-lg p-8 hover:border-white/20 transition-all hover:transform hover:scale-105"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-white text-xl mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
