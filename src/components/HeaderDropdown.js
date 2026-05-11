import React from "react";
import { Check } from "lucide-react";

export default function HeaderDropdown({ 
  items = {}, 
  activeKey, 
  onSelect, 
  onClose,
  align = "left" 
}) {
  const entries = Object.entries(items);

  return (
    <div 
      className={`absolute top-[calc(100%+0.5rem)] z-40 w-48 overflow-hidden rounded-2xl border border-cyber-cyan/25 bg-cyber-darker/95 p-1 shadow-2xl shadow-cyber-cyan/15 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 ${
        align === "right" ? "right-0" : "left-0"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        {entries.map(([key, label]) => {
          const isActive = String(key) === String(activeKey);
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                onSelect && onSelect(key);
                onClose && onClose();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-all ${
                isActive
                  ? "bg-cyber-cyan/15 text-cyber-cyan font-bold"
                  : "text-cyber-cyan/70 hover:bg-cyber-cyan/10 hover:text-cyan-50"
              }`}
            >
              <span>{label}</span>
              {isActive && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
