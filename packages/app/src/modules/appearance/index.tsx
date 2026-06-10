import { createFrontendModule } from '@backstage/frontend-plugin-api';
import {
  AppRootWrapperBlueprint,
  ThemeBlueprint,
} from '@backstage/plugin-app-react';
import { Link } from '@backstage/core-components';
import {
  UnifiedThemeProvider,
  createUnifiedTheme,
  palettes,
} from '@backstage/theme';
import { makeStyles } from '@material-ui/core/styles';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ExtensionIcon from '@material-ui/icons/Extension';
import SearchIcon from '@material-ui/icons/Search';
import type { PropsWithChildren } from 'react';

const claudePalette = {
  canvas: '#f7f2e8',
  canvasMuted: '#efe7d8',
  surface: '#fffaf1',
  surfaceStrong: '#ffffff',
  border: '#ddd0bd',
  borderSoft: '#eadfce',
  text: '#2f2a25',
  textMuted: '#6f665d',
  accent: '#c15f3c',
  accentSoft: '#ead2c4',
  accentStrong: '#9c4328',
  sidebar: '#2f2a25',
  sidebarHover: '#443b33',
};

const claudeTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    type: 'light',
    mode: 'light',
    primary: {
      main: claudePalette.accent,
      dark: claudePalette.accentStrong,
      light: '#d98d72',
      contrastText: '#fffaf1',
    },
    secondary: {
      main: '#6f665d',
    },
    background: {
      default: claudePalette.canvas,
      paper: claudePalette.surface,
    },
    text: {
      primary: claudePalette.text,
      secondary: claudePalette.textMuted,
    },
    border: claudePalette.border,
    textContrast: claudePalette.text,
    textVerySubtle: '#9b9084',
    textSubtle: claudePalette.textMuted,
    highlight: claudePalette.accentSoft,
    link: claudePalette.accentStrong,
    linkHover: claudePalette.accent,
    navigation: {
      background: claudePalette.sidebar,
      indicator: claudePalette.accent,
      color: '#d7ccbd',
      selectedColor: '#fff7ea',
      navItem: {
        hoverBackground: claudePalette.sidebarHover,
      },
      submenu: {
        background: '#3a332d',
      },
    },
    pinSidebarButton: {
      icon: '#f7f2e8',
      background: claudePalette.accent,
    },
    tabbar: {
      indicator: claudePalette.accent,
    },
  },
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  defaultPageTheme: 'home',
});

