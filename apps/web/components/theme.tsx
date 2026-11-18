"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Pref = "system" | "light" | "dark";

/** Inline script that sets the theme before paint to avoid a flash. */
export const themeScript = `(function(){try{var p=localStorage.getItem('mova-theme')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

function apply(pref: Pref) {
  const dark = pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const [pref, setPref] = useState<Pref>("system");

  useEffect(() => {
    const saved = (localStorage.getItem("mova-theme") as Pref) || "system";
    setPref(saved);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => (localStorage.getItem("mova-theme") || "system") === "system" && apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const choose = (p: Pref) => {
    setPref(p);
    localStorage.setItem("mova-theme", p);
    apply(p);
  };

  const options: { id: Pref; label: string; Icon: typeof Sun }[] = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
    { id: "system", label: "Device", Icon: Monitor },
  ];

  return (
    <div role="radiogroup" aria-label="Colour theme" className="inline-flex rounded-full border border-border bg-surface p-1">
      {options.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="radio"
          aria-checked={pref === id}
          onClick={() => choose(id)}
          title={label}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted transition-colors aria-checked:bg-accent-solid aria-checked:text-on-accent"
        >
          <Icon aria-hidden className="size-4" />
          {compact ? <span className="sr-only">{label}</span> : label}
        </button>
      ))}
    </div>
  );
}
