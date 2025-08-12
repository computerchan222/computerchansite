import React, { useState } from 'react';
import { X, Minus, Square } from 'lucide-react';

const Window = ({ title, icon: Icon, onClose, onMinimize, children, width = "600px" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div 
      className="absolute bg-zinc-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10"
      style={{ 
        width, 
        maxWidth: "90vw",
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        top: '50%',
        left: '50%'
      }}
    >
      {/* Title Bar */}
      <div 
        className="flex items-center justify-between h-8 px-3 bg-zinc-800/80 rounded-t-lg border-b border-white/10 cursor-move"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white/70" />
          <span className="text-xs text-white/90 select-none">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMinimize} className="w-7 h-5 flex items-center justify-center hover:bg-white/10 rounded">
            <Minus className="w-3 h-3 text-white/70" />
          </button>
          <button className="w-7 h-5 flex items-center justify-center hover:bg-white/10 rounded">
            <Square className="w-2.5 h-2.5 text-white/70" />
          </button>
          <button onClick={onClose} className="w-7 h-5 flex items-center justify-center hover:bg-red-500/50 rounded">
            <X className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 max-h-[70vh] overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Window;
