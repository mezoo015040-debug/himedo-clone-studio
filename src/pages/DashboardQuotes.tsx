import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface Quote {
  id: string;
  full_name: string;
  phone: string;
  vehicle_type: string;
  vehicle_value: number;
  insurance_type: string;
  selected_company: string | null;
  price: number | null;
  status: string;
  created_at: string;
}

const DashboardQuotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchQuotes();
    };

    const fetchQuotes = async () => {
      try {
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setQuotes(data || []);
      } catch (error) {
        console.error("Error fetching quotes:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب البيانات",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("quotes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quotes",
        },
        () => {
          fetchQuotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, toast]);

  const updateQuoteStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح",
      });
    } catch (error) {
      console.error("Error updating quote:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحالة",
        variant: "destructive",
      });
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    if (filter === "all") return true;
    return quote.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      new: { variant: "default", label: "جديد" },
      processing: { variant: "secondary", label: "قيد المعالجة" },
      completed: { variant: "outline", label: "مكتمل" },
    };

    const config = variants[status] || variants.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-10">
            <SidebarTrigger className="p-2 hover:bg-accent rounded-md" />
            <h1 className="text-2xl font-bold mr-4">طلبات الأسعار</h1>
          </header>

          <main className="flex-1 p-6 bg-muted/30">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">جميع الطلبات</h2>
                  <p className="text-muted-foreground">
                    إجمالي {quotes.length} طلب
                  </p>
                </div>

                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الطلبات</SelectItem>
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="processing">قيد المعالجة</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>قائمة الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredQuotes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      لا توجد طلبات حالياً
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">الاسم</TableHead>
                            <TableHead className="text-right">الهاتف</TableHead>
                            <TableHead className="text-right">نوع المركبة</TableHead>
                            <TableHead className="text-right">قيمة المركبة</TableHead>
                            <TableHead className="text-right">نوع التأمين</TableHead>
                            <TableHead className="text-right">الشركة</TableHead>
                            <TableHead className="text-right">السعر</TableHead>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredQuotes.map((quote) => (
                            <TableRow key={quote.id}>
                              <TableCell className="font-medium">
                                {quote.full_name}
                              </TableCell>
                              <TableCell dir="ltr" className="text-left">
                                {quote.phone}
                              </TableCell>
                              <TableCell>{quote.vehicle_type}</TableCell>
                              <TableCell>
                                {quote.vehicle_value.toLocaleString("ar-SA")} ريال
                              </TableCell>
                              <TableCell>
                                {quote.insurance_type === "comprehensive"
                                  ? "شامل"
                                  : "ضد الغير"}
                              </TableCell>
                              <TableCell>
                                {quote.selected_company || "-"}
                              </TableCell>
                              <TableCell>
                                {quote.price
                                  ? `${quote.price.toLocaleString("ar-SA")} ريال`
                                  : "-"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {format(
                                  new Date(quote.created_at),
                                  "dd/MM/yyyy",
                                  { locale: ar }
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(quote.status)}</TableCell>
                              <TableCell>
                                <Select
                                  defaultValue={quote.status}
                                  onValueChange={(value) =>
                                    updateQuoteStatus(quote.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">جديد</SelectItem>
                                    <SelectItem value="processing">
                                      قيد المعالجة
                                    </SelectItem>
                                    <SelectItem value="completed">
                                      مكتمل
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardQuotes;