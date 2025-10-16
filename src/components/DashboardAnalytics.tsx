import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Eye, TrendingUp, Globe } from "lucide-react";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";

interface AnalyticsStats {
  totalVisitors: number;
  todayVisitors: number;
  topSources: { source: string; count: number }[];
}

export const DashboardAnalytics = () => {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    topSources: [],
  });
  const [loading, setLoading] = useState(true);
  const { onlineCount } = useRealtimePresence();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // إجمالي الزوار (unique visitors)
      const { data: allVisitors, error: visitorsError } = await supabase
        .from('page_views')
        .select('visitor_id');

      if (visitorsError) throw visitorsError;

      const uniqueVisitors = new Set(allVisitors?.map(v => v.visitor_id) || []);

      // زوار اليوم
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayData, error: todayError } = await supabase
        .from('page_views')
        .select('visitor_id')
        .gte('created_at', today.toISOString());

      if (todayError) throw todayError;

      const uniqueTodayVisitors = new Set(todayData?.map(v => v.visitor_id) || []);

      // أفضل مصادر الزيارة
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('page_views')
        .select('referrer_source');

      if (sourcesError) throw sourcesError;

      const sourceCounts: { [key: string]: number } = {};
      sourcesData?.forEach(item => {
        const source = item.referrer_source || 'مباشر';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      const topSources = Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalVisitors: uniqueVisitors.size,
        todayVisitors: uniqueTodayVisitors.size,
        topSources,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "إجمالي الزوار",
      value: stats.totalVisitors,
      icon: Users,
      description: "عدد الزوار الكلي",
      color: "text-blue-500",
    },
    {
      title: "زوار اليوم",
      value: stats.todayVisitors,
      icon: TrendingUp,
      description: "زوار اليوم فقط",
      color: "text-green-500",
    },
    {
      title: "متواجدون الآن",
      value: onlineCount,
      icon: Eye,
      description: "عدد المتواجدين حالياً",
      color: "text-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">إحصائيات الزيارات</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إحصائيات الزيارات</h2>
        <button
          onClick={fetchAnalytics}
          className="text-sm text-primary hover:underline"
        >
          تحديث
        </button>
      </div>

      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid gap-4 md:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* مصادر الزيارة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            أفضل مصادر الزيارة
          </CardTitle>
          <CardDescription>
            المصادر التي جاء منها أكبر عدد من الزوار
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topSources.length > 0 ? (
            <div className="space-y-3">
              {stats.topSources.map((source, index) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {source.count}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      زيارة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              لا توجد بيانات حتى الآن
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
