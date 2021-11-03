import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

declare var __webpack_public_path__: string;
const sv = (<any>window).sv;

if (environment.production) {
  enableProdMode();
  if (sv && sv.resource) {
    __webpack_public_path__ = sv.resource;
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
