import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { month: "Jan", performance: 65 },
  { month: "Feb", performance: 68 },
  { month: "Mar", performance: 72 },
  { month: "Apr", performance: 75 },
  { month: "May", performance: 80 },
  { month: "Jun", performance: 85 },
];

const stats = [
  { label: "Athletes Trained", value: "10,000+", change: "+25%" },
  { label: "Programs Completed", value: "50,000+", change: "+40%" },
  { label: "Avg. Improvement", value: "35%", change: "+12%" },
  { label: "Success Rate", value: "94%", change: "+8%" },
];

export function Metrics() {
  return (
    <section id="metrics" className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-white text-4xl md:text-5xl mb-4">
            Track Your Progress
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            See your improvement with detailed metrics and performance analytics
          </p>
        </div>
      </div>
    </section>
  );
}