const ClaudeLikeTheme = ThemeBlueprint.make({
  params: {
    theme: {
      id: 'claude-like-light',
      title: 'Claude-like Light',
      variant: 'light',
      icon: <BubbleChartIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={claudeTheme} themeName="claude-like-light">
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

const useStyles = makeStyles(theme => ({
  '@global': {
    ':root': {
      '--bara-topbar-height': '58px',
      '--bara-sidebar-closed-width': '72px',
      '--bara-claude-canvas': claudePalette.canvas,
      '--bara-claude-surface': claudePalette.surface,
      '--bara-claude-border': claudePalette.border,
      '--bara-claude-text': claudePalette.text,
      '--bara-claude-accent': claudePalette.accent,
    },
    'html, body, #root': {
      background: claudePalette.canvas,
    },
    body: {
      color: claudePalette.text,
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    '.BackstageSidebarPage-root': {
      background:
        'radial-gradient(circle at top left, rgba(193, 95, 60, 0.12), transparent 360px), var(--bara-claude-canvas)',
      paddingTop: 'var(--bara-topbar-height)',
    },
    '.BackstageSidebar-drawer': {
      borderRight: `1px solid rgba(255, 250, 241, 0.08)`,
      boxShadow: '6px 0 24px rgba(47, 42, 37, 0.16)',
    },
    '[data-backstage-core-page]': {
      height: 'calc(100vh - var(--bara-topbar-height))',
      background: 'transparent',
    },
    '.BackstageHeader-header': {
      margin: theme.spacing(3, 3, 0),
      width: 'auto',
      borderRadius: 24,
      boxShadow: '0 12px 32px rgba(47, 42, 37, 0.10)',
      backgroundImage: 'none !important',
      backgroundColor: `${claudePalette.surface} !important`,
      border: `1px solid ${claudePalette.borderSoft}`,
    },
    '.BackstageHeader-title': {
      color: `${claudePalette.text} !important`,
      fontWeight: 650,
      letterSpacing: '-0.04em',
    },
    '.BackstageHeader-subtitle, .BackstageHeader-type, .BackstageHeader-breadcrumb':
      {
        color: `${claudePalette.textMuted} !important`,
      },
    '.MuiPaper-root': {
      borderRadius: 18,
      borderColor: claudePalette.borderSoft,
    },
    '.MuiCard-root': {
      boxShadow: '0 12px 30px rgba(47, 42, 37, 0.08)',
      border: `1px solid ${claudePalette.borderSoft}`,
    },
    '.MuiButton-containedPrimary': {
      backgroundColor: claudePalette.accent,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: claudePalette.accentStrong,
        boxShadow: 'none',
      },
    },
  },
  shell: {
    minHeight: '100vh',
    background: claudePalette.canvas,
  },
  topBar: {
    position: 'fixed',
    top: 0,
    right: 0,
    left: 'var(--bara-sidebar-closed-width)',
    height: 'var(--bara-topbar-height)',
    zIndex: theme.zIndex.appBar - 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 3),
    background: 'rgba(247, 242, 232, 0.86)',
    backdropFilter: 'blur(18px)',
    borderBottom: `1px solid ${claudePalette.border}`,
    boxShadow: '0 8px 24px rgba(47, 42, 37, 0.08)',
  },
  productMark: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 0,
    color: claudePalette.text,
    fontSize: 14,
    fontWeight: 650,
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    background: claudePalette.accent,
    boxShadow: `0 0 0 4px ${claudePalette.accentSoft}`,
  },
  searchPill: {
    flex: '1 1 520px',
    maxWidth: 620,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0, 1.5),
    color: claudePalette.textMuted,
    background: 'rgba(255, 250, 241, 0.82)',
    border: `1px solid ${claudePalette.border}`,
    borderRadius: 999,
    fontSize: 13,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
  },
  topLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    height: 34,
    padding: theme.spacing(0, 1.25),
    borderRadius: 999,
    color: claudePalette.textMuted,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      color: claudePalette.text,
      background: claudePalette.accentSoft,
      textDecoration: 'none',
    },
  },
}));

const TopMenuBar = () => {
  const classes = useStyles();

  return (
    <div className={`${classes.topBar} baraTopMenuBar`} role="banner">
      <div className={classes.productMark} aria-label="Bara developer platform">
        <span className={classes.statusDot} />
        Bara IDP
      </div>
      <Link to="/search" className={classes.searchPill} underline="none">
        <SearchIcon fontSize="small" />
        Search catalog, docs, templates...
      </Link>
      <nav className={classes.links} aria-label="top menu">
        <Link to="/catalog" className={classes.topLink} underline="none">
          <DashboardIcon fontSize="small" />
          Catalog
        </Link>
        <Link to="/create" className={classes.topLink} underline="none">
          <ExtensionIcon fontSize="small" />
          Create
        </Link>
      </nav>
    </div>
  );
};

const ClaudeLikeShell = ({ children }: PropsWithChildren<{}>) => {
  const classes = useStyles();

  return (
    <div className={classes.shell}>
      <TopMenuBar />
      {children}
    </div>
  );
};

const ClaudeLikeRootWrapper = AppRootWrapperBlueprint.make({
  params: {
    component: ClaudeLikeShell,
  },
});

export const appearanceModule = createFrontendModule({
  pluginId: 'app',
  extensions: [ClaudeLikeTheme, ClaudeLikeRootWrapper],
});
