import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ComponentModule } from '../../components/component.module';

import { PricingModule } from '@congacommerce/ecommerce';
import {
  IconModule,
  BreadcrumbModule,
  ProductCardModule,
  FilterModule,
  InputFieldModule,
  ButtonModule,
  InputSelectModule,
  ProductCarouselModule,
  ProductConfigurationModule,
  ConfigurationSummaryModule,
  ProductImagesModule,
  PriceModule,
  InputDateModule,
  ConstraintRuleModule,
  AlertModule,
  SelectAllModule
} from '@congacommerce/elements';


import { PaginationModule } from 'ngx-bootstrap/pagination';

import { TranslateModule } from '@ngx-translate/core';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from './list/product-list.component';
import { ResultsComponent } from './components/results.component';
import { ProductDetailComponent } from './detail/product-detail.component';
import { ApttusModule } from '@congacommerce/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { DetailsModule } from '../details/details.module';
import { TabAttachmentsComponent } from './components/tab-attachments.component';
import { TabFeaturesComponent } from './components/tab-features.component';
import { ProductReplacementsComponent } from './components/product-replacements.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    BreadcrumbModule,
    ProductCarouselModule,
    ProductConfigurationModule,
    ConfigurationSummaryModule,
    IconModule,
    ButtonModule,
    ProductImagesModule,
    PriceModule,
    FormsModule,
    ProductsRoutingModule,
    RouterModule,
    ComponentModule,
    PricingModule,
    ApttusModule,
    TabsModule.forRoot(),
    InputDateModule,
    TranslateModule.forChild(),
    DetailsModule,
    PaginationModule.forRoot(),
    ProductCardModule,
    InputSelectModule,
    InputFieldModule,
    FilterModule,
    ConstraintRuleModule,
    AlertModule,
    SelectAllModule
  ],
  declarations: [ProductListComponent, ResultsComponent, ProductDetailComponent, TabAttachmentsComponent, TabFeaturesComponent, ProductReplacementsComponent]
})
export class ProductsModule { }
