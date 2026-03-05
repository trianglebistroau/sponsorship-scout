// src/lib/onboardingEvents.ts
import { supabase } from "@/utils/supabase/client";

export type OnboardingEventRow = {
  id: number;
  session_id: string;
  type: string;
  payload: any;
  created_at: string;
};

export function subscribeOnboardingEvents(params: {
  sessionId: string;
  onInsert: (row: OnboardingEventRow) => void;
  onStatus?: (status: string) => void;
}) {
  const channel = supabase
    .channel(`onboarding:${params.sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "onboarding_events",
        filter: `session_id=eq.${params.sessionId}`,
      },
      (payload) => {
        if (!payload.new) return;
        params.onInsert(payload.new as any);
      }
    )
    .subscribe((status) => {
      params.onStatus?.(status);
    });

    return () => {
        supabase.removeChannel(channel);
    };
}
