import React from 'react';

const baseIconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

// Define todos tus iconos aquí. (Usando la misma lógica que tenías en CorteCaja.jsx)

export const Menu = (props) => (
    <svg {...props} {...baseIconProps}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

export const X = (props) => (
    <svg {...props} {...baseIconProps}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const Store = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M2 7l4 4l8-8l4 4l-2 2L10 18H5L2 15z" />
        <path d="M7 16l-4 4" />
        <path d="M12 5l-2 2" />
        <path d="M16 9l-2 2" />
        <path d="M20 13l-2 2" />
        <path d="M22 17l-4 4" />
    </svg>
);

export const Package = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M12.89 1.45l8.69 8.69a2 2 0 010 2.83l-7.77 7.77a2 2 0 01-2.83 0l-8.69-8.69a2 2 0 010-2.83l7.77-7.77a2 2 0 012.83 0z" />
        <path d="M7 10h4" />
        <path d="M10 7v4" />
    </svg>
);

export const Users = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6M23 11h-6" />
    </svg>
);

export const LogOut = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
);

export const CalendarDays = (props) => (
    <svg {...props} {...baseIconProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
        <path d="M16 18h.01" />
    </svg>
);

export const ShoppingBag = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 00-8 0" />
    </svg>
);

export const DollarSign = (props) => (
    <svg {...props} {...baseIconProps}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
);