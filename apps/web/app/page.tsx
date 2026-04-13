import { APP_NAME } from "@nachalat/shared";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function HomePage() {
  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {APP_NAME}
        </h1>
        <p className="text-slate-300">
          Production-ready monorepo foundation (web + api + shared + db).
        </p>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-lg font-medium">API</h2>
        <p className="mt-2 text-sm text-slate-300">
          Health endpoint:{" "}
          <a
            className="text-sky-300 underline underline-offset-4"
            href={`${apiUrl}/health`}
          >
            {apiUrl}/health
          </a>
        </p>
      </section>
    </main>
  );
}
