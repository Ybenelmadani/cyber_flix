import React from 'react';
import { Download } from 'lucide-react';
import { SERVERS } from '../data/servers';

export default function DownloadSection() {
  return (
    <div className="card-neon p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-cyber-fuchsia" />
        سيرفرات التحميل
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SERVERS.map(server => (
          <div key={server} className="bg-cyber-dark/50 border border-cyber-cyan/20 rounded-xl p-3 hover:border-cyber-fuchsia/40 transition-all">
            <div className="text-cyber-cyan font-medium mb-1">{server}</div>
            <div className="text-xs text-cyber-cyan/50 mb-2">1080p</div>
            <button className="w-full bg-cyber-fuchsia/80 hover:bg-cyber-fuchsia text-white py-2 rounded-lg text-sm font-medium transition-all">
              تحميل الان
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
