import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-16 sm:px-8">
      <div
        className="ambient-glow -top-20 right-1/4 h-96 w-96 bg-[#c9a962]"
        aria-hidden
      />
      <div
        className="ambient-glow bottom-0 left-0 h-72 w-72 bg-[#7ee8c7]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <DashboardView />
      </div>
    </main>
  );
}
