import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './layout/checkout.component';
import { SummaryComponent } from './component/summary.component';
import {
  ConfigurationSummaryModule,
  PaymentComponentModule,
  OutputFieldModule,
  MiniProfileModule,
  BreadcrumbModule,
  PriceSummaryModule,
  InputFieldModule
} from '@congacommerce/elements';
import { CardFormComponent } from './component/card-form/card-form.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AddressModule, PriceModule, IconModule } from '@congacommerce/elements';
import { TranslateModule } from '@ngx-translate/core';
import { ApttusModule } from '@congacommerce/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { LaddaModule } from 'angular2-ladda';
import { ComponentModule } from '../../components/component.module';

@NgModule({
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    FormsModule,
    ComponentModule,
    ConfigurationSummaryModule,
    PriceModule,
    IconModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    AddressModule,
    ApttusModule,
    PaymentComponentModule,
    OutputFieldModule,
    TooltipModule.forRoot(),
    TranslateModule.forChild(),
    BsDropdownModule.forRoot(),
    MiniProfileModule,
    BreadcrumbModule,
    PriceSummaryModule,
    InputFieldModule,
    LaddaModule
  ],
  declarations: [CheckoutComponent, SummaryComponent, CardFormComponent]
})
export class CheckoutModule { }
