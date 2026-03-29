"use client";

import { useState, useRef, useEffect } from "react";

const emails = [
  { label: "Personal", href: "mailto:slaterm100@gmail.com" },
  { label: "Business", href: "mailto:matthew@tempo.xyz" },
];

export function EmailPicker({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={className}
      >
        Email
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 flex flex-col rounded-md border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] py-1 shadow-lg z-20">
          {emails.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white whitespace-nowrap transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
