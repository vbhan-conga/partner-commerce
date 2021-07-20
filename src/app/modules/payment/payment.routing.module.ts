import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentDetailsComponent } from './details/payment-details.component';
import { PaymentMessageComponent } from './components/payment-message/payment-message.component';


const routes: Routes = [
    {
        path: '',
        component: PaymentDetailsComponent
      },
    {
        path: 'payment-message',
        component: PaymentMessageComponent
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
