import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApttusModule } from '@congacommerce/core';
import { ComponentModule } from '../../components/component.module';
import { CompareRoutingModule } from './compare-routing.module';
import { CompareLayoutComponent } from './layout/compare-layout.component';
import { PricingModule } from '@congacommerce/ecommerce';
import { ProductCardModule, IconModule, ProductCompareModule, AlertModule } from '@congacommerce/elements';

@NgModule({
  imports: [
    CommonModule,
    CompareRoutingModule,
    PricingModule,
    ApttusModule,
    ComponentModule,
    ProductCardModule,
    IconModule,
    ProductCompareModule,
    AlertModule
  ],
  declarations: [
    CompareLayoutComponent,
  ]
})
export class CompareModule {}
