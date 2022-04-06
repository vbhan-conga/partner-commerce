import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartsRoutingModule } from './carts-routing.module';
import { CartDetailComponent } from './detail/cart-detail.component';
import { CartListComponent } from './list/cart-list.component';
import { CartSummaryComponent } from './components/cart-summary/cart-summary.component';
import { CartTableComponent } from './components/cart-table/cart-table.component';
import { FormsModule } from '@angular/forms';
import { ApttusModule } from '@congacommerce/core';
import { PricingModule } from '@congacommerce/ecommerce';
import { ComponentModule } from '../../components/component.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ProductCarouselModule, ConfigurationSummaryModule, PriceModule, PromotionModule, InputDateModule,
        LineItemTableRowModule, BreadcrumbModule, IconModule, TaxPopHoverModule, PriceSummaryModule, OutputFieldModule,
        InputFieldModule, AlertModule, ConstraintRuleModule, SelectAllModule } from '@congacommerce/elements';
import { TranslateModule } from '@ngx-translate/core';
import { LaddaModule } from 'angular2-ladda';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TableModule, ChartModule } from '@congacommerce/elements';

@NgModule({
  declarations: [CartDetailComponent, CartListComponent, CartSummaryComponent, CartTableComponent],
  imports: [
    ApttusModule,
    CommonModule,
    CartsRoutingModule,
    ApttusModule,
    PromotionModule,
    ProductCarouselModule,
    PricingModule,
    FormsModule,
    ConfigurationSummaryModule,
    PriceModule,
    PromotionModule,
    ComponentModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    DatepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    PopoverModule.forRoot(),
    InputDateModule,
    TranslateModule.forChild(),
    LineItemTableRowModule,
    BreadcrumbModule,
    IconModule,
    PriceSummaryModule,
    TaxPopHoverModule,
    OutputFieldModule,
    LaddaModule,
    InputFieldModule,
    PaginationModule.forRoot(),
    AlertModule,
    TableModule,
    ChartModule,
    ConstraintRuleModule,
    SelectAllModule
  ]
})
export class CartsModule { }
