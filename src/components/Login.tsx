import React, { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await onLogin(username.trim(), password.trim());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    const NODE_COUNT = 28;
    const MAX_DIST = 140;

    type Node = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
    };

    const nodes: Node[] = [];

    function init() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: 1 + Math.random() * 2,
        });
      }
    }

    function resizeHandler() {
      init();
    }

    function step() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // draw lines
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = 0.12 * (1 - dist / MAX_DIST);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.stroke();
          }
        }
      }

      // draw nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(step);
    }

    init();
    rafRef.current = requestAnimationFrame(step);
    window.addEventListener("resize", resizeHandler);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <div className="min-h-screen relative bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full"
        aria-hidden
      />

      <div className="relative z-10 max-w-md w-full bg-black/60 backdrop-blur-md border border-white/6 rounded-lg p-6">
        <Toaster position="top-center" />

        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
        </div>

        <h2 className="text-2xl font-medium text-center mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 pr-10 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="Enter password"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-300"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 0 1 1.18-4.5" />
                    <path d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1.05 12a10.97 10.97 0 0 1 1.9-3.3C5.5 5.1 8.6 3 12 3c5.523 0 10 4.477 10 9s-4.477 9-10 9c-2.9 0-5.5-1-7.6-2.7" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white/8 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/10"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <footer className="text-center text-xs text-gray-400 mt-4">BR7 technologies & Co.</footer>
      </div>
    </div>
  );
}
