// Breakpoints alineados con Bootstrap 4 (usados por BreakpointObserver de CDK)
export const BS_BREAKPOINTS: Record<string, string> = {
  'bs-xs': '(max-width: 575.98px)',
  'bs-sm': '(min-width: 576px) and (max-width: 767.98px)',
  'bs-md': '(min-width: 768px) and (max-width: 991.98px)',
  'bs-lg': '(min-width: 992px) and (max-width: 1199.98px)',
  'bs-xl': '(min-width: 1200px)',

  'bs-gt-sm': '(min-width: 576px)',
  'bs-gt-md': '(min-width: 768px)',
  'bs-gt-lg': '(min-width: 992px)',
  'bs-gt-xl': '(min-width: 1200px)',

  'bs-lt-sm': '(max-width: 575.98px)',
  'bs-lt-md': '(max-width: 767.98px)',
  'bs-lt-lg': '(max-width: 991.98px)',
  'bs-lt-xl': '(max-width: 1199.98px)'
};

/**
 * Convierte un alias de breakpoint Bootstrap a un media query string.
 * Ej: resolveBreakpoint('bs-gt-xl') → '(min-width: 1200px)'
 */
export function resolveBreakpoint(alias: string): string {
  return BS_BREAKPOINTS[alias] || alias;
}
