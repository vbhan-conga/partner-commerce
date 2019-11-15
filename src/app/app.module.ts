import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslatorLoaderService, CommerceModule } from '@apttus/ecommerce';
import { TableModule, ApttusModalModule, IconModule } from '@apttus/elements';
import { ComponentModule } from './components/component.module';
import { MainComponent } from './main.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigureGuard } from './services/configure.guard';
import { RouteGuard } from './services/route.guard';
import { ConstraintRuleGuard } from './services/constraint-rule.guard';

// Locale data
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import localeItExtras from '@angular/common/locales/extra/it';

registerLocaleData(localeIt, 'it-IT', localeItExtras);

@NgModule({
  declarations: [
    AppComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommerceModule.forRoot(environment),
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useClass: TranslatorLoaderService }
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: false }),
    TableModule,
    ComponentModule,
    ApttusModalModule,
    IconModule
  ],
  providers: [RouteGuard, ConstraintRuleGuard, ConfigureGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
