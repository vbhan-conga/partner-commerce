import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuoteListComponent } from './list/quote-list.component';
import { QuoteDetailComponent } from './detail/quote-detail.component';
import { DashboardViewComponent } from '../dashboard/view/dashboard-view.component';


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
    path: ':id',
    component: QuoteDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotesRoutingModule { }
