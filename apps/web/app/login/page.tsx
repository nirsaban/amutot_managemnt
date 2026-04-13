"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

type StartLoginResponse = { phone: string; otpSent: boolean; devCode?: string };
type VerifyResponse = {
  user: {
    id: string;
    phone: string;
    associationId: string;
    registrationCompleted: boolean;
    groupSelectionCompleted: boolean;
  };
};
type MeResponse = {
  id: string;
  registrationCompleted: boolean;
  groupSelectionCompleted: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (step === "phone") return phone.trim().length > 0;
    return phone.trim().length > 0 && code.trim().length > 0;
  }, [step, phone, code, loading]);

  async function onSubmit() {
    setMessage(null);
    setLoading(true);
    try {
      if (step === "phone") {
        const res = await apiFetch<StartLoginResponse>("/auth/start-login", {
          method: "POST",
          json: { phone }
        });
        if (!res.ok) {
          setMessage(res.message);
          return;
        }
        setDevCode(res.data.devCode ?? null);
        setStep("code");
        return;
      }

      const verify = await apiFetch<VerifyResponse>("/auth/verify", {
        method: "POST",
        json: { phone, code }
      });
      if (!verify.ok) {
        setMessage(verify.message);
        return;
      }

      const me = await apiFetch<MeResponse>("/auth/me", { method: "GET" });
      if (!me.ok) {
        setMessage(me.message);
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
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">התחברות</h1>
        <p className="text-sm text-slate-300">
          התחברות אפשרית רק למשתמשים שהוזנו מראש ע״י מנהל.
        </p>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        {step === "phone" ? (
          <label className="block space-y-2">
            <span className="text-sm text-slate-200">טלפון</span>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-400"
              inputMode="tel"
              placeholder="050-123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-slate-300">
              קוד נשלח למספר: <span className="text-slate-100">{phone}</span>
            </div>
            <label className="block space-y-2">
              <span className="text-sm text-slate-200">קוד אימות</span>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-400"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>
            {devCode ? (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
                קוד פיתוח: <span className="font-mono">{devCode}</span>
              </div>
            ) : null}
            <button
              type="button"
              className="text-sm text-slate-300 underline underline-offset-4"
              onClick={() => {
                setStep("phone");
                setCode("");
                setDevCode(null);
              }}
              disabled={loading}
            >
              שינוי מספר
            </button>
          </div>
        )}

        {message ? (
          <div className="rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-sm text-rose-200">
            {message}
          </div>
        ) : null}

        <button
          type="button"
          className="w-full rounded-lg bg-sky-500 px-4 py-2 font-medium text-slate-950 disabled:opacity-50"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {loading ? "טוען..." : step === "phone" ? "שליחת קוד" : "אימות והמשך"}
        </button>
      </div>
    </main>
  );
}

