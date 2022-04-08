import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  OutputFieldModule,
  PriceModule,
  LineItemTableRowModule,
  BreadcrumbModule,
  PriceSummaryModule,
  ButtonModule,
  InputFieldModule,
  DataFilterModule,
  IconModule,
  AlertModule, 
  FilesModule
} from '@congacommerce/elements';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrderListComponent } from './list/order-list.component';
import { OrderDetailComponent } from './detail/order-detail.component';
import { TableModule, ChartModule } from '@congacommerce/elements';
import { DetailsModule } from '../details/details.module';
import { PricingModule } from '@congacommerce/ecommerce';
import { PaymentModule } from '../payment/payment.module';

import { TranslateModule } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ComponentModule } from '../../components/component.module';
import { LaddaModule } from 'angular2-ladda';
import { TooltipModule } from 'ngx-bootstrap/tooltip';


@NgModule({
  declarations: [OrderListComponent, OrderDetailComponent],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    TableModule,
    ChartModule,
    DetailsModule,
    OutputFieldModule,
    ComponentModule,
    PriceModule,
    LineItemTableRowModule,
    BreadcrumbModule,
    PriceSummaryModule,
    PricingModule,
    PaymentModule,
    TranslateModule.forChild(),
    TooltipModule.forRoot(),
    NgScrollbarModule,
    ButtonModule,
    LaddaModule,
    InputFieldModule,
    DataFilterModule,
    IconModule,
    AlertModule, 
    FilesModule
  ]
})
export class OrdersModule { }
