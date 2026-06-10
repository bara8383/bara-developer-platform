import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { appearanceModule } from './modules/appearance';
import { navModule } from './modules/nav';

export default createApp({
  features: [catalogPlugin, appearanceModule, navModule],
});
