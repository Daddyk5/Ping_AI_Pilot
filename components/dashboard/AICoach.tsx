"use client";

import { useEffect, useState } from "react";
import { Cpu, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const steps = [
  "Telemetry received",
  "Analyzing packet streams",
  "Checking jitter variance",
  "Bottleneck identified",
];

export function AICoach() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % steps.length);
    }, 1300);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">AI Coach</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-50">Lead Flight Engineer</h2>
        </div>
        <Badge tone="cyan">Handshaking</Badge>
      </div>
      <div className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3 font-mono text-sm">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                active === index ? "bg-cyan-200 shadow-[0_0_14px_rgba(0,243,255,0.75)]" : "bg-zinc-700"
              }`}
            />
            <span className={active === index ? "text-cyan-100" : "text-zinc-500"}>{step}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded border border-white/10 bg-black/35 p-4 font-mono text-sm leading-6 text-zinc-300">
        <div className="mb-2 flex items-center gap-2 text-cyan-200">
          <Terminal className="h-4 w-4" aria-hidden />
          <span>coach.output</span>
        </div>
        Bottleneck identified: local route stable. Watch for evening ISP peering congestion if jitter exceeds 12ms.
      </div>
      <Button className="mt-5 w-full" type="button">
        <Cpu className="h-4 w-4" aria-hidden />
        Run Coach Analysis
      </Button>
    </Card>
  );
}
