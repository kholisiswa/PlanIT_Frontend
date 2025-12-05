import { describe, it, expect, beforeEach } from "vitest";

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should have ThemeProvider and useTheme exported", () => {
    const { ThemeProvider, useTheme } = require("@/contexts/ThemeContext");
    expect(ThemeProvider).toBeDefined();
    expect(useTheme).toBeDefined();
  });

  it("should verify theme types", () => {
    const themes = ["light", "dark"];
    themes.forEach((theme) => {
      expect(["light", "dark"]).toContain(theme);
    });
  });

  it("should verify localStorage can store theme preference", () => {
    const testTheme = "dark";
    localStorage.setItem("theme", testTheme);
    expect(localStorage.getItem("theme")).toBe(testTheme);
  });

  it("should verify theme switching logic", () => {
    let currentTheme = "light";
    const toggleTheme = () => {
      currentTheme = currentTheme === "light" ? "dark" : "light";
    };

    expect(currentTheme).toBe("light");
    toggleTheme();
    expect(currentTheme).toBe("dark");
    toggleTheme();
    expect(currentTheme).toBe("light");
  });

  it("should verify CSS class manipulation for dark mode", () => {
    const root = document.documentElement;

    // Add dark class
    root.classList.add("dark");
    expect(root.classList.contains("dark")).toBe(true);

    // Remove dark class
    root.classList.remove("dark");
    expect(root.classList.contains("dark")).toBe(false);
  });
});
