import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentDetailsComponent } from './details/payment-details.component';
import { PaymentComponentModule } from '@congacommerce/elements';
import { TranslateModule } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LaddaModule } from 'angular2-ladda';
import { PaymentRoutingModule } from './payment.routing.module';
import { PaymentMessageComponent } from './components/payment-message/payment-message.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [PaymentDetailsComponent, PaymentMessageComponent],
  imports: [
    CommonModule,
    PaymentComponentModule,
    PaymentRoutingModule,
    ModalModule,
    LaddaModule,
    TranslateModule.forChild(),
    FormsModule
  ],
  exports: [PaymentDetailsComponent]
})
export class PaymentModule { }
