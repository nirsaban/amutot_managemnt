"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

type Group = { id: string; name: string };
type MeResponse = { registrationCompleted: boolean; groupSelectionCompleted: boolean };

export default function OnboardingGroupPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      if (me.data.groupSelectionCompleted) {
        router.replace("/dashboard");
        return;
      }

      const list = await apiFetch<Group[]>("/groups", { method: "GET" });
      if (!list.ok) {
        setMessage(list.message);
        setLoading(false);
        return;
      }
      setGroups(list.data);
      setLoading(false);
    })();
  }, [router]);

  async function select(groupId: string | null) {
    setMessage(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ groupSelectionCompleted: true }>("/onboarding/select-group", {
        method: "POST",
        json: { groupId }
      });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      router.replace("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">בחירת קבוצה</h1>
        <p className="text-sm text-slate-300">
          ניתן לבחור קבוצה פעם אחת. שינוי בהמשך יתבצע ע״י מנהל.
        </p>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        {loading ? (
          <div className="text-sm text-slate-300">טוען קבוצות...</div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-right text-slate-100 disabled:opacity-50"
              onClick={() => select(null)}
              disabled={saving}
            >
              ללא שיוך לקבוצה
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-right text-slate-100 disabled:opacity-50"
                onClick={() => select(g.id)}
                disabled={saving}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        {message ? (
          <div className="rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-sm text-rose-200">
            {message}
          </div>
        ) : null}
      </div>
    </main>
  );
}

