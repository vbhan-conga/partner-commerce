import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslatorLoaderService, CommerceModule, PartnerDetailsGuard } from '@congacommerce/ecommerce';
import { TableModule, ApttusModalModule, IconModule } from '@congacommerce/elements';
import { ComponentModule } from './components/component.module';
import { MainComponent } from './main.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigureGuard } from './services/configure.guard';
import { RouteGuard } from './services/route.guard';
import { AboGuard } from './services/abo.guard';
import { ConstraintRuleGuard } from './services/constraint-rule.guard';
import { ProductDrawerModule} from '@congacommerce/elements';

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
    TableModule,
    ComponentModule,
    ProductDrawerModule,
    ApttusModalModule,
    IconModule
  ],
  providers: [RouteGuard, ConstraintRuleGuard, ConfigureGuard, AboGuard, PartnerDetailsGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }

