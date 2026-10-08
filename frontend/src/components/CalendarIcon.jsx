import React from 'react';

export default function CalendarIcon({ size = 20, color = 'currentColor', className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      {/* Outer Calendar Body */}
      <rect x="3" y="4" width="18" height="17" rx="3" fill={color} />
      
      {/* Top Rings/Hooks */}
      <rect x="7" y="1" width="2.5" height="5" rx="1.25" fill={color} stroke="#fff" strokeWidth="0.8" />
      <rect x="14.5" y="1" width="2.5" height="5" rx="1.25" fill={color} stroke="#fff" strokeWidth="0.8" />

      {/* Top Header Slot Pill */}
      <rect x="9.5" y="6" width="5" height="1.8" rx="0.9" fill="#fff" />

      {/* Inner White Calendar Sheet with Folded Corner */}
      <path
        d="M5 9.5H19V16.5C19 16.5 16 16.5 15.5 17C15 17.5 15 20.5 15 20.5H5V9.5Z"
        fill="#fff"
      />

      {/* Folded Corner Triangle Flap */}
      <path
        d="M15 17L19 20.5H15V17Z"
        fill={color}
      />

      {/* Grid of Date Dots (4 columns x 3 rows) */}
      <circle cx="8" cy="12" r="0.9" fill={color} />
      <circle cx="11" cy="12" r="0.9" fill={color} />
      <circle cx="14" cy="12" r="0.9" fill={color} />
      <circle cx="17" cy="12" r="0.9" fill={color} />

      <circle cx="6.5" cy="14.5" r="0.9" fill={color} />
      <circle cx="9.5" cy="14.5" r="0.9" fill={color} />
      <circle cx="12.5" cy="14.5" r="0.9" fill={color} />
      <circle cx="15.5" cy="14.5" r="0.9" fill={color} />

      <circle cx="6.5" cy="17" r="0.9" fill={color} />
      <circle cx="9.5" cy="17" r="0.9" fill={color} />
      <circle cx="12.5" cy="17" r="0.9" fill={color} />
    </svg>
  );
}
