import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAppSettings() {
  return useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("platform_name,logo_url,active_theme,watermark_name")
        .eq("id", "main")
        .maybeSingle();
      return data ?? { platform_name: "Reflect", logo_url: null, active_theme: "amber", watermark_name: "Reflect" };
    },
    staleTime: 60_000,
  });
}
