// client/src/components/kanban/useColumnWidths.ts
import { useState, useRef, useEffect } from "react";

type Status = "pending" | "in-progress" | "completed";

type WidthMap = Record<Status, number>;
type CollapseMap = Record<Status, boolean>;

const DEFAULT_WIDTHS: WidthMap = {
  pending: 320,
  "in-progress": 320,
  completed: 320,
};

const DEFAULT_COLLAPSED: CollapseMap = {
  pending: false,
  "in-progress": false,
  completed: false,
};

export function useColumnWidths() {
  /* ----------------------------------------
     INITIAL WIDTHS
  ---------------------------------------- */
  const [widths, setWidths] = useState<WidthMap>(() => {
    try {
      const raw = localStorage.getItem("kanban-widths");
      if (!raw) return DEFAULT_WIDTHS;

      const parsed = JSON.parse(raw);

      return {
        pending: parsed.pending ?? 320,
        "in-progress": parsed["in-progress"] ?? 320,
        completed: parsed.completed ?? 320,
      };
    } catch {
      return DEFAULT_WIDTHS;
    }
  });

  /* ----------------------------------------
     INITIAL COLLAPSE STATE
  ---------------------------------------- */
  const [collapsed, setCollapsed] = useState<CollapseMap>(() => {
    try {
      const raw = localStorage.getItem("kanban-collapsed");
      if (!raw) return DEFAULT_COLLAPSED;

      const parsed = JSON.parse(raw);

      return {
        pending: parsed.pending ?? false,
        "in-progress": parsed["in-progress"] ?? false,
        completed: parsed.completed ?? false,
      };
    } catch {
      return DEFAULT_COLLAPSED;
    }
  });

  /* ----------------------------------------
     DEBOUNCED STORAGE
  ---------------------------------------- */
  const writeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = (key: string, value: any) => {
    if (writeTimeout.current) clearTimeout(writeTimeout.current);

    writeTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn("Failed to save:", key, err);
      }
    }, 150);
  };

  /* Cleanup */
  useEffect(() => {
    return () => {
      if (writeTimeout.current) clearTimeout(writeTimeout.current);
    };
  }, []);

  /* ----------------------------------------
     RESIZE
  ---------------------------------------- */
  function resize(status: Status, delta: number) {
    setWidths((prev) => {
      const newWidth = Math.max(260, Math.min(650, prev[status] + delta));

      const next: WidthMap = {
        ...prev,
        [status]: newWidth,
      };

      save("kanban-widths", next);
      return next;
    });
  }

  /* ----------------------------------------
     COLLAPSE
  ---------------------------------------- */
  function toggle(status: Status) {
    setCollapsed((prev) => {
      const next: CollapseMap = {
        ...prev,
        [status]: !prev[status],
      };

      save("kanban-collapsed", next);
      return next;
    });
  }

  return {
    widths,
    collapsed,
    resize,
    toggle, // ← sinkron dengan KanbanBoard & KanbanColumn
  };
}
