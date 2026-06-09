import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { appModuleIdpDesign } from '@internal/plugin-idp-design';
import { navModule } from './modules/nav';

export default createApp({
  features: [catalogPlugin, navModule, appModuleIdpDesign],
});
