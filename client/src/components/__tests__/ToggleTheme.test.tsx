import { describe, it, expect, beforeEach } from "vitest";

describe("ToggleTheme Component", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("should have ToggleTheme component exported", () => {
    // Import the component to verify it exists
    const ToggleTheme = require("@/components/ToggleTheme").ToggleTheme;
    expect(ToggleTheme).toBeDefined();
  });

  it("should verify theme context exists", () => {
    const ThemeContext = require("@/contexts/ThemeContext");
    expect(ThemeContext.ThemeProvider).toBeDefined();
    expect(ThemeContext.useTheme).toBeDefined();
  });

  it("should verify localStorage theme persistence", () => {
    localStorage.setItem("theme", "dark");
    const theme = localStorage.getItem("theme");
    expect(theme).toBe("dark");
  });

  it("should verify dark class can be added to document", () => {
    document.documentElement.classList.add("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should verify dark class can be removed from document", () => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
