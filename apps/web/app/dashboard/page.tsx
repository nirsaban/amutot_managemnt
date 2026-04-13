"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

type MeResponse = { registrationCompleted: boolean; groupSelectionCompleted: boolean; firstName?: string | null };

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const me = await apiFetch<MeResponse>("/auth/me", { method: "GET" });
      if (!me.ok) {
        router.replace("/login");
        return;
      }
      if (!me.data.registrationCompleted) {
        router.replace("/onboarding/profile");
        return;
      }
      if (!me.data.groupSelectionCompleted) {
        router.replace("/onboarding/group");
        return;
      }
      setName(me.data.firstName ?? null);
    })();
  }, [router]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">דשבורד</h1>
      <p className="text-slate-300">
        {name ? `שלום ${name}!` : "ברוכים הבאים!"} זהו מסך בסיסי (MVP) – פיצ׳רים יתווספו בהמשך.
      </p>
    </main>
  );
}
