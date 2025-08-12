import React from 'react';

const DesktopIcon = ({ label, icon: Icon, onOpen, selected, disabled = false }) => (
  <button
    onClick={onOpen}
    onDoubleClick={onOpen}
    disabled={disabled}
    className={`
      flex flex-col items-center gap-1 p-2 rounded
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
      focus:outline-none focus:bg-sky-600/30
      ${selected ? 'bg-sky-600/20 border border-sky-400/50' : ''}
      transition-all duration-150 group w-20
    `}
  >
    <div className="relative">
      <div className="w-12 h-12 flex items-center justify-center rounded bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/10 shadow-lg group-hover:shadow-xl transition-shadow">
        <Icon className="w-6 h-6 text-white/90" />
      </div>
    </div>
    <span className="text-xs text-white/90 text-center w-full px-1 py-0.5 rounded bg-black/20 backdrop-blur-sm">
      {label}
    </span>
  </button>
);

export default DesktopIcon;
