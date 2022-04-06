import { Component, OnInit, ViewChild, TemplateRef, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { Quote, QuoteService, StorefrontService, Storefront, Cart, CartService } from '@congacommerce/ecommerce';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-create-quote',
  templateUrl: `./create-quote.component.html`,
  styles: []
})
export class CreateQuoteComponent implements OnInit {
  @ViewChild('confirmationTemplate') confirmationTemplate: TemplateRef<any>;
  /**
   * Observable of cart
   */
  cart$: Observable<Cart>;
  /**
   * Observable of storfront
   */
  storefront$: Observable<Storefront>;
  /**
 * Stores confirmation model
 */
  confirmationModal: BsModalRef;
  /**
 * Quote Response Object Model
 */
  quoteConfirmation: Quote;
  /**
 * Loading flag for spinner
 */
  loading: boolean = false;
  quoteRequestObj: Quote;
  quoteBreadCrumbObj$: Observable<Quote>;
  disableSubmit: boolean = false;

  constructor(private cartService: CartService, private quoteService: QuoteService, private modalService: BsModalService, private translate: TranslateService, private storefrontService: StorefrontService, private ngZone: NgZone) { }

  ngOnInit() {
    this.quoteRequestObj = new Quote();
    this.cart$ = this.cartService.getMyCart();
  }

  onUpdate($event: Quote) {
    this.quoteRequestObj = $event;
    this.disableSubmit = !this.quoteRequestObj.Primary_Contact;
  }

  /**
   * Method converts cart to quote.
   * @fires convertCartToQuote method.
   * @param instance of quote
   * @returns quote object.
   */
  convertCartToQuote(cart: Cart) {
    if (this.quoteRequestObj.Primary_Contact) {
      this.loading = true;
      const quoteAmountGroup = _.find(_.get(cart, 'SummaryGroups'), c => _.get(c, 'LineType') === 'Grand Total');
      _.set(this.quoteRequestObj, 'Total_Quote_Amount', _.defaultTo(_.get(quoteAmountGroup, 'NetPrice', 0).toString(), '0'));
      this.quoteService.convertCartToQuote(this.quoteRequestObj).pipe(take(1)).subscribe(
        res => {
          this.loading = false;
          this.quoteConfirmation = res;
          this.ngZone.run(() => {
            this.confirmationModal = this.modalService.show(this.confirmationTemplate, { class: 'modal-lg' });
          });
        },
        err => {
          this.loading = false;
        }
      );
    }
  }

}
