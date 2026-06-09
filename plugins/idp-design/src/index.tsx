import { ReactNode } from 'react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import {
  AppRootWrapperBlueprint,
  ThemeBlueprint,
} from '@backstage/plugin-app-react';
import {
  createUnifiedTheme,
  UnifiedThemeProvider,
  palettes,
} from '@backstage/theme';
import WbSunnyRoundedIcon from '@material-ui/icons/WbSunnyRounded';

const warmFontStack = [
  'Inter',
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'sans-serif',
].join(', ');

const idpWarmTheme = createUnifiedTheme({
  fontFamily: warmFontStack,
  htmlFontSize: 16,
  palette: {
    ...palettes.light,
    primary: {
      main: '#8b5a3c',
      light: '#b7815d',
      dark: '#5f3f2f',
      contrastText: '#fffaf2',
    },
    secondary: {
      main: '#256f68',
      light: '#4f9991',
      dark: '#174f4a',
      contrastText: '#fffaf2',
    },
    background: {
      default: '#f7f1e8',
      paper: '#fffcf5',
    },
    border: '#e4d7c6',
    textContrast: '#2f241d',
    textVerySubtle: '#9d8d7c',
    textSubtle: '#6f6257',
    highlight: '#efe1cf',
    link: '#7a4f36',
    linkHover: '#5f3f2f',
    infoBackground: '#edf3ef',
    infoText: '#23524f',
    warningBackground: '#fbedd4',
    warningText: '#7a4f13',
    errorBackground: '#f8dfd8',
    errorText: '#8b2f1f',
    navigation: {
      background: '#2f241d',
      indicator: '#d8a578',
      color: '#d7c8b8',
      selectedColor: '#fff7ec',
      navItem: {
        hoverBackground: 'rgba(255, 247, 236, 0.09)',
      },
      submenu: {
        background: '#3a2b22',
      },
    },
    pinSidebarButton: {
      icon: '#fff7ec',
      background: '#5f3f2f',
    },
    tabbar: {
      indicator: '#8b5a3c',
    },
  },
  defaultPageTheme: 'home',
  pageTheme: {
    home: {
      colors: ['#f7f1e8', '#efe1cf'],
      shape: 'none',
      backgroundImage:
        'radial-gradient(circle at top left, rgba(216, 165, 120, 0.28), transparent 34%), linear-gradient(180deg, #f7f1e8 0%, #fbf6ee 100%)',
      fontColor: '#2f241d',
    },
    documentation: {
      colors: ['#f7f1e8', '#e9f0ec'],
      shape: 'none',
      backgroundImage:
        'linear-gradient(135deg, rgba(37, 111, 104, 0.14), rgba(247, 241, 232, 0.92))',
      fontColor: '#2f241d',
    },
    tool: {
      colors: ['#f7f1e8', '#f2e8d8'],
      shape: 'none',
      backgroundImage:
        'linear-gradient(135deg, rgba(139, 90, 60, 0.14), rgba(247, 241, 232, 0.94))',
      fontColor: '#2f241d',
    },
  },
  typography: {
    htmlFontSize: 16,
    fontFamily: warmFontStack,
    h1: { fontSize: '2.25rem', fontWeight: 650, marginBottom: 16 },
    h2: { fontSize: '1.75rem', fontWeight: 650, marginBottom: 14 },
    h3: { fontSize: '1.375rem', fontWeight: 620, marginBottom: 12 },
    h4: { fontSize: '1.125rem', fontWeight: 620, marginBottom: 10 },
    h5: { fontSize: '1rem', fontWeight: 620, marginBottom: 8 },
    h6: { fontSize: '0.875rem', fontWeight: 620, marginBottom: 8 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at 0 0, rgba(216, 165, 120, 0.22), transparent 28rem), #f7f1e8',
          color: '#2f241d',
          letterSpacing: '-0.006em',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e4d7c6',
          borderRadius: 18,
          backgroundImage: 'none',
          boxShadow: '0 18px 45px rgba(73, 52, 37, 0.08)',
        },
        elevation1: {
          boxShadow: '0 12px 30px rgba(73, 52, 37, 0.07)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 650,
          letterSpacing: '-0.01em',
          paddingLeft: 18,
          paddingRight: 18,
          textTransform: 'none',
          boxShadow: 'none',
        },
        contained: {
          boxShadow: '0 10px 24px rgba(139, 90, 60, 0.18)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e4d7c6',
          borderRadius: 22,
          boxShadow: '0 18px 45px rgba(73, 52, 37, 0.08)',
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
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#6f6257',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        },
        root: {
          borderBottom: '1px solid #eadfce',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: 'none',
          fontWeight: 650,
        },
      },
    },
  },
});

