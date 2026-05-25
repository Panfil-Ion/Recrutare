import { ApplyForm } from "@/components/ApplyForm";

export default function ApplyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-16 sm:px-6">
      <div className="ambient-canvas" aria-hidden />
      <div
        className="ambient-glow -top-32 left-1/4 h-96 w-96 bg-[#c9a962]"
        aria-hidden
      />
      <div
        className="ambient-glow top-1/2 right-0 h-80 w-80 bg-[#7ee8c7]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        <header className="mb-12 text-center">
          <p className="mb-3 text-xs tracking-[0.3em] text-[#7ee8c7]/70 uppercase">
            Program de Elită
          </p>
          <h1 className="font-display text-4xl font-medium text-white sm:text-5xl">
            Formularul Arhitectului
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/45">
            Trei pași. Fără compromisuri. Răspunsurile tale vor fi evaluate de
            AI înainte de a ajunge la echipă.
          </p>
        </header>

        <div className="glass-panel chamber-panel assessment-chamber-shell rounded-2xl p-8 sm:p-10">
          <ApplyForm />
        </div>
      </div>
    </main>
  );
}
