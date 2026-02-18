import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Camera, Shield, AlertCircle, Loader2, ImageIcon, X } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ChatButton } from "@/components/ChatButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const IDVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const companyName = searchParams.get("company") || "";
  const price = searchParams.get("price") || "";

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("applicationId");
    if (storedId) {
      setApplicationId(storedId);
    }
  }, []);

  const handleImageSelect = (file: File, side: "front" | "back") => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "خطأ", description: "يرجى اختيار ملف صورة فقط", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة يجب أن لا يتجاوز 10 ميجابايت", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setFrontImage(file);
      setFrontPreview(url);
    } else {
      setBackImage(file);
      setBackPreview(url);
    }
  };

  const handleDrop = (e: React.DragEvent, side: "front" | "back") => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file, side);
  };

  const uploadToStorage = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("id-images")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("id-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!frontImage) {
      toast({ title: "خطأ", description: "يرجى رفع صورة الوجه الأمامي للهوية", variant: "destructive" });
      return;
    }
    if (!backImage) {
      toast({ title: "خطأ", description: "يرجى رفع صورة الظهر للهوية", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const appId = applicationId || "unknown";

      const [frontUrl, backUrl] = await Promise.all([
        uploadToStorage(frontImage, `${appId}/front_${timestamp}.${frontImage.name.split(".").pop()}`),
        uploadToStorage(backImage, `${appId}/back_${timestamp}.${backImage.name.split(".").pop()}`),
      ]);

      // تحديث قاعدة البيانات
      if (applicationId) {
        await supabase
          .from("customer_applications")
          .update({
            id_front_url: frontUrl,
            id_back_url: backUrl,
            id_verification_step: "submitted",
            current_step: "id_verification",
          })
          .eq("id", applicationId);

        // إرسال إشعار تيليجرام
        try {
          await supabase.functions.invoke("send-telegram", {
            body: {
              applicationData: {
                fullName: "",
                phone: "",
                selectedCompany: companyName,
                selectedPrice: price,
                message: `📸 العميل رفع صور الهوية!\nرابط الوجه: ${frontUrl}\nرابط الظهر: ${backUrl}`,
              },
            },
          });
        } catch {}
      }

      setSubmitted(true);
      setWaitingForApproval(true);
    } catch (error) {
      console.error(error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء رفع الصور، يرجى المحاولة مجدداً", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // polling للتحقق من موافقة المسؤول
  useEffect(() => {
    if (!waitingForApproval || !applicationId) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("customer_applications")
        .select("id_verification_step, status")
        .eq("id", applicationId)
        .single();

      if (error) return;

      if (data?.id_verification_step === "approved") {
        setApproved(true);
        setWaitingForApproval(false);
        clearInterval(interval);
      } else if (data?.id_verification_step === "rejected" || data?.status === "rejected") {
        setRejected(true);
        setWaitingForApproval(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [waitingForApproval, applicationId]);

  // شاشة الموافقة
  if (approved) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <Card className="p-10 max-w-md w-full text-center shadow-2xl border-2 border-primary/30">
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3">✅ تم التحقق من هويتك!</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            تم مراجعة صور هويتك والتحقق منها بنجاح. سيتم التواصل معك قريباً لإتمام الطلب.
          </p>
          <Badge className="text-base px-4 py-2 bg-primary/10 text-primary border-primary/20">
            🎉 تم التحقق بنجاح
          </Badge>
        </Card>
      </div>
    );
  }

  // شاشة الرفض - يُعاد توجيه العميل لرفع الصور مجدداً
  if (rejected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <Card className="p-10 max-w-md w-full text-center shadow-2xl border-2 border-destructive/30">
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-destructive">❌ لم يتم قبول الصور</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            عذراً، الصور المرفوعة لم تكن واضحة أو مقبولة. يرجى إعادة رفع صور واضحة للهوية.
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              setRejected(false);
              setSubmitted(false);
              setFrontImage(null);
              setBackImage(null);
              setFrontPreview(null);
              setBackPreview(null);
            }}
          >
            إعادة رفع الصور
          </Button>
        </Card>
      </div>
    );
  }

  // شاشة الانتظار بعد رفع الصور
  if (waitingForApproval) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <Card className="p-10 max-w-md w-full text-center shadow-2xl border-2 border-primary/20">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-14 h-14 text-primary" />
              </div>
              <div className="absolute inset-0 w-28 h-28 rounded-full border-4 border-primary/30 animate-ping opacity-50"></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <h2 className="text-xl font-bold">جاري التحقق من هويتك</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            تم استلام صورك بنجاح 🎉
            <br />
            <span className="font-medium text-foreground">تحلَّ بالصبر</span>، فريقنا يراجع هويتك الآن وسيتم إشعارك فور الانتهاء
          </p>
          <div className="flex flex-col gap-2">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-primary rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
            <p className="text-xs text-muted-foreground">قد تستغرق العملية بضع دقائق...</p>
          </div>
          <Badge className="mt-6 text-base px-4 py-2 bg-amber-500/10 text-amber-600 border-amber-300">
            ⏳ قيد المراجعة
          </Badge>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">التحقق من الهوية</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">يجب التحقق من هويتك</h1>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              لإتمام طلبك، يرجى رفع صورة واضحة للهوية الوطنية أو الإقامة من الوجهين (الأمامي والخلفي)
            </p>
          </div>

          {/* تعليمات */}
          <Card className="p-4 mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold">شروط الصورة المقبولة:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>الصورة واضحة وبإضاءة جيدة</li>
                  <li>جميع البيانات مقروءة وواضحة</li>
                  <li>لا يوجد انعكاس أو ظل على الهوية</li>
                  <li>الهوية كاملة ولا يوجد جزء مقطوع</li>
                  <li>الصيغ المقبولة: JPG, PNG, HEIC (بحد أقصى 10 ميجا)</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            {/* الوجه الأمامي */}
            <UploadCard
              title="الوجه الأمامي"
              emoji="🪪"
              description="الجهة التي تحتوي على الصورة والاسم"
              preview={frontPreview}
              onSelect={(file) => handleImageSelect(file, "front")}
              onRemove={() => { setFrontImage(null); setFrontPreview(null); }}
              onDrop={(e) => handleDrop(e, "front")}
              inputRef={frontInputRef}
            />

            {/* الوجه الخلفي */}
            <UploadCard
              title="الوجه الخلفي"
              emoji="🔙"
              description="الجهة الخلفية للهوية أو الإقامة"
              preview={backPreview}
              onSelect={(file) => handleImageSelect(file, "back")}
              onRemove={() => { setBackImage(null); setBackPreview(null); }}
              onDrop={(e) => handleDrop(e, "back")}
              inputRef={backInputRef}
            />

            {/* زر الإرسال */}
            <Button
              size="lg"
              className="w-full h-12 font-bold text-base"
              onClick={handleSubmit}
              disabled={uploading || !frontImage || !backImage}
            >
              {uploading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري رفع الصور...
                </>
              ) : (
                <>
                  <Upload className="ml-2 h-5 w-5" />
                  إرسال صور الهوية
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              🔒 صورك محمية بالكامل ولن تُستخدم إلا لأغراض التحقق من الهوية وفق سياسة الخصوصية
            </p>
          </div>
        </div>
      </section>
      <ChatButton />
      <Footer />
    </div>
  );
};

interface UploadCardProps {
  title: string;
  emoji: string;
  description: string;
  preview: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onDrop: (e: React.DragEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const UploadCard = ({ title, emoji, description, preview, onSelect, onRemove, onDrop, inputRef }: UploadCardProps) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <Card className={`p-5 border-2 transition-all ${dragOver ? "border-primary bg-primary/5" : preview ? "border-primary/50 bg-primary/5" : "border-dashed border-muted-foreground/30"}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h3 className="font-bold text-base">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {preview && (
          <Badge className="mr-auto bg-primary/10 text-primary border-primary/20">
            <CheckCircle className="w-3 h-3 ml-1" />
            تم الرفع
          </Badge>
        )}
      </div>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt={title}
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="h-40 border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          onDrop={(e) => { setDragOver(false); onDrop(e); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
        >
          <div className="p-3 rounded-full bg-muted">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">اسحب الصورة هنا أو</p>
            <p className="text-xs text-muted-foreground mt-1">انقر لاختيار الصورة من الجهاز</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 pointer-events-none">
              <Upload className="h-3 w-3" />
              رفع صورة
            </Button>
            <Button variant="outline" size="sm" className="gap-1 pointer-events-none">
              <Camera className="h-3 w-3" />
              كاميرا
            </Button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
    </Card>
  );
};

export default IDVerification;
