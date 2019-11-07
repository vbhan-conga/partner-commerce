import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetsRoutingModule } from './assets-routing.module';
import { AssetListComponent } from './list/asset-list.component';
import { RenewalFilterComponent } from './components/renewal-filter.component';
import { PriceTypeFilterComponent } from './components/price-type-filter.component';
import { FormsModule } from '@angular/forms';
import { ApttusModule } from '@apttus/core';
import { PricingModule } from '@apttus/ecommerce';
import { FilterModule, AssetListModule, InputSelectModule, ButtonModule, BreadcrumbModule } from '@apttus/elements';
import { PaginationModule, BsDatepickerModule, AccordionModule } from 'ngx-bootstrap';
import { ComponentModule } from '../../components/component.module';


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
    InputSelectModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AccordionModule.forRoot(),
    ButtonModule
  ],
  declarations: [
    AssetListComponent,
    RenewalFilterComponent,
    PriceTypeFilterComponent
  ]
})
export class AssetsModule { }
