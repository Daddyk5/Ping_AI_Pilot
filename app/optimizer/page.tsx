import { OptimizerPanel } from "@/components/live-test/OptimizerPanel";

export default function OptimizerPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Optimizer</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Smart Server Recommender</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Detect a supported game, test predefined regions, and recommend the most stable route without changing your system.
        </p>
      </section>
      <OptimizerPanel />
    </div>
  );
}
