import os from "node:os";
import type { VpnStatus } from "@/types";

const vpnNamePattern =
  /\b(vpn|wireguard|wg|tailscale|zerotier|openvpn|nord|proton|expressvpn|surfshark|mullvad|tap|tun|utun|ipsec|ikev2|l2tp|ppp)\b/i;

export function detectVpnStatus(): VpnStatus {
  const interfaces = os.networkInterfaces();
  const activeInterfaceNames = Object.entries(interfaces)
    .filter(([, addresses]) =>
      (addresses ?? []).some((address) => address.family === "IPv4" && !address.internal),
    )
    .map(([name]) => name);

  const matchedInterfaceNames = activeInterfaceNames.filter((name) => vpnNamePattern.test(name));
  const hasVpnSignal = matchedInterfaceNames.length > 0;

  return {
    active: hasVpnSignal,
    confidence: hasVpnSignal ? "medium" : "none",
    interfaceNames: matchedInterfaceNames,
    summary: hasVpnSignal
      ? `VPN-like adapter detected: ${matchedInterfaceNames.join(", ")}. Recommendations reflect the current route.`
      : "No VPN adapter was detected. Recommendations reflect the current direct route.",
  };
}
