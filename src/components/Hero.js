import React from "react";
import { Play, ShieldCheck, Smartphone, Sparkles, Tv } from "lucide-react";

const DEFAULT_STATS = [
  { label: "Streaming", value: "HD" },
  { label: "Devices", value: "Mobile" },
  { label: "Library", value: "Fresh" },
];

export default function Hero({
  title,
  subtitle,
  modeLabel = "Movies",
  categoryLabel = "Popular",
  stats = DEFAULT_STATS,
  primaryLabel = "Browse now",
  secondaryLabel = "See genres",
  onPrimaryAction = () => {},
  onSecondaryAction = () => {},
}) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[1.6rem] border border-cyber-cyan/20 bg-cyber-darker/70 shadow-[0_30px_120px_rgba(34,211,238,0.08)] sm:mb-10 sm:rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(232,121,249,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.92))]" />
      <div className="absolute -left-24 top-12 h-48 w-48 rounded-full bg-cyber-cyan/10 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-cyber-fuchsia/10 blur-3xl" />

      <div className="relative grid gap-6 px-4 py-6 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center lg:gap-8 lg:px-10 lg:py-12">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyber-cyan/70 sm:gap-3 sm:text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/20 bg-cyber-cyan/10 px-3 py-1.5 text-cyber-cyan">
              <Sparkles className="h-4 w-4" />
              Cyberflix
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-cyan-50/70">
              <Tv className="h-4 w-4" />
              {modeLabel}
            </span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-balance text-[2.2rem] font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-cyan-50/75 sm:text-base lg:text-lg lg:leading-8">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-cyan-50/80 sm:gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Smooth on mobile
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-fuchsia/20 bg-cyber-fuchsia/10 px-3 py-2 text-cyber-fuchsia">
              <Smartphone className="h-4 w-4" />
              {categoryLabel}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onPrimaryAction}
              className="btn-cyber inline-flex min-h-[52px] items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base"
            >
              <Play className="h-4 w-4 fill-current" />
              {primaryLabel}
            </button>

            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-cyber-cyan/25 bg-white/5 px-5 py-3 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia/40 hover:text-cyber-fuchsia sm:text-base"
            >
              {secondaryLabel}
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-1">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.32em] text-cyber-cyan/60">
              Experience
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
              {stats.map((stat) => (
                <div
                  key={`${stat.label}-${stat.value}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-cyber-dark/40 px-4 py-3"
                >
                  <span className="text-sm text-cyan-50/65">{stat.label}</span>
                  <span className="text-lg font-bold text-white">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-cyber-cyan/15 bg-cyber-dark/70 p-5">
            <p className="text-xs uppercase tracking-[0.32em] text-cyber-cyan/60">
              Landing focus
            </p>
            <div className="mt-4 grid gap-3 text-sm text-cyan-50/75 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Fast browsing with clear sections and cleaner spacing.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Mobile-first cards, buttons and stacked content blocks.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
