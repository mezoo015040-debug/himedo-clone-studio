import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";

interface Stats {
  total: number;
  new: number;
  completed: number;
  thisMonth: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    completed: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchStats();
    };

    const fetchStats = async () => {
      try {
        // Get all quotes
        const { data: allQuotes, error: allError } = await supabase
          .from("quotes")
          .select("*");

        if (allError) throw allError;

        // Get this month's quotes
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: monthQuotes, error: monthError } = await supabase
          .from("quotes")
          .select("*")
          .gte("created_at", startOfMonth.toISOString());

        if (monthError) throw monthError;

        setStats({
          total: allQuotes?.length || 0,
          new: allQuotes?.filter((q) => q.status === "new").length || 0,
          completed: allQuotes?.filter((q) => q.status === "completed").length || 0,
          thisMonth: monthQuotes?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const statsCards = [
    {
      title: "إجمالي الطلبات",
      value: stats.total,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "طلبات جديدة",
      value: stats.new,
      icon: Clock,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "طلبات مكتملة",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "طلبات هذا الشهر",
      value: stats.thisMonth,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-10">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold mr-4">لوحة التحكم</h1>
          </header>

          <main className="flex-1 p-6 bg-muted/30">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">مرحباً بك</h2>
                <p className="text-muted-foreground">
                  نظرة عامة على طلبات التأمين
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => (
                  <Card key={stat.title} className="transition-smooth hover:shadow-glow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>معلومات مهمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">عرض جميع الطلبات</h3>
                        <p className="text-sm text-muted-foreground">
                          انتقل إلى صفحة "طلبات الأسعار" لعرض جميع طلبات التأمين المقدمة من العملاء
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                      <TrendingUp className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">إحصائيات تفصيلية</h3>
                        <p className="text-sm text-muted-foreground">
                          تتبع أداء طلبات التأمين وتحليل البيانات لتحسين الخدمة
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* قسم إحصائيات الزيارات */}
              <DashboardAnalytics />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;