import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Eye, TrendingUp, Globe, Calendar, RefreshCw, Facebook, Youtube, Twitter, Instagram, Search, MessageCircle } from "lucide-react";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface SourceStats {
  source: string;
  totalCount: number;
  todayCount: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  sourceStats: SourceStats[];
}

const sourceConfig: { [key: string]: { icon: React.ElementType; color: string; bgColor: string } } = {
  'جوجل': { icon: Search, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  'فيسبوك': { icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-600/10' },
  'تيك توك': { icon: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ), color: 'text-black dark:text-white', bgColor: 'bg-black/10 dark:bg-white/10' },
  'انستجرام': { icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  'تويتر / X': { icon: Twitter, color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
  'يوتيوب': { icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-600/10' },
  'سناب شات': { icon: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>
    </svg>
  ), color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  'واتساب': { icon: MessageCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  'مباشر': { icon: Globe, color: 'text-primary', bgColor: 'bg-primary/10' },
};

const DashboardVisitors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { onlineCount } = useRealtimePresence();
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    weekVisitors: 0,
    monthVisitors: 0,
    sourceStats: [],
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchStats();
    };
    checkAuth();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);

      // إجمالي الزوار
      const { data: allVisitors } = await supabase
        .from('page_views')
        .select('visitor_id, referrer_source, created_at');

      if (!allVisitors) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // حساب الزوار الفريدين
      const uniqueTotal = new Set(allVisitors.map(v => v.visitor_id));
      const uniqueToday = new Set(
        allVisitors
          .filter(v => new Date(v.created_at) >= today)
          .map(v => v.visitor_id)
      );
      const uniqueWeek = new Set(
        allVisitors
          .filter(v => new Date(v.created_at) >= weekAgo)
          .map(v => v.visitor_id)
      );
      const uniqueMonth = new Set(
        allVisitors
          .filter(v => new Date(v.created_at) >= monthAgo)
          .map(v => v.visitor_id)
      );

      // حساب إحصائيات المصادر
      const sourceCountsTotal: { [key: string]: number } = {};
      const sourceCountsToday: { [key: string]: number } = {};

      allVisitors.forEach(item => {
        const source = item.referrer_source || 'مباشر';
        sourceCountsTotal[source] = (sourceCountsTotal[source] || 0) + 1;
        
        if (new Date(item.created_at) >= today) {
          sourceCountsToday[source] = (sourceCountsToday[source] || 0) + 1;
        }
      });

      const sourceStats: SourceStats[] = Object.keys(sourceCountsTotal)
        .map(source => {
          const config = sourceConfig[source] || { icon: Globe, color: 'text-muted-foreground', bgColor: 'bg-muted' };
          return {
            source,
            totalCount: sourceCountsTotal[source],
            todayCount: sourceCountsToday[source] || 0,
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
          };
        })
        .sort((a, b) => b.totalCount - a.totalCount);

      setStats({
        totalVisitors: uniqueTotal.size,
        todayVisitors: uniqueToday.size,
        weekVisitors: uniqueWeek.size,
        monthVisitors: uniqueMonth.size,
        sourceStats,
      });

    } catch (error) {
      console.error('Error fetching visitor stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const mainStats = [
    {
      title: "إجمالي الزوار",
      value: stats.totalVisitors,
      icon: Users,
      description: "منذ بداية التتبع",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "زوار اليوم",
      value: stats.todayVisitors,
      icon: TrendingUp,
      description: "زوار اليوم فقط",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "متواجدون الآن",
      value: onlineCount,
      icon: Eye,
      description: "يتصفحون الموقع حالياً",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "زوار الأسبوع",
      value: stats.weekVisitors,
      icon: Calendar,
      description: "آخر 7 أيام",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "زوار الشهر",
      value: stats.monthVisitors,
      icon: Calendar,
      description: "آخر 30 يوم",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 hover:bg-accent rounded-md" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">تحليلات الزيارات</h1>
                <p className="text-muted-foreground text-sm">إحصائيات شاملة عن زوار الموقع ومصادر الزيارات</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* الإحصائيات الرئيسية */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {mainStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.title} className="relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bgColor} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50`} />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* إحصائيات المصادر */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    مصادر الزيارات
                  </CardTitle>
                  <CardDescription>
                    تفصيل الزيارات حسب المصدر مع مقارنة زيارات اليوم
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.sourceStats.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {stats.sourceStats.map((source) => {
                        const Icon = source.icon;
                        return (
                          <div
                            key={source.source}
                            className={`flex items-center gap-4 p-4 rounded-xl border ${source.bgColor} hover:shadow-md transition-all`}
                          >
                            <div className={`p-3 rounded-full ${source.bgColor}`}>
                              <Icon className={`h-6 w-6 ${source.color}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{source.source}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <div>
                                  <span className="text-2xl font-bold text-primary">{source.totalCount}</span>
                                  <span className="text-xs text-muted-foreground mr-1">إجمالي</span>
                                </div>
                                <div className="h-8 w-px bg-border" />
                                <div>
                                  <span className="text-xl font-bold text-green-500">{source.todayCount}</span>
                                  <span className="text-xs text-muted-foreground mr-1">اليوم</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>لا توجد بيانات زيارات حتى الآن</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardVisitors;
