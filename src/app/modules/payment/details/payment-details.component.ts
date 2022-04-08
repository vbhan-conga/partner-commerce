import { Component, OnInit, Input, ViewChild, TemplateRef, OnDestroy, EventEmitter, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { defaultTo, get, round, toString } from 'lodash';
import { ConfigurationService } from '@congacommerce/core';
import { PaymentTransaction, Order, UserService, OrderService } from '@congacommerce/ecommerce';
@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss']
})
export class PaymentDetailsComponent implements OnInit, OnDestroy {

  /**
   * Instance of Order object.
   */
  @Input() order: Order;
  /** @ignore */
  @ViewChild('paymentForm') paymentForm: TemplateRef<any>;
  /**
   * Instance of Payment transaction object.
  */
  paymentTransaction: PaymentTransaction;
  /**
   * Flag to check the payment status.
  */
  isPaymentCompleted: boolean = false;

  /**
   * Flag to show/hide payment options.
   */
  showPaymentOptions: boolean = false;
  /**
   * Flag to identify payment type. silentsale/hosted
   */
  isSilentSale: boolean = true;
  /**
   * Flag when set to true makes payment against the payment method selected.
   */
  makePaymentRequest: boolean = false;
  paymentState: 'PONUMBER' | 'INVOICE' | 'PAYNOW' | '' = '';

  loading: boolean = false;
  modalRef: BsModalRef;
  currentUserLocale: string;
  pricingSummaryType: 'checkout' | 'paymentForOrder' | '' = 'checkout';

  @Output() onPaymentProcessed: EventEmitter<any> = new EventEmitter<any>();

  private subscriptions: Array<Subscription> = [];
  private modalConfig = {
    class: 'modal-lg',
    ignoreBackdropClick: true,
    keyboard: false
  };

  constructor(private modalService: BsModalService,
    private configurationService: ConfigurationService,
    private userService: UserService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private orderService: OrderService) { }

  ngOnInit() {
    this.subscriptions.push(this.userService.getCurrentUserLocale(false).subscribe((currentLocale) => this.currentUserLocale = currentLocale));
  }

  /**
   * Create payment transaction object and show payment options.
   */
  makePayment() {
    this.createPaymentTransaction();
    this.showPaymentOptions = true;
    this.modalRef = this.modalService.show(this.paymentForm, this.modalConfig);
  }

  /**
   * Captures the card option selected for payment.
  */
  onSelectingPaymentMethod(eve) {
    setTimeout(() => {
      this.isSilentSale = eve;
      if (eve) {
        this.pricingSummaryType = 'paymentForOrder';
      }
      else {
        this.pricingSummaryType = '';
      }
    });
  }

  /**
   * Submit payment request when payment button is clicked.
  */
  submitPayment() {
    this.loading = true;
    if (this.paymentState === 'PAYNOW')
      this.makePaymentRequest = true;
    // incase of PO Number OR Invoice Me Later
    else
      this.onPaymentComplete('Success');
  }
  /**
   * Set payment completed flag to true
  */
  onPaymentComplete(paymentStatus: string) {
    // Removed payment status assignment as its not a standard field on order
    if (paymentStatus !== 'Success') {
      this.translate.stream(['PAYMENT_METHOD_LABELS.ERROR_MSG', 'PAYMENT_METHOD_LABELS.ERROR_TITLE']).subscribe((val: string) => {
        this.toastr.error(val['PAYMENT_METHOD_LABELS.ERROR_MSG'] + paymentStatus, val['PAYMENT_METHOD_LABELS.ERROR_TITLE']);
      });
      this.order.PaymentStatus = 'Error';
    }
    else {
      this.translate.stream(['PAYMENT_METHOD_LABELS.PAYMENT_SUCCESS_TITLE', 'PAYMENT_METHOD_LABELS.PAYMENT_SUCCESS_MESSAGE']).subscribe((val: string) => {
        this.toastr.success(val['PAYMENT_METHOD_LABELS.PAYMENT_SUCCESS_MESSAGE'], val['PAYMENT_METHOD_LABELS.PAYMENT_SUCCESS_TITLE']);
      });
      this.order.PaymentStatus = 'Processed';
    }
    this.onPaymentProcessed.emit();
    this.loading = false;
    this.modalRef.hide();
    this.isPaymentCompleted = true;

    /*
     Update the order record with payment status. This is a temporary workaround to update order payment status for poste demo.
     The logic later needs to kept as part of Apex code.
    */
    this.orderService.update([this.order]).subscribe();
  }

  /**
   * Create payment transaction object
   */
  createPaymentTransaction() {
    this.paymentTransaction = new PaymentTransaction();
    this.paymentTransaction.Currency = defaultTo(get(this.order, 'CurrencyIsoCode'), this.configurationService.get('defaultCurrency'));
    this.paymentTransaction.CustomerFirstName = get(this.order.PrimaryContact, 'FirstName');
    this.paymentTransaction.CustomerLastName = get(this.order.PrimaryContact, 'LastName');
    this.paymentTransaction.CustomerEmailAddress = get(this.order.PrimaryContact, 'Email');
    this.paymentTransaction.CustomerAddressLine1 = get(this.order.BillToAccount, 'BillingStreet');
    this.paymentTransaction.CustomerAddressCity = get(this.order.BillToAccount, 'BillingCity');
    this.paymentTransaction.CustomerAddressStateCode = get(this.order.BillToAccount, 'BillingAddress.stateCode');
    this.paymentTransaction.CustomerAddressCountryCode = get(this.order.BillToAccount, 'BillingAddress.countryCode');
    this.paymentTransaction.CustomerAddressPostalCode = get(this.order.BillToAccount, 'BillingAddress.postalCode');
    this.paymentTransaction.CustomerBillingAccountName = get(this.order.BillToAccount, 'Name');
    this.paymentTransaction.CustomerBillingAccountID = get(this.order.BillToAccount, 'Id');
    // Rounding off the string amount to 2 decimal places as cybersource doesn't allow higher numeric scale on order amount.
    this.paymentTransaction.OrderAmount = toString(round(parseFloat(defaultTo(this.order.OrderAmount, 0)), 2));
    this.paymentTransaction.OrderName = get(this.order, 'Name');
    this.paymentTransaction.OrderGeneratedID = get(this.order, 'Id');
    this.paymentTransaction.isUserLoggedIn = true;
    this.paymentTransaction.Locale = this.currentUserLocale;
  }

  hidePopover() {
    this.modalRef.hide();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}