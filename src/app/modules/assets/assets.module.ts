import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetsRoutingModule } from './assets-routing.module';
import { AssetListComponent } from './list/asset-list.component';
import { RenewalFilterComponent } from './components/renewal-filter.component';
import { PriceTypeFilterComponent } from './components/price-type-filter.component';
import { FormsModule } from '@angular/forms';
import { ApttusModule } from '@congacommerce/core';
import { PricingModule } from '@congacommerce/ecommerce';
import { FilterModule, AssetListModule, InputSelectModule, ButtonModule, BreadcrumbModule, TableModule,
        ChartModule, DataFilterModule, ConstraintRuleModule, AlertModule } from '@congacommerce/elements';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ComponentModule } from '../../components/component.module';
import { ProductFamilyFilterComponent } from './components/product-family-filter.component';
import { AssetActionFilterComponent } from './components/asset-action-filter.component';


@NgModule({
  imports: [
    CommonModule,
    AssetsRoutingModule,
    BreadcrumbModule,
    FormsModule,
    ApttusModule,
    PricingModule,
    FilterModule,
    ComponentModule,
    AssetListModule,
    TableModule,
    ChartModule,
    DataFilterModule,
    InputSelectModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AccordionModule.forRoot(),
    ButtonModule,
    ConstraintRuleModule,
    AlertModule
  ],
  declarations: [
    AssetListComponent,
    RenewalFilterComponent,
    PriceTypeFilterComponent,
    AssetActionFilterComponent,
    ProductFamilyFilterComponent
  ]
})
export class AssetsModule { }
