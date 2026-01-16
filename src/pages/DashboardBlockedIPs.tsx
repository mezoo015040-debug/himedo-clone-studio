import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Plus, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  Globe,
  Calendar,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  blocked_by: string | null;
  created_at: string;
}

const DashboardBlockedIPs = () => {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchBlockedIPs = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlockedIPs(data || []);
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
      toast.error('خطأ في جلب البيانات');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlockedIPs();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBlockedIPs();
  };

  const handleAddIP = async () => {
    if (!newIP.trim()) {
      toast.error('يرجى إدخال عنوان IP');
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIP.trim())) {
      toast.error('صيغة IP غير صحيحة');
      return;
    }

    setIsAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('blocked_ips')
        .insert({
          ip_address: newIP.trim(),
          reason: newReason.trim() || null,
          blocked_by: user?.id || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('هذا الـ IP محظور بالفعل');
        } else {
          throw error;
        }
        return;
      }

      toast.success('تم حظر الـ IP بنجاح');
      setNewIP('');
      setNewReason('');
      setIsDialogOpen(false);
      fetchBlockedIPs();
    } catch (error) {
      console.error('Error adding blocked IP:', error);
      toast.error('خطأ في حظر الـ IP');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveIP = async (id: string, ip: string) => {
    try {
      const { error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(`تم إلغاء حظر ${ip}`);
      fetchBlockedIPs();
    } catch (error) {
      console.error('Error removing blocked IP:', error);
      toast.error('خطأ في إلغاء الحظر');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50" dir="rtl">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-7 h-7 text-red-600" />
                  إدارة حظر الـ IP
                </h1>
                <p className="text-gray-600">إدارة عناوين IP المحظورة من الوصول للموقع</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 ml-2" />
                    حظر IP جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      حظر عنوان IP جديد
                    </DialogTitle>
                    <DialogDescription>
                      أدخل عنوان IP الذي تريد حظره من الوصول للموقع
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">عنوان IP</label>
                      <Input
                        placeholder="مثال: 192.168.1.1"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                        dir="ltr"
                        className="text-left"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">سبب الحظر (اختياري)</label>
                      <Textarea
                        placeholder="أدخل سبب الحظر..."
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleAddIP}
                      disabled={isAdding}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isAdding ? 'جاري الحظر...' : 'حظر الـ IP'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  إجمالي المحظورين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{blockedIPs.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  آخر حظر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {blockedIPs[0] 
                    ? format(new Date(blockedIPs[0].created_at), 'dd MMM yyyy', { locale: ar })
                    : 'لا يوجد'
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  الحالة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={blockedIPs.length > 0 ? "destructive" : "secondary"}>
                  {blockedIPs.length > 0 ? 'يوجد حظر نشط' : 'لا يوجد حظر'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Blocked IPs Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الـ IPs المحظورة</CardTitle>
              <CardDescription>
                جميع عناوين IP المحظورة من الوصول للموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : blockedIPs.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">لا يوجد IPs محظورة</h3>
                  <p className="text-gray-500 mt-1">
                    لم يتم حظر أي عنوان IP حتى الآن
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">عنوان IP</TableHead>
                        <TableHead className="text-right">سبب الحظر</TableHead>
                        <TableHead className="text-right">تاريخ الحظر</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockedIPs.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                {item.ip_address}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">
                              {item.reason || 'لم يحدد'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">
                              {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveIP(item.id, item.ip_address)}
                            >
                              <Trash2 className="w-4 h-4 ml-1" />
                              إلغاء الحظر
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardBlockedIPs;