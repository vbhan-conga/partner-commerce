import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PricingModule } from '@congacommerce/ecommerce';
import { PriceModule, InputSelectModule, BreadcrumbModule, InputFieldModule, AddressModule, IconModule, LineItemTableRowModule, PriceSummaryModule, TableModule, ChartModule, DataFilterModule } from '@congacommerce/elements';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import { DetailsModule } from '../details/details.module';
import { OutputFieldModule } from '@congacommerce/elements';
import { LaddaModule } from 'angular2-ladda';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { QuotesRoutingModule } from './quotes-routing.module';
import { QuoteDetailComponent } from './detail/quote-detail.component';
import { QuoteListComponent } from './list/quote-list.component';

@NgModule({
  imports: [
    CommonModule,
    QuotesRoutingModule,
    FormsModule,
    PriceModule,
    PricingModule,
    DatepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    InputSelectModule,
    BreadcrumbModule,
    InputFieldModule,
    AddressModule,
    IconModule,
    DetailsModule,
    TranslateModule.forChild(),
    OutputFieldModule,
    LineItemTableRowModule,
    LaddaModule,
    NgScrollbarModule,
    PriceSummaryModule,
    DetailsModule,
    TableModule,
    ChartModule,
    DataFilterModule
  ],
  declarations: [QuoteDetailComponent, QuoteListComponent]
})
export class QuotesModule { }
