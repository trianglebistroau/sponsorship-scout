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
}) {
    console.log("subscribeOnboardingEvents", params.sessionId);
    console.log("sessionId raw:", JSON.stringify(params.sessionId));
    const channel = supabase
        .channel(`onboarding_events:${params.sessionId}`)
        .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "onboarding_events",
            filter: `session_id=eq.${params.sessionId}`,
        },
        (payload) => {
            console.log("sessionId raw:", JSON.stringify(params.sessionId));
            console.log("onboarding event", payload.new);
            if (!payload.new) return;
            params.onInsert(payload.new as any);
        }
        )
        .subscribe(
            (status) => {
                console.log("onboarding event channel status", status);
            }
        );

    return () => {
        supabase.removeChannel(channel);
    };
}
