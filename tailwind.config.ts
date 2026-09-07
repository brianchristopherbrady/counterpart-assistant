import type { Config } from "tailwindcss";

/** Tailwind consumes the same CSS custom properties defined in src/design-system/tokens.css. */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          page: "var(--cb-surface-page)",
          raised: "var(--cb-surface-raised)",
          sunken: "var(--cb-surface-sunken)",
        },
        text: {
          primary: "var(--cb-text-primary)",
          muted: "var(--cb-text-muted)",
          "on-accent": "var(--cb-text-on-accent)",
          link: "var(--cb-text-link)",
        },
        border: {
          DEFAULT: "var(--cb-border-default)",
          strong: "var(--cb-border-strong)",
        },
        action: {
          "primary-bg": "var(--cb-action-primary-bg)",
          "primary-bg-hover": "var(--cb-action-primary-bg-hover)",
          "primary-fg": "var(--cb-action-primary-fg)",
          "secondary-bg": "var(--cb-action-secondary-bg)",
          "secondary-fg": "var(--cb-action-secondary-fg)",
          "destructive-bg": "var(--cb-action-destructive-bg)",
          "destructive-fg": "var(--cb-action-destructive-fg)",
        },
        status: {
          "success-bg": "var(--cb-status-success-bg)",
          "success-fg": "var(--cb-status-success-fg)",
          "warning-bg": "var(--cb-status-warning-bg)",
          "warning-fg": "var(--cb-status-warning-fg)",
          "error-bg": "var(--cb-status-error-bg)",
          "error-fg": "var(--cb-status-error-fg)",
          "info-bg": "var(--cb-status-info-bg)",
          "info-fg": "var(--cb-status-info-fg)",
        },
        focus: "var(--cb-focus-ring-color)",
      },
      borderRadius: {
        sm: "var(--cb-radius-sm)",
        md: "var(--cb-radius-md)",
        lg: "var(--cb-radius-lg)",
      },
      boxShadow: {
        1: "var(--cb-elevation-1)",
        2: "var(--cb-elevation-2)",
      },
      maxWidth: {
        content: "var(--cb-content-width)",
      },
      fontFamily: {
        sans: ["var(--cb-font-sans)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
