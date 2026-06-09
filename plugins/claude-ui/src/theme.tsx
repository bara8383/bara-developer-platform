import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { AppRootWrapperBlueprint, ThemeBlueprint } from '@backstage/plugin-app-react';
import {
  UnifiedThemeProvider,
  createUnifiedTheme,
  defaultTypography,
  genPageTheme,
  palettes,
} from '@backstage/theme';
import type { UnifiedTheme } from '@backstage/theme';
import './ClaudeUiRoot.css';

const fontFamily =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const warmPageThemes = {
  home: genPageTheme({
    colors: ['#8f4f35', '#d97757'],
    shape: 'none',
    options: { fontColor: '#fffaf2' },
  }),
  documentation: genPageTheme({
    colors: ['#80543f', '#c78f63'],
    shape: 'none',
    options: { fontColor: '#fffaf2' },
  }),
  tool: genPageTheme({
    colors: ['#5c4a3b', '#b7784f'],
    shape: 'none',
    options: { fontColor: '#fffaf2' },
  }),
  service: genPageTheme({
    colors: ['#6c5848', '#c96f4c'],
    shape: 'none',
    options: { fontColor: '#fffaf2' },
  }),
  website: genPageTheme({
    colors: ['#75614f', '#d89a68'],
    shape: 'none',
    options: { fontColor: '#fffaf2' },
  }),
  library: genPageTheme({
    colors: ['#734533', '#bf7654'],
    shape: 'none',
    options: { fontColor: '#fffaf2' },
  }),
  other: genPageTheme({
    colors: ['#433a31', '#786858'],
    shape: 'none',
    options: { fontColor: '#fffaf2' },
  }),
  app: genPageTheme({
    colors: ['#9a5639', '#e08a60'],
    shape: 'none',
    options: { fontColor: '#fffaf2' },
  }),
  apis: genPageTheme({
    colors: ['#7b5a42', '#c9825f'],
    shape: 'none',
    options: { fontColor: '#fffaf2' },
  }),
  card: genPageTheme({
    colors: ['#fff8ef', '#f1ded0'],
    shape: 'none',
    options: { fontColor: '#3a3028' },
  }),
};

const sharedComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        letterSpacing: '-0.01em',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 18,
        border: '1px solid rgba(89, 74, 58, 0.12)',
        backgroundImage: 'none',
        boxShadow: '0 16px 50px rgba(74, 55, 40, 0.08)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        border: '1px solid rgba(89, 74, 58, 0.12)',
        boxShadow: '0 18px 48px rgba(74, 55, 40, 0.08)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 999,
        fontWeight: 650,
        letterSpacing: '-0.01em',
        textTransform: 'none' as const,
      },
      contained: {
        boxShadow: 'none',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 999,
        fontWeight: 600,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 650,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
    },
  },
};

const typography = {
  ...defaultTypography,
  fontFamily,
  h1: { ...defaultTypography.h1, fontFamily, fontWeight: 720 },
  h2: { ...defaultTypography.h2, fontFamily, fontWeight: 700 },
  h3: { ...defaultTypography.h3, fontFamily, fontWeight: 690 },
  h4: { ...defaultTypography.h4, fontFamily, fontWeight: 680 },
  h5: { ...defaultTypography.h5, fontFamily, fontWeight: 670 },
  h6: { ...defaultTypography.h6, fontFamily, fontWeight: 660 },
};

const claudeLightTheme: UnifiedTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    mode: 'light',
    type: 'light',
    background: {
      default: '#faf8f3',
      paper: '#fffdf8',
    },
    primary: {
      main: '#b85c38',
      light: '#d97757',
      dark: '#7f3f29',
      contrastText: '#fffaf2',
    },
    secondary: {
      main: '#6f5b48',
      light: '#9b8066',
      dark: '#46382d',
      contrastText: '#fffaf2',
    },
    text: {
      primary: '#2f2a25',
      secondary: '#746b61',
      disabled: '#a3988c',
    },
    divider: 'rgba(89, 74, 58, 0.14)',
    border: 'rgba(89, 74, 58, 0.14)',
    link: '#a64f31',
    linkHover: '#78361f',
    highlight: '#f3ddd2',
    textContrast: '#fffaf2',
    textSubtle: '#746b61',
    textVerySubtle: '#9d9286',
    navigation: {
      background: '#211a16',
      indicator: '#e1a274',
      color: '#d8cbbf',
      selectedColor: '#fffaf2',
      navItem: {
        hoverBackground: 'rgba(225, 162, 116, 0.16)',
      },
      submenu: {
        background: '#2a211c',
      },
    },
    pinSidebarButton: {
      icon: '#fffaf2',
      background: '#b85c38',
    },
    tabbar: {
      indicator: '#b85c38',
    },
  },
  defaultPageTheme: 'home',
  pageTheme: warmPageThemes,
  fontFamily,
  htmlFontSize: 16,
  typography,
  components: sharedComponents,
});

const claudeDarkTheme: UnifiedTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    mode: 'dark',
    type: 'dark',
    background: {
      default: '#171411',
      paper: '#211d19',
    },
    primary: {
      main: '#e1a274',
      light: '#f0bd91',
      dark: '#aa6d49',
      contrastText: '#211a16',
    },
    secondary: {
      main: '#c3b8aa',
      light: '#f4eee6',
      dark: '#8d8173',
      contrastText: '#211a16',
    },
    text: {
      primary: '#f4eee6',
      secondary: '#c3b8aa',
      disabled: '#8d8173',
    },
    divider: 'rgba(244, 238, 230, 0.16)',
    border: 'rgba(244, 238, 230, 0.16)',
    link: '#f0bd91',
    linkHover: '#ffd5b4',
    highlight: 'rgba(225, 162, 116, 0.24)',
    textContrast: '#211a16',
    textSubtle: '#c3b8aa',
    textVerySubtle: '#9f9385',
    navigation: {
      background: '#171411',
      indicator: '#e1a274',
      color: '#c3b8aa',
      selectedColor: '#fff7ed',
      navItem: {
        hoverBackground: 'rgba(225, 162, 116, 0.16)',
      },
      submenu: {
        background: '#211d19',
      },
    },
    pinSidebarButton: {
      icon: '#211a16',
      background: '#e1a274',
    },
    tabbar: {
      indicator: '#e1a274',
    },
  },
  defaultPageTheme: 'home',
  pageTheme: warmPageThemes,
  fontFamily,
  htmlFontSize: 16,
  typography,
  components: sharedComponents,
});

const ClaudeLightTheme = ThemeBlueprint.make({
  name: 'claude-light',
  params: {
    theme: {
      id: 'light',
      title: 'Claude Warm Light',
      variant: 'light',
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={claudeLightTheme} themeName="claude-light">
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

const ClaudeDarkTheme = ThemeBlueprint.make({
  name: 'claude-dark',
  params: {
    theme: {
      id: 'dark',
      title: 'Claude Warm Dark',
      variant: 'dark',
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={claudeDarkTheme} themeName="claude-dark">
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

const ClaudeUiRootWrapper = AppRootWrapperBlueprint.make({
  name: 'claude-ui-css',
  params: {
    component: ({ children }) => <>{children}</>,
  },
});

export const claudeUiModule = createFrontendModule({
  pluginId: 'app',
  extensions: [ClaudeLightTheme, ClaudeDarkTheme, ClaudeUiRootWrapper],
});
