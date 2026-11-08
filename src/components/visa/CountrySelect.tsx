import { useId, useMemo, useRef, useState } from "react";
import { COUNTRIES, countryByCode } from "@/lib/countries";

export function CountrySelect({ label, value, onChange }: { label: string; value: string; onChange: (code: string) => void }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = countryByCode(value);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q) : COUNTRIES;
  }, [query]);

  function pick(code: string) {
    onChange(code);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={open && options[active] ? `${id}-${options[active].code}` : undefined}
        className="field"
        placeholder={selected ? `${selected.flag} ${selected.name}` : "Search country…"}
        value={open ? query : selected ? `${selected.flag} ${selected.name}` : ""}
        onFocus={() => { setOpen(true); setActive(0); }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter" && open && options[active]) { e.preventDefault(); pick(options[active].code); }
          else if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover py-1 shadow-card"
        >
          {options.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">No match</li>}
          {options.map((c, i) => (
            <li
              key={c.code}
              id={`${id}-${c.code}`}
              role="option"
              aria-selected={c.code === value}
              onMouseDown={(e) => { e.preventDefault(); pick(c.code); }}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${i === active ? "bg-accent text-accent-foreground" : ""}`}
            >
              <span aria-hidden>{c.flag}</span>
              <span className="flex-1">{c.name}</span>
              {!c.independent && <span className="text-xs text-muted-foreground">territory</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
