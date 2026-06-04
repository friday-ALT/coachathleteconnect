import { useTheme } from "@/providers/ThemeProvider";

/** Orb press toggle — unchecked = light, checked = dark */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <label
      className="theme-orb-toggle"
      data-testid="button-theme-toggle"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <input
        type="checkbox"
        checked={isDark}
        onChange={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      />
      <span className="orb-button" aria-hidden />
      <span className="orb-label" aria-hidden>
        {isDark ? "☾" : "☀"}
      </span>
    </label>
  );
}
