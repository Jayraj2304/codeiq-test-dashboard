export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
  };
}

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#334155',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
  },
};

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    error: '#dc2626',
    warning: '#d97706',
    success: '#059669',
  },
};

export class ThemeManager {
  private currentTheme: Theme = lightTheme;
  private listeners: ((theme: Theme) => void)[] = [];

  getTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.notifyListeners();
  }

  toggleTheme(): void {
    this.currentTheme =
      this.currentTheme.name === 'light' ? darkTheme : lightTheme;
    this.notifyListeners();
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentTheme));
  }

  getCSSVariables(): Record<string, string> {
    return Object.entries(this.currentTheme.colors).reduce(
      (acc, [key, value]) => {
        acc[`--color-${key}`] = value;
        return acc;
      },
      {} as Record<string, string>
    );
  }
}

export const themeManager = new ThemeManager();
