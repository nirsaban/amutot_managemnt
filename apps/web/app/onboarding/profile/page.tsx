"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

type MeResponse = { registrationCompleted: boolean; groupSelectionCompleted: boolean };

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const me = await apiFetch<MeResponse>("/auth/me", { method: "GET" });
      if (!me.ok) {
        router.replace("/login");
        return;
      }
      if (me.data.registrationCompleted && !me.data.groupSelectionCompleted) {
        router.replace("/onboarding/group");
      } else if (me.data.registrationCompleted && me.data.groupSelectionCompleted) {
        router.replace("/dashboard");
      }
    })();
  }, [router]);

  async function submit() {
    setMessage(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ registrationCompleted: true }>("/onboarding/complete-profile", {
        method: "POST",
        json: { firstName, lastName, email: email || undefined }
      });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      router.replace("/onboarding/group");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">השלמת פרטים</h1>
        <p className="text-sm text-slate-300">כדי להמשיך, נשלים פרטים בסיסיים.</p>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">שם פרטי</span>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-400"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">שם משפחה</span>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-400"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">אימייל (אופציונלי)</span>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {message ? (
          <div className="rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-sm text-rose-200">
            {message}
          </div>
        ) : null}

        <button
          type="button"
          className="w-full rounded-lg bg-sky-500 px-4 py-2 font-medium text-slate-950 disabled:opacity-50"
          onClick={submit}
          disabled={loading || !firstName.trim() || !lastName.trim()}
        >
          {loading ? "שומר..." : "שמירה והמשך"}
        </button>
      </div>
    </main>
  );
}

