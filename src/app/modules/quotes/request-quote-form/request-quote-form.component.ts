import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Observable, zip, of, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { get } from 'lodash';
import { AccountService, ContactService, UserService, Quote, QuoteService, PriceListService, Cart, Note, Account, Contact, PriceList } from '@congacommerce/ecommerce';
import { LookupOptions } from '@congacommerce/elements';

import * as moment from 'moment';
@Component({
  selector: 'app-request-quote-form',
  templateUrl: './request-quote-form.component.html',
  styleUrls: ['./request-quote-form.component.scss']
})
export class RequestQuoteFormComponent implements OnInit {
  @Input() cart: Cart;
  @Output() onQuoteUpdate = new EventEmitter<Quote>();

  quote = new Quote();
  bsConfig: Partial<BsDatepickerConfig>;
  startDate: Date = new Date();
  rfpDueDate: Date = new Date();
  _moment = moment;
  note: Note = new Note();
  comments: any = [];

  shipToAccount$: Observable<Account>;
  billToAccount$: Observable<Account>;
  priceList$: Observable<PriceList>;
  lookupOptions: LookupOptions = {
    primaryTextField: 'Name',
    secondaryTextField: 'Email',
    fieldList: ['Id', 'Name', 'Email']
  };
  contactId: string;

  constructor(public quoteService: QuoteService,
    private accountService: AccountService,
    private userService: UserService,
    private plservice: PriceListService,
    private contactService: ContactService) { }

  ngOnInit() {
    this.quote.Name = 'Test';
    combineLatest(this.accountService.getCurrentAccount(), this.userService.me(), (this.cart.Proposald ? this.quoteService.get([get(this.cart, 'Proposald.Id')]) : of(null)))
      .pipe(take(1)).subscribe(([account, user, quote]) => {
        this.quote.ShipToAccount = account;
        this.quote.ShipToAccountId = account.Id;
        this.quote.BillToAccount = account;
        this.quote.BillToAccountId = account.Id;
        this.quote.Account = get(this.cart, 'Account');
        this.quote.Primary_Contact = get(user, 'Contact');
        this.contactId = this.cart.Proposald ? get(quote[0], 'Primary_ContactId') : get(user, 'ContactId');
        if (get(this.cart, 'Proposald.Id')) {
          this.quote = get(this.cart, 'Proposald');
          this.comments = get(quote, '[0].Notes', []);
        }
        this.quoteChange();
        this.getpriceList();
      });
  }

  /**
   * This method adds comments to requesting quote.
   */
  addComment() {
    if (this.quote) {
      this.quote.Description = this.note.Body;
      this.onQuoteUpdate.emit(this.quote);
    }
  }

  /**
   * @ignore
   */
  quoteChange() {
    this.onQuoteUpdate.emit(this.quote);
  }

  shipToChange() {
    if (this.quote.ShipToAccountId) {
      this.shipToAccount$ = this.accountService.getAccount(this.quote.ShipToAccountId);
      this.shipToAccount$.pipe(take(1)).subscribe((newShippingAccount) => {
        this.quote.ShipToAccount = newShippingAccount;
        this.onQuoteUpdate.emit(this.quote);
      });
    } else {
      this.quote.ShipToAccount = null;
      this.shipToAccount$= null;
      this.onQuoteUpdate.emit(this.quote);
    }
  }

  billToChange() {
    if (this.quote.BillToAccountId) {
      this.billToAccount$ = this.accountService.getAccount(this.quote.BillToAccountId);
      this.billToAccount$.pipe(take(1)).subscribe((newBillingAccount) => {
        this.quote.BillToAccount = newBillingAccount;
        this.onQuoteUpdate.emit(this.quote);
      });
    } else {
      this.quote.BillToAccount = null;
      this.billToAccount$= null;
      this.onQuoteUpdate.emit(this.quote);
    }
  }

  getpriceList(){
    this.priceList$=this.plservice.getPriceList();
    this.priceList$.pipe(take(1)).subscribe((newPricelList) => {
      this.quote.PriceList = newPricelList;
      this.onQuoteUpdate.emit(this.quote);
    });
  }
/**
  * Event handler for when the primary contact input changes.
  * @param event The event that was fired.
  */
primaryContactChange() {
  if (this.contactId) {
    this.contactService.fetch(this.contactId)
      .pipe(take(1))
      .subscribe((newPrimaryContact: Contact) => {
        this.quote.Primary_Contact = newPrimaryContact;
        this.quote.Primary_ContactId = newPrimaryContact.Id;
        this.onQuoteUpdate.emit(this.quote);
      });
  } else {
    this.quote.Primary_Contact = null;
    this.onQuoteUpdate.emit(this.quote);
  }
}
}