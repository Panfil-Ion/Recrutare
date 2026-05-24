"use client";

import { useCallback, useEffect, useState } from "react";
import { Candidate, CandidateCard } from "./CandidateCard";
import { DashboardLogin } from "./DashboardLogin";

export function DashboardView() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/candidates");
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const json = await res.json();
      setCandidates(json.candidates ?? []);
      setAuthenticated(true);
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  if (authenticated === null || (authenticated && loading && !candidates.length)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-white/30">
        Se încarcă...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <DashboardLogin
        onSuccess={() => {
          setAuthenticated(true);
          fetchCandidates();
        }}
      />
    );
  }

  return (
    <>
      <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs tracking-[0.3em] text-[#c9a962]/70 uppercase">
            Arhitect
          </p>
          <h1 className="font-display text-4xl text-white">
            Candidați evaluați
          </h1>
        </div>
        <p className="text-sm text-white/35">
          {candidates.length} candidatur{candidates.length === 1 ? "ă" : "i"}
        </p>
      </header>

      {candidates.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center text-white/40">
          Niciun candidat încă. Formularul public așteaptă primul răspuns.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c, i) => (
            <CandidateCard key={c.id} candidate={c} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
