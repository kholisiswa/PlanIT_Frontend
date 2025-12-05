// client/src/components/kanban/useColumnCollapse.ts
import { useEffect, useRef, useState } from "react";

type Status = "pending" | "in-progress" | "completed";

type CollapseMap = Record<Status, boolean>;

const DEFAULT: CollapseMap = {
  pending: false,
  "in-progress": false,
  completed: false,
};

export function useColumnCollapse() {
  const [collapsed, setCollapsed] = useState<CollapseMap>(() => {
    try {
      const raw = localStorage.getItem("kanban-collapsed");
      if (!raw) return DEFAULT;

      const parsed = JSON.parse(raw);

      return {
        pending: parsed.pending ?? false,
        "in-progress": parsed["in-progress"] ?? false,
        completed: parsed.completed ?? false,
      };
    } catch {
      return DEFAULT;
    }
  });

  /* ----------------------------------------
     DEBOUNCED SAVE
  ---------------------------------------- */
  const writeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = (value: CollapseMap) => {
    if (writeTimeout.current) clearTimeout(writeTimeout.current);

    writeTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem("kanban-collapsed", JSON.stringify(value));
      } catch {}
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (writeTimeout.current) clearTimeout(writeTimeout.current);
    };
  }, []);

  /* ----------------------------------------
     TOGGLE
  ---------------------------------------- */
  function toggle(status: Status) {
    setCollapsed((prev) => {
      const next: CollapseMap = {
        ...prev,
        [status]: !prev[status],
      };

      save(next);
      return next;
    });
  }

  return { collapsed, toggle };
}
