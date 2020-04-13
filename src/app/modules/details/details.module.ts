import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApttusModule } from '@apttus/core';
import { PricingModule } from '@apttus/ecommerce';
import {
  BreadcrumbModule,
  IconModule,
  InputDateModule,
  PriceModule,
  PromotionModule,
  ConfigurationSummaryModule
} from '@apttus/elements';

import { DetailsLayoutComponent } from './layout/details-layout.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { InputFieldModule } from '@apttus/elements';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AddressModule } from '@apttus/elements';
import { DetailSectionComponent } from './detail-section/detail-section.component';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ComponentModule } from '../../components/component.module';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    ComponentModule,
    BreadcrumbModule,
    ApttusModule,
    IconModule,
    InputDateModule,
    PriceModule,
    PromotionModule,
    PricingModule,
    TranslateModule.forChild(),
    ConfigurationSummaryModule,
    FormsModule,
    InputFieldModule,
    DatepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AddressModule,
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  declarations: [DetailsLayoutComponent, DetailSectionComponent],
  exports: [DetailsLayoutComponent, DetailSectionComponent]
})
export class DetailsModule { }
