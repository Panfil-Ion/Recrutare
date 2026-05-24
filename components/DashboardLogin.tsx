"use client";

import { FormEvent, useState } from "react";

export function DashboardLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Parolă incorectă");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel mx-auto max-w-md rounded-2xl p-10">
      <h2 className="font-display mb-2 text-center text-2xl text-white">
        Panoul Arhitectului
      </h2>
      <p className="mb-8 text-center text-sm text-white/40">
        Acces restricționat
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="password"
          required
          className="premium-input"
          placeholder="Parolă de acces"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400/90">{error}</p>}
        <button type="submit" disabled={loading} className="premium-btn w-full">
          {loading ? "Se verifică..." : "Intră în panou"}
        </button>
      </form>
    </div>
  );
}