const DesignGlobals = ({ children }: { children: ReactNode }) => (
  <>
    <style>{`
      :root {
        --idp-bg: #f7f1e8;
        --idp-surface: #fffcf5;
        --idp-surface-muted: #f1e6d6;
        --idp-border: #e4d7c6;
        --idp-text: #2f241d;
        --idp-text-muted: #6f6257;
        --idp-accent: #8b5a3c;
        --idp-accent-soft: #efe1cf;
        --idp-teal: #256f68;
      }

      html, body, #root {
        min-height: 100%;
      }

      body {
        background:
          radial-gradient(circle at 10% -10%, rgba(216, 165, 120, 0.28), transparent 28rem),
          radial-gradient(circle at 100% 0%, rgba(37, 111, 104, 0.10), transparent 24rem),
          var(--idp-bg);
        color: var(--idp-text);
        font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
      }

      ::selection {
        background: #d8a578;
        color: #2f241d;
      }

      a {
        text-underline-offset: 0.18em;
      }

      [class*='BackstageHeader'] {
        border-bottom: 1px solid rgba(228, 215, 198, 0.72);
        box-shadow: none;
      }

      [class*='BackstageHeader'] h1,
      [class*='Header'] h1 {
        letter-spacing: -0.04em;
      }

      [class*='MuiDrawer-paper'],
      [class*='Sidebar'] {
        border-right: 1px solid rgba(255, 247, 236, 0.08);
      }

      [class*='MuiDrawer-paper'] [class*='MuiListItem-root'],
      [class*='Sidebar'] [class*='MuiListItem-root'] {
        border-radius: 12px;
        margin: 2px 8px;
      }

      [class*='MuiPaper-root'] {
        transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
      }

      [class*='MuiPaper-root']:hover {
        border-color: rgba(139, 90, 60, 0.28);
      }

      [class*='MuiCard-root']:hover {
        transform: translateY(-1px);
      }

      [class*='MuiInputBase-root'] {
        border-radius: 14px;
        background-color: rgba(255, 252, 245, 0.72);
      }

      [class*='MuiOutlinedInput-notchedOutline'] {
        border-color: var(--idp-border);
      }

      [class*='MuiTableContainer-root'] {
        border: 1px solid var(--idp-border);
        border-radius: 18px;
        box-shadow: 0 18px 45px rgba(73, 52, 37, 0.06);
      }
    `}</style>
    {children}
  </>
);

const idpWarmThemeExtension = ThemeBlueprint.make({
  params: {
    theme: {
      id: 'idp-warm-light',
      title: 'IDP Warm Light',
      variant: 'light',
      icon: <WbSunnyRoundedIcon />,
      Provider: ({ children }: { children: ReactNode }) => (
        <UnifiedThemeProvider theme={idpWarmTheme} themeName="idp-warm-light">
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

const idpDesignGlobalsExtension = AppRootWrapperBlueprint.make({
  params: {
    component: DesignGlobals,
  },
});

export const appModuleIdpDesign = createFrontendModule({
  pluginId: 'app',
  extensions: [idpWarmThemeExtension, idpDesignGlobalsExtension],
});
