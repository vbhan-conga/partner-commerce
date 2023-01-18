import { Component, OnInit } from '@angular/core';
import { last } from 'lodash';

@Component({
  selector: 'app-payment-message',
  template: ``
})
export class PaymentMessageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const paymentStatus = last(window.location.hash.split('='));
    window.parent.window.postMessage({ 'paymentStatus': paymentStatus }, `${window.location.href}`);
  }
}