/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ─── Master Brand Colors ────────────────────────────────────────────────
        'brand-primary':       '#A78BFA', // Light lavender-purple — primary CTA, accents
        'brand-hover':         '#8B5CF6', // Deeper purple — hover / active interactions
        'brand-secondary':     '#C4B5FD', // Soft violet — secondary accents
        'brand-tertiary':      '#7C3AED', // Vivid violet — high-emphasis accents
        'brand-tertiary-light':'#EDE9FE', // Lavender tint — subtle backgrounds

        // ─── Light Mode Semantic Surfaces ──────────────────────────────────────
        'app-bg':        '#F8F9FC', // Cool lavender-tinted off-white page background
        'app-surface':   '#FDFDFF', // Elevated cream-lavender cards / sidebars
        'app-text':      '#334155', // Slate — high-readability body text
        'app-text-muted':'#64748B', // Muted slate for secondary labels

        // ─── Dark Mode Semantic Surfaces ───────────────────────────────────────
        'dark-bg':       '#1E1E2A', // Elevated soft slate-navy background
        'dark-surface':  '#272736', // Slightly lighter slate-purple for cards / depth
        'dark-text':     '#F8FAFC', // Soft off-white text

        // ─── Accent Palette ────────────────────────────────────────────────────
        'accent-mint':   '#D1FAE5', // Success / positive badge tint (light mode)
        'accent-peach':  '#FFEDD5', // Warning / badge tint (light mode)
        'accent-cyan':   '#22D3EE', // Soft cyan for dark mode accent glow
        'accent-pink':   '#FB7185', // Soft pink for dark mode danger/alert

        // ─── Input Colors ──────────────────────────────────────────────────────
        'input-bg':          '#F1F5F9', // Light mode input background
        'input-text':        '#1E293B', // Light mode input text (near-black slate)
        'input-border':      '#CBD5E1', // Light mode input border
        'input-placeholder': '#94A3B8', // Light mode placeholder

        'input-dark-bg':          '#14141D', // Dark mode input background (distinct darker box)
        'input-dark-text':        '#F8FAFC', // Dark mode input text (bright, visible)
        'input-dark-border':      '#475569', // Dark mode input border
        'input-dark-placeholder': '#64748B', // Dark mode placeholder

        // ─── Legacy CSS-var bridge (keep backward-compat for existing components) ─
        background:               'var(--background)',
        surface:                  'var(--surface)',
        'bg-surface':             'var(--surface)',
        'on-surface':             'var(--on-surface)',
        'on-surface-variant':     'var(--on-surface-variant)',
        primary:                  'var(--primary)',
        'on-primary':             'var(--on-primary)',
        'primary-container':      'var(--primary-container)',
        secondary:                'var(--secondary)',
        outline:                  'var(--outline)',
        'outline-variant':        'var(--outline-variant)',
        'surface-container-low':  'var(--surface-container-low)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-lowest':'var(--surface-container-lowest)',
        'surface-tint':           'var(--color-surface-tint)',
        'surface-container':      'var(--color-surface-container)',
        'tertiary-container':     'var(--color-tertiary-container)',
        'on-tertiary':            'var(--color-on-tertiary)',
        'inverse-primary':        'var(--color-inverse-primary)',
        'on-secondary':           'var(--color-on-secondary)',
        'on-primary-container':   'var(--color-on-primary-container)',
        'on-error-container':     'var(--color-on-error-container)',
        'primary-fixed':          'var(--color-primary-fixed)',
        'on-tertiary-fixed-variant':'var(--color-on-tertiary-fixed-variant)',
        'on-background':          'var(--color-on-background)',
        'surface-container-highest':'var(--color-surface-container-highest)',
        'on-tertiary-fixed':      'var(--color-on-tertiary-fixed)',
        'on-secondary-fixed-variant':'var(--color-on-secondary-fixed-variant)',
        'tertiary-fixed':         'var(--color-tertiary-fixed)',
        'inverse-on-surface':     'var(--color-inverse-on-surface)',
        tertiary:                 'var(--color-tertiary)',
        'primary-fixed-dim':      'var(--color-primary-fixed-dim)',
        'secondary-fixed-dim':    'var(--color-secondary-fixed-dim)',
        'on-primary-fixed':       'var(--color-on-primary-fixed)',
        'surface-dim':            'var(--color-surface-dim)',
        'on-tertiary-container':  'var(--color-on-tertiary-container)',
        'on-secondary-fixed':     'var(--color-on-secondary-fixed)',
        'error-container':        'var(--color-error-container)',
        'surface-variant':        'var(--color-surface-variant)',
        'secondary-container':    'var(--color-secondary-container)',
        'on-primary-fixed-variant':'var(--color-on-primary-fixed-variant)',
        'surface-bright':         'var(--color-surface-bright)',
        'on-secondary-container': 'var(--color-on-secondary-container)',
      },
      fontFamily: {
        sans:         ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif:        ['Fraunces', 'ui-serif', 'Georgia', 'Cambria', 'serif'],
        'label-md':   ['"DM Sans"', 'sans-serif'],
        'headline-md':['Fraunces', 'serif'],
        'headline-lg':['Fraunces', 'serif'],
        'body-md':    ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'brand-glow':    '0 0 24px rgba(167, 139, 250, 0.35)',
        'brand-glow-lg': '0 0 48px rgba(167, 139, 250, 0.45)',
      },
      ringColor: {
        'brand-primary': '#A78BFA',
      },
    },
  },
  plugins: [],
};
