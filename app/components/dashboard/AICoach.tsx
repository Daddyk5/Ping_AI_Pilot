import { Brain, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

type AICoachProps = {
  ping?: number;
  jitter?: number;
  packetLoss?: number;
};

export default function AICoach({
  ping = 0,
  jitter = 0,
  packetLoss = 0,
}: AICoachProps) {
  const getAdvice = () => {
    if (packetLoss > 2) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
        title: "Packet loss detected",
        message:
          "Your connection may feel unstable. Try switching networks, restarting your router, or using a wired connection.",
      };
    }

    if (ping > 100) {
      return {
        icon: <Zap className="h-5 w-5 text-yellow-400" />,
        title: "High ping detected",
        message:
          "Latency is higher than ideal. Close background apps, avoid downloads, and connect to the nearest server.",
      };
    }

    if (jitter > 30) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-orange-400" />,
        title: "Unstable ping",
        message:
          "Your ping is fluctuating. Check Wi-Fi signal strength or reduce devices connected to your network.",
      };
    }

    return {
      icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
      title: "Connection looks good",
      message:
        "Your network is stable. You should have a smooth gaming or browsing experience.",
    };
  };

  const advice = getAdvice();

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
          <Brain className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">AI Coach</h2>
          <p className="text-sm text-slate-400">Smart network suggestions</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
        <div className="mb-2 flex items-center gap-2">
          {advice.icon}
          <h3 className="font-medium text-white">{advice.title}</h3>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          {advice.message}
        </p>
      </div>
    </div>
  );
}