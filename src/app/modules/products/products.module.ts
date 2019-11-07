import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ComponentModule } from '../../components/component.module';

import { PricingModule } from '@apttus/ecommerce';
import { IconModule, BreadcrumbModule, ProductCardModule, FilterModule, InputFieldModule, ButtonModule, InputSelectModule, ProductCarouselModule, ProductConfigurationModule, ProductConfigurationSummaryModule, ProductImagesModule, PriceModule, InputDateModule } from '@apttus/elements';


import { PaginationModule } from 'ngx-bootstrap/pagination';

import { TranslateModule } from '@ngx-translate/core';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from './list/product-list.component';
import { ResultsComponent } from './components/results.component';
import { ProductDetailComponent } from './detail/product-detail.component';
import { ApttusModule } from '@apttus/core';
import { TabsModule } from 'ngx-bootstrap';
import { DetailsModule } from '../details/details.module';
import { TabAttachmentsComponent } from './components/tab-attachments.component';
import { TabFeaturesComponent } from './components/tab-features.component';
import { ProductReplacementsComponent } from './components/product-replacements.component';

@NgModule({
  imports: [
    CommonModule,
    BreadcrumbModule,
    ProductCarouselModule,
    ProductConfigurationModule,
    ProductConfigurationSummaryModule,
    IconModule,
    ButtonModule,
    ProductImagesModule,
    PriceModule,
    FormsModule,
    ProductsRoutingModule,
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
    FilterModule
  ],
  declarations: [ProductListComponent, ResultsComponent, ProductDetailComponent, TabAttachmentsComponent, TabFeaturesComponent, ProductReplacementsComponent]
})
export class ProductsModule { }
