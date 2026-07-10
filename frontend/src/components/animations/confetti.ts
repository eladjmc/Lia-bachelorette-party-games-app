import confetti from "canvas-confetti";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function fireConfetti(): void {
  if (prefersReducedMotion()) {
    return;
  }
  void confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.65 },
    colors: ["#0f766e", "#e8b84a", "#e85d4c", "#2dd4bf"],
  });
}

export function fireWinnerConfetti(): void {
  if (prefersReducedMotion()) {
    return;
  }
  void confetti({
    particleCount: 180,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.55 },
  });
}
