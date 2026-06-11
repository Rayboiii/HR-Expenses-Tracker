export default defineAppConfig({
  ui: {
    // ─── Semantic color mapping ───────────────────────────────────────────
    // Maps role names → the brand palette defined in main.css.
    // Every UButton color="primary", UBadge color="success" etc. draws from here.
    colors: {
      primary: 'brand',
      neutral: 'zinc',
    },

    // ─── Component-level defaults & slot overrides ────────────────────────
    // Change once here → every instance in the app updates automatically.
    button: {
      defaultVariants: {
        color: 'primary',
        variant: 'solid',
        size: 'md',
      },
      slots: {
        base: 'font-semibold tracking-wide cursor-pointer',
      },
    },

    card: {
      slots: {
        root: 'shadow-sm',
      },
    },

    input: {
      defaultVariants: {
        size: 'md',
      },
    },

    select: {
      defaultVariants: {
        size: 'md',
      },
    },
  },
})
