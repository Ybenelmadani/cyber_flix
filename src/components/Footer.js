import React from "react";

export default function Footer({ text = "(c) 2026 CYBERFLIX - All rights reserved" }) {
  return (
    <footer className="mt-14 border-t border-cyber-cyan/15 px-4 py-8 sm:mt-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-center sm:text-left">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-cyber-cyan/50">
            CYBERFLIX
          </p>
          <h2 className="mt-2 text-xl font-bold text-cyan-50">
            A cleaner landing page built to feel better on phones.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-cyan-50/55">
          Discover movies and series, switch language quickly, and browse with denser cards that stay readable on small screens.
        </p>
        <p className="text-sm text-cyber-cyan/40">{text}</p>
      </div>
    </footer>
  );
}
