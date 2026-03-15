import React from "react";

export default function AdBanner({ hidden = false, label = "Advertisement" }) {
  if (hidden) {
    return null;
  }

  return (
    <div className="my-6 rounded-[1.75rem] border border-cyber-cyan/15 bg-cyber-darker/45 p-4 text-center sm:my-8 sm:p-5">
      <p className="text-[11px] uppercase tracking-[0.32em] text-cyber-cyan/55">
        {label}
      </p>
      <div className="mt-3 flex h-24 items-center justify-center rounded-2xl border border-dashed border-cyber-cyan/20 bg-cyber-dark/45 px-4 text-sm text-cyber-cyan/70 sm:h-28">
        Ad Slot 320x100 / 728x90 / 970x90
      </div>
    </div>
  );
}
