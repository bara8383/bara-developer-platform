import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { claudeUiModule } from '@internal/plugin-claude-ui';
import { navModule } from './modules/nav';

export default createApp({
  features: [catalogPlugin, claudeUiModule, navModule],
});
