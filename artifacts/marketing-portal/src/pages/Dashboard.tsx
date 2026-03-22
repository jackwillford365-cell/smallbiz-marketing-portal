import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui-elements";
import { useGetAnalytics } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PlayCircle, CheckCircle, Camera, Eye, Heart, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const { data: analytics, isLoading } = useGetAnalytics();

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!analytics) return <Layout title="Dashboard"><p>No data available.</p></Layout>;

  const pieColors = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#6b7280'];

  return (
    <Layout title="Dashboard">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard icon={<PlayCircle/>} label="Total Videos" value={analytics.totalVideos} />
        <StatCard icon={<CheckCircle/>} label="Published" value={analytics.publishedVideos} />
        <StatCard icon={<Camera/>} label="Upcoming Shoots" value={analytics.upcomingShoots} />
        <StatCard icon={<Eye/>} label="Total Views" value={analytics.totalViews.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-display font-semibold mb-6">Views by Month</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.viewsByMonth}>
                <XAxis dataKey="month" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#22c55e', opacity: 0.1}} 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                />
                <Bar dataKey="views" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-display font-semibold mb-6">Videos by Status</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {analytics.videosByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.videosByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {analytics.videosByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No status data.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="glass-panel hover-card-effect p-6 rounded-2xl flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-display font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}
