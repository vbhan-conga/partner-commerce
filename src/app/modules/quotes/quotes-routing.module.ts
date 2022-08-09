import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuoteListComponent } from './list/quote-list.component';
import { QuoteDetailComponent } from './detail/quote-detail.component';
import { CreateQuoteComponent } from './quote-create/create-quote.component';
import { DashboardViewComponent } from '../dashboard/view/dashboard-view.component';
import { PartnerDetailsGuard } from '@congacommerce/ecommerce';

const routes: Routes = [
  {
    path: '',
    component: DashboardViewComponent,
    children: [
      {
        component: QuoteListComponent,
        path: ''
      }
    ]
  },
  {
    path: 'create',
    component: CreateQuoteComponent,
  },
  {
    path: ':id',
    component: QuoteDetailComponent,
    canActivate: [PartnerDetailsGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotesRoutingModule { }
