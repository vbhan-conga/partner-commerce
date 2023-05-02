import { Component, OnInit, ViewChild, ElementRef, TemplateRef, OnDestroy, NgZone } from '@angular/core';
import { User, Account, Cart, CartService, Order, OrderService, Contact, ContactService, UserService, AccountService, EmailService, PaymentTransaction, AccountInfo } from '@congacommerce/ecommerce';
import { Observable, Subscription } from 'rxjs';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Card } from '../component/card-form/card-form.component';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { map, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { get, uniqueId, find, defaultTo } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService, ACondition, APageInfo } from '@congacommerce/core';
import { ExceptionService, PriceSummaryComponent, LookupOptions } from '@congacommerce/elements';

@Component({
  selector: 'app-cart',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  @ViewChild('addressTabs') addressTabs: any;
  @ViewChild('addressInfo') addressInfo: ElementRef;
  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  @ViewChild('confirmationTemplate') confirmationTemplate: TemplateRef<any>;
  @ViewChild('priceSummary') priceSummary: PriceSummaryComponent;

  /**
   * An Observable containing the current contact record
   */
  primaryContact: Contact;
  /**
   * If shilling and billing addresses are same or not.
   */
  shippingEqualsBilling: boolean = true;
  /**
   * Order Object Model
   */
  order: Order;
  /**
   * Order Response Object Model
   */
  orderConfirmation: Order;
  /**
   * Card Model (name, card number, expiration date, etc)
   */
  card: Card;
  /**
   * Loading flag for spinner
   */
  loading: boolean = false;
  /**
   * Unique Id
   */
  uniqueId: string;
  /**
   * Payment state such as Card and Invoice
   * Default is blank
   */
  paymentState: 'PONUMBER' | 'INVOICE' | 'PAYNOW' | '' = '';
  /**
   * Stores confirmation model
   */
  confirmationModal: BsModalRef;
  /**
   * A hot observable containing the user information
   */
  user$: Observable<User>;
  /**
   * A hot observable containing the account information
   */
  account$: Observable<Account>;
  /**
   * Current selected locale for logged in user
  */
  currentUserLocale: string;
  /**
   * flag to check the payment process
  */
  isPaymentCompleted: boolean = false;
  /**
   * flag to check if the flow started for payment
  */
  isPayForOrderEnabled: boolean = false;
  /**
   * flag to enable make payment button against of payment method
  */
  isMakePaymentRequest: boolean = false;
  /**
   * payment transaction object
  */
  paymentTransaction: PaymentTransaction;
  /**
   * order amount to charge on payment
  */
  orderAmount: string;
  errMessages: any = {
    requiredFirstName: '',
    requiredLastName: '',
    requiredEmail: '',
    requiredPrimaryContact: '',
    requiredShipToAcc: ''
  };
  cart: Cart;
  isLoggedIn: boolean;
  shipToAccount$: Observable<Account>;
  billToAccount$: Observable<Account>;
  pricingSummaryType: 'checkout' | 'paymentForOrder' | '' = 'checkout';
  breadcrumbs;
  lookupOptions: LookupOptions = {
    primaryTextField: 'Name',
    secondaryTextField: 'Email',
    fieldList: ['Id', 'Name', 'Email']
  };

  private subscriptions: Subscription[] = [];

  constructor(private cartService: CartService,
              public configurationService: ConfigurationService,
              private orderService: OrderService,
              private modalService: BsModalService,
              public contactService: ContactService,
              private translate: TranslateService,
              private userService: UserService,
              private accountService: AccountService,
              private emailService: EmailService,
              private router: Router,
              private ngZone: NgZone,
              private toastr: ToastrService,
              private exceptionService: ExceptionService) {
    this.uniqueId = uniqueId();
  }

  ngOnInit() {
    this.subscriptions.push(this.userService.isLoggedIn().subscribe(isLoggedIn => this.isLoggedIn = isLoggedIn));
    this.subscriptions.push(this.userService.getCurrentUserLocale(false).subscribe((currentLocale) => this.currentUserLocale = currentLocale));

    // if (!this.isLoggedIn)
    //   this.paymentState = 'PAYNOW';

    this.subscriptions.push(this.accountService.getCurrentAccount().subscribe(account => {
      // Setting lookup options for primary contact field
      this.lookupOptions.conditions = [new ACondition(Contact, 'AccountId', 'Equal', get(account, 'Id'))];
      this.lookupOptions.expressionOperator = 'AND';
      this.lookupOptions.filters = null;
      this.lookupOptions.sortOrder = null;
      this.lookupOptions.page = new APageInfo(10);
    }));
    this.order = new Order();
    this.subscriptions.push(this.cartService.getMyCart().subscribe(cart => {
      this.cart = cart;

      // Setting default values on order
      this.order.SoldToAccount = get(cart, 'Account');
      this.order.SoldToAccountId = get(cart, 'AccountId');
      this.order.BillToAccount = get(cart, 'BillToAccount');
      this.order.BillToAccountId = get(cart, 'BillToAccountId');
      this.order.ShipToAccount = get(cart, 'ShipToAccount');
      this.order.ShipToAccountId = get(cart, 'ShipToAccountId');
      this.order.PriceList = get(cart, 'PriceList');
      this.order.PriceListId = get(cart, 'PriceListId');
    }));
    this.subscriptions.push(this.contactService.getMyContact().subscribe(c => {
      this.primaryContact = c;

      // Setting default values on order
      this.order.PrimaryContactId = get(c, 'Id');
      this.order.PrimaryContact = c;
    }));
    this.card = {} as Card;
    this.user$ = this.userService.me();
    this.subscriptions.push(this.translate.stream(['PRIMARY_CONTACT', 'AOBJECTS']).subscribe((val: string) => {
      this.errMessages.requiredFirstName = val['PRIMARY_CONTACT']['INVALID_FIRSTNAME'];
      this.errMessages.requiredLastName = val['PRIMARY_CONTACT']['INVALID_LASTNAME'];
      this.errMessages.requiredEmail = val['PRIMARY_CONTACT']['INVALID_EMAIL'];
      this.errMessages.requiredPrimaryContact = val['PRIMARY_CONTACT']['INVALID_PRIMARY_CONTACT'];
      this.errMessages.requiredShipToAcc = val['PRIMARY_CONTACT']['INVALID_SHIP_TO_ACC'];
      this.breadcrumbs = [
        {
          label: val['AOBJECTS']['CART'],
          route: [`/carts/active`]
        }
      ];
    }));

    this.onBillToChange();
    this.onShipToChange();
  }

  /**
   * Allow to switch address tabs if billing and shipping address are diffrent.
   *
   * @param evt Event that identifies if Shipping and billing addresses are same.
   *
   */
  selectTab(evt) {
    if (evt)
      this.staticTabs.tabs[0].active = true;
    else {
      setTimeout(() => this.staticTabs.tabs[1].active = true, 50);
    }
  }

  /**
   * Allows user to submit order. Convert a cart to order and submit it.
   */
  submitOrder() {
    const orderAmountGroup = find(get(this.cart, 'SummaryGroups'), c => get(c, 'LineType') === 'Grand Total');
    this.orderAmount = defaultTo(get(orderAmountGroup, 'NetPrice', 0).toString(), '0');
    this.loading = true;
    if (this.isLoggedIn) {
      const selectedAcc: AccountInfo = {
        BillToAccountId: this.order.BillToAccountId,
        ShipToAccountId: this.order.ShipToAccountId,
        SoldToAccountId: this.order.SoldToAccountId
      };

      this.convertCartToOrder(get(this, 'order'), get(this, 'order.PrimaryContact'), null, selectedAcc, false);
    }
    // else {
    //   if (this.shippingEqualsBilling) {
    //     this.primaryContact.OtherCity = this.primaryContact.MailingCity;
    //     this.primaryContact.OtherStreet = this.primaryContact.MailingStreet;
    //     this.primaryContact.OtherState = this.primaryContact.MailingState;
    //     this.primaryContact.OtherStateCode = this.primaryContact.MailingStateCode;
    //     this.primaryContact.OtherPostalCode = this.primaryContact.MailingPostalCode;
    //     this.primaryContact.OtherCountryCode = this.primaryContact.MailingCountryCode;
    //   }

    //   // Removing MailingCountry, OtherCountry, OtherState and OtherStateCode from primary contact object
    //   delete this.primaryContact.OtherCountry;
    //   delete this.primaryContact.OtherState;
    //   delete this.primaryContact.OtherStateCode;

    //   this.convertCartToOrder(this.order, this.primaryContact);
    // }
  }


  /**
   * Generates a unique id for different components
   *
   * @param id ids such as 'firstName', 'lastName', 'email', etc
   * @returns uniqueid
   */
  getId(id: string): string {
    return this.uniqueId + '_' + id;
  }

  onBillToChange() {
    if(this.order.BillToAccountId)
      this.billToAccount$ = this.accountService.getAccount(this.order.BillToAccountId).pipe(map(res => this.order.BillToAccount = res));
  }

  onShipToChange() {
    if(this.order.ShipToAccountId)
      this.shipToAccount$ = this.accountService.getAccount(this.order.ShipToAccountId).pipe(map(res => this.order.ShipToAccount = res));
  }

  onPrimaryContactChange() {
    this.subscriptions.push(
      this.contactService.getContact({Id: this.order.PrimaryContactId}).subscribe(c => {
        this.order.PrimaryContactId = get(c, 'Id');
        this.order.PrimaryContact = c;
      })
    );
  }

  convertCartToOrder(order: Order, primaryContact: Contact, cart?: Cart, selectedAccount?: AccountInfo, acceptOrder?: boolean) {
    this.loading = true;
    this.orderService.convertCartToOrder(order, primaryContact, cart, selectedAccount, acceptOrder)
      .subscribe(orderResponse => {
        this.loading = false;
        this.orderConfirmation = orderResponse;
        (this.paymentState === 'PAYNOW') ? this.requestForPayment(this.orderConfirmation) : this.onOrderConfirmed();
      },
        err => {
          this.exceptionService.showError(err);
          this.loading = false;
        });
  }

  /**
   * Prepare payment request transaction data for payment
   *
   * @param user current logged in user details
   * @param billingAccount selected billing account for logged in user
   * @param currentLocale get current user locale with hyphen
   * @returns PaymentTransaction which conatins payment request details
   */
  requestForPayment(orderDetails: Order) {
    this.paymentTransaction = new PaymentTransaction();
    this.paymentTransaction.Currency = defaultTo(get(orderDetails, 'CurrencyIsoCode'),this.configurationService.get('defaultCurrency'));
    this.paymentTransaction.CustomerFirstName = get(this.primaryContact, 'FirstName');
    this.paymentTransaction.CustomerLastName = get(this.primaryContact, 'LastName');
    this.paymentTransaction.CustomerEmailAddress = get(this.primaryContact, 'Email');
    this.paymentTransaction.CustomerAddressLine1 = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingStreet') : get(this.primaryContact, 'MailingStreet');
    this.paymentTransaction.CustomerAddressCity = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingCity') : get(this.primaryContact, 'MailingCity');
    this.paymentTransaction.CustomerAddressStateCode = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingAddress.stateCode') : get(this.primaryContact, 'MailingStateCode');
    this.paymentTransaction.CustomerAddressCountryCode = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingAddress.countryCode') : get(this.primaryContact, 'MailingCountryCode');
    this.paymentTransaction.CustomerAddressPostalCode = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingAddress.postalCode') : get(this.primaryContact, 'MailingPostalCode');
    this.paymentTransaction.CustomerBillingAccountName = get(orderDetails.BillToAccount, 'Name');
    this.paymentTransaction.CustomerBillingAccountID = get(orderDetails.BillToAccount, 'Id');
    this.paymentTransaction.isUserLoggedIn = this.isLoggedIn;
    this.paymentTransaction.OrderAmount =  this.orderAmount;
    this.paymentTransaction.Locale = this.currentUserLocale ;
    this.paymentTransaction.OrderName = get(orderDetails, 'Name') ;
    this.paymentTransaction.OrderGeneratedID = get(orderDetails, 'Id');
    this.isPayForOrderEnabled = true;
    this.pricingSummaryType = '';
  }

  /**
   * Submit paymen request for selected payment method
  */
  submitPayment() {
    this.isMakePaymentRequest = true;
    this.priceSummary.setLoading(true);
  }

  /**
   * Set the PAYNOW option if payment method exist
  */
  selectDefaultPaymentOption(isPaymentMethodExist) {
    if (isPaymentMethodExist) {
      this.paymentState = 'PAYNOW';
    }
    else {
      this.paymentState = '';
    }
  }
  /**
   * Enabled make payment button if method selected
  */
  onSelectingPaymentMethod(eve) {
    setTimeout(() => {
      if (eve) {
        this.pricingSummaryType = 'paymentForOrder';
      }
      else {
        this.pricingSummaryType = '';
      }
    });
  }

  /**
   * set event true of payment complete
  */
  onPaymentComplete(paymentStatus: string) {
    if (paymentStatus !== 'Success') {
      this.translate.stream(['PAYMENT_METHOD_LABELS.ERROR_MSG', 'PAYMENT_METHOD_LABELS.ERROR_TITLE']).subscribe((val: string) => {
        this.toastr.error(val['PAYMENT_METHOD_LABELS.ERROR_MSG'] + paymentStatus, val['PAYMENT_METHOD_LABELS.ERROR_TITLE']);
      });
    }
    this.isPaymentCompleted = true;
    if (get(this.orderConfirmation, 'Id'))
      this.subscriptions.push(this.emailService.guestUserNewOrderNotification(this.orderConfirmation.Id, `https://${window.location.hostname}${window.location.pathname}#/Orders/${this.orderConfirmation.Id}`).subscribe());
  }

  /**
    * Redirect to Order detail page
   */
  redirectOrderPage() {
    this.ngZone.run(() => {
      this.router.navigate(['/orders', this.orderConfirmation.Id]);
    });
  }

  onOrderConfirmed() {
    const ngbModalOptions: ModalOptions = {
      backdrop: 'static',
      keyboard: false,
      class: 'modal-lg'
    };
    this.confirmationModal = this.modalService.show(this.confirmationTemplate, ngbModalOptions);
    if (get(this.orderConfirmation, 'Id'))
    this.emailService.guestUserNewOrderNotification(this.orderConfirmation.Id, `${this.configurationService.resourceLocation()}orders/${this.orderConfirmation.Id}`).pipe(take(1)).subscribe();
  }


  closeModal() {
    this.confirmationModal.hide();
    this.redirectOrderPage();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}