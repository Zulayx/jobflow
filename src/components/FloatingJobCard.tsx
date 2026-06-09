"use client";

import { useState, useEffect, useRef } from "react";
import { Application, ApplicationStatus } from "@/types";

interface FloatingJobCardProps {
  application: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  isFeatured?: boolean;
}

const statusConfig: Record<ApplicationStatus, { color: string; glow: string; icon: string }> = {
  wishlist: { color: "from-blue-500/20 to-cyan-500/20", glow: "shadow-blue-500/30", icon: "☆" },
  applied: { color: "from-purple-500/20 to-pink-500/20", glow: "shadow-purple-500/30", icon: "✈" },
  screening: { color: "from-amber-500/20 to-orange-500/20", glow: "shadow-amber-500/30", icon: "◎" },
  interview: { color: "from-emerald-500/20 to-teal-500/20", glow: "shadow-emerald-500/30", icon: "◆" },
  offer: { color: "from-green-500/20 to-lime-500/20", glow: "shadow-green-500/30", icon: "★" },
  rejected: { color: "from-red-500/20 to-rose-500/20", glow: "shadow-red-500/30", icon: "✕" },
  accepted: { color: "from-green-500/20 to-emerald-500/20", glow: "shadow-green-500/30", icon: "✓" },
};

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
    });

    for (let i = 0; i < 80; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      style={{ background: "transparent" }}
    />
  );
}

export function FloatingJobCard({ application, onEdit, onDelete, isFeatured }: FloatingJobCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const config = statusConfig[application.status];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = (e.clientY - centerY) / 20;
    const rotateY = (centerX - e.clientX) / 20;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className={`relative group cursor-pointer transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
        transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onEdit(application)}
    >
      <div
        className={`relative p-6 rounded-2xl bg-gradient-to-br ${config.color} backdrop-blur-xl border border-glass-border overflow-hidden transition-all duration-300 ${
          isHovered ? "border-accent-primary/50" : ""
        }`}
        style={{
          boxShadow: isHovered
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px -10px ${isHovered ? "rgba(139, 92, 246, 0.3)" : "transparent"}`
            : "0 10px 40px -10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        {isFeatured && (
          <div className="absolute -top-1 -right-1 px-3 py-1 text-xs font-bold bg-accent-gradient text-white rounded-bl-xl rounded-tr-2xl">
            FEATURED
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl backdrop-blur-sm border border-white/10 transition-transform duration-300 ${isHovered ? "scale-110 rotate-3" : ""}`}
            >
              {application.company[0].toUpperCase()}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm border transition-all duration-300 ${
                  application.status === "wishlist"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : application.status === "applied"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : application.status === "screening"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : application.status === "interview"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : application.status === "offer"
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : application.status === "rejected"
                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                    : "bg-green-500/20 text-green-300 border-green-500/30"
                }`}
              >
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-1 truncate">{application.position}</h3>
          <p className="text-text-secondary text-sm mb-3 truncate">{application.company}</p>

          {application.location && (
            <div className="flex items-center gap-2 text-sm text-text-tertiary mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{application.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-xs text-text-tertiary">
              {new Date(application.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            <div
              className={`flex gap-2 transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(application);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-accent-primary/20 border border-transparent hover:border-accent-primary/30 transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(application.id);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-accent-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-accent-secondary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}

export function AnimatedBackground() {
  return (
    <>
      <ParticleField />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent-tertiary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
    </>
  );
}

export function StatusPill({ status, count }: { status: ApplicationStatus; count: number }) {
  const config = statusConfig[status];

  return (
    <div
      className={`relative px-4 py-2 rounded-xl bg-gradient-to-br ${config.color} backdrop-blur-sm border border-glass-border group hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <div className="relative flex items-center gap-3">
        <span className="text-lg">{config.icon}</span>
        <div>
          <div className="text-xs text-text-tertiary capitalize">{status}</div>
          <div className="font-bold">{count}</div>
        </div>
      </div>
    </div>
  );
}

export function ProgressTrack({ status }: { status: ApplicationStatus }) {
  const stages: ApplicationStatus[] = ["wishlist", "applied", "screening", "interview", "offer", "accepted"];
  const currentIndex = stages.indexOf(status === "rejected" ? "interview" : status);
  const isRejected = status === "rejected";

  return (
    <div className="relative flex items-center justify-between py-4 px-2">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-glass-border -translate-y-1/2" />

      <div
        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary -translate-y-1/2 transition-all duration-500"
        style={{ width: `${(currentIndex / (stages.length - 2)) * 100}%` }}
      />

      {stages.map((stage, index) => {
        const config = statusConfig[stage];
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={stage}
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isCompleted
                ? "bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-lg"
                : isRejected
                ? "bg-error/20 text-error"
                : "bg-glass-border text-text-tertiary"
            } ${isCurrent ? "scale-125 ring-4 ring-accent-primary/30" : ""}`}
          >
            <span className="text-sm">{config.icon}</span>
          </div>
        );
      })}
    </div>
  );
}