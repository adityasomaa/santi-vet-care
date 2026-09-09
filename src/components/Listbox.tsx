"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { setScrollLocked } from "@/components/SmoothScroll";

/* ===========================================================================
 * A real ARIA listbox, not a styled <select> and not a div that merely looks
 * like one. Keyboard contract:
 *
 *   Enter / Space / Alt+Down   open, or commit the active option
 *   Arrow Up / Down            move the active option (opens if closed)
 *   Home / End                 first / last option
 *   Type-ahead                 jump to the option starting with what you type,
 *                              with a 700ms buffer so "ku" reaches "Kucing"
 *   Escape                     close without changing anything
 *   Tab                        close and move on
 *
 * On close, focus always returns to the trigger. The popup is portalled to
 * <body> so a parent with overflow:hidden cannot clip it.
 * ========================================================================= */

export type Option = { value: string; label: string; disabled?: boolean };

export function Listbox({
  label,
  options,
  value,
  onChange,
  placeholder = "Pilih…",
  error,
  describedBy,
  required = false,
  emptyText = "Belum ada pilihan.",
  id: idProp,
}: {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  describedBy?: string;
  required?: boolean;
  emptyText?: string;
  id?: string;
}) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const listId = `${id}-list`;
  const errorId = `${id}-error`;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ buffer: "", at: 0 });

  useEffect(() => setMounted(true), []);

  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value],
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (el) setRect(el.getBoundingClientRect());
  }, []);

  const openList = useCallback(() => {
    if (!options.length) return;
    place();
    setActive(selectedIndex >= 0 ? selectedIndex : firstEnabled(options));
    setOpen(true);
    setScrollLocked(true);
  }, [options, place, selectedIndex]);

  const closeList = useCallback(
    (returnFocus = true) => {
      setOpen((wasOpen) => {
        if (wasOpen) setScrollLocked(false);
        return false;
      });
      if (returnFocus) triggerRef.current?.focus();
    },
    [],
  );

  // Keep the popup glued to the trigger while the page moves under it.
  useEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  // Release the scroll lock if this unmounts while open.
  useEffect(() => {
    return () => {
      if (open) setScrollLocked(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const commit = (index: number) => {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    closeList();
  };

  const step = (delta: number) => {
    setActive((current) => {
      let next = current;
      for (let i = 0; i < options.length; i++) {
        next = (next + delta + options.length) % options.length;
        if (!options[next].disabled) return next;
      }
      return current;
    });
  };

  const jumpTo = (edge: "first" | "last") => {
    setActive(edge === "first" ? firstEnabled(options) : lastEnabled(options));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Single printable character: type-ahead.
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const t = typeahead.current;
      const now = Date.now();
      t.buffer = now - t.at > 700 ? e.key : t.buffer + e.key;
      t.at = now;
      const q = t.buffer.toLowerCase();
      const from = open ? active : selectedIndex;
      const order = options.map((_, i) => (i + from + 1) % options.length);
      const hit = order.find(
        (i) => !options[i].disabled && options[i].label.toLowerCase().startsWith(q),
      );
      if (hit !== undefined) {
        if (open) setActive(hit);
        else commit(hit);
        e.preventDefault();
      }
      if (e.key === " " && t.buffer.trim() === "") {
        /* fall through to the space handling below */
      } else {
        return;
      }
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else step(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else step(-1);
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          jumpTo("first");
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          jumpTo("last");
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) commit(active);
        else openList();
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          closeList();
        }
        break;
      case "Tab":
        if (open) closeList(false);
        break;
    }
  };

  const disabled = options.length === 0;

  return (
    <div>
      <label
        htmlFor={id}
        className="type-field-label block text-ink-2"
        onClick={() => triggerRef.current?.focus()}
      >
        {label}
        {required && <span className="text-accent-deep"> *</span>}
      </label>

      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-haspopup="listbox"
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [error ? errorId : null, describedBy ?? null].filter(Boolean).join(" ") ||
          undefined
        }
        disabled={disabled}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onKeyDown}
        className={`mt-2 flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[1.0625rem] ${
          error
            ? "border-2 border-accent-deep bg-accent-soft"
            : "plate-interactive"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span className={selected ? "font-medium" : "text-ink-3"}>
          {disabled ? emptyText : (selected?.label ?? placeholder)}
        </span>
        <svg
          viewBox="0 0 20 20"
          width="18"
          height="18"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-accent-deep">
          {error}
        </p>
      )}

      {mounted &&
        open &&
        rect &&
        createPortal(
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: "var(--z-overlay)" }}
              onPointerDown={() => closeList()}
            />
            <ul
              id={listId}
              ref={listRef}
              role="listbox"
              aria-label={label}
              aria-activedescendant={`${id}-opt-${active}`}
              tabIndex={-1}
              className="plate fixed max-h-[min(19rem,50svh)] overflow-y-auto border-ink py-1 shadow-[0_12px_40px_rgba(20,20,20,0.2)]"
              style={{
                zIndex: "var(--z-overlay)",
                left: rect.left,
                width: rect.width,
                top:
                  rect.bottom + 320 > window.innerHeight && rect.top > 320
                    ? undefined
                    : rect.bottom + 6,
                bottom:
                  rect.bottom + 320 > window.innerHeight && rect.top > 320
                    ? window.innerHeight - rect.top + 6
                    : undefined,
              }}
            >
              {options.map((opt, i) => {
                const isSelected = opt.value === value;
                const isActive = i === active;
                return (
                  <li
                    key={opt.value}
                    id={`${id}-opt-${i}`}
                    role="option"
                    data-index={i}
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      commit(i);
                    }}
                    onPointerEnter={() => !opt.disabled && setActive(i)}
                    className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-[1.0625rem] ${
                      opt.disabled
                        ? "cursor-not-allowed text-ink-3 opacity-60"
                        : isActive
                          ? "bg-accent text-ink"
                          : "text-ink"
                    }`}
                  >
                    <span className={isSelected ? "font-semibold" : ""}>
                      {opt.label}
                    </span>
                    {isSelected && (
                      <svg
                        viewBox="0 0 20 20"
                        width="16"
                        height="16"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m4 10.5 4 4 8-9" />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>
          </>,
          document.body,
        )}
    </div>
  );
}

const firstEnabled = (o: Option[]) => Math.max(0, o.findIndex((x) => !x.disabled));
const lastEnabled = (o: Option[]) => {
  for (let i = o.length - 1; i >= 0; i--) if (!o[i].disabled) return i;
  return 0;
};
