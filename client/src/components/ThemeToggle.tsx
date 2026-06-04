import { useTheme } from "@/providers/ThemeProvider";

/** 3D flip switch — left = light, right = dark (checked) */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <label className="theme-switch" data-testid="button-theme-toggle" title="Light / dark mode">
      <input
        type="checkbox"
        className="cb"
        checked={isDark}
        onChange={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      />
      <span className="toggle" aria-hidden>
        <span className="left" />
        <span className="right" />
      </span>
    </label>
  );
}
