import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Cart, CartService, ConstraintRuleService, LineItemService, Product, Order, Quote, ItemGroup } from '@congacommerce/ecommerce';
import { Observable, combineLatest } from 'rxjs';
import * as _ from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { map as rmap } from 'rxjs/operators';

@Component({
  selector: 'app-cart-detail',
  templateUrl: './cart-detail.component.html',
  styleUrls: ['./cart-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
/**
 * Manage Cart component is used to show the list of cart line item(s)  and summary of the cart.
 */
export class CartDetailComponent implements OnInit {
  @ViewChild('discardChangesTemplate') discardChangesTemplate: TemplateRef<any>;


  discardChangesModal: BsModalRef;
  /**
   * Observable of the information for rendering this view.
   */
  view$: Observable<ManageCartState>;

  constructor(private crService: ConstraintRuleService, 
              private cartService: CartService, 
              private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.view$ = combineLatest([
      this.cartService.getMyCart(),
      this.crService.getRecommendationsForCart()])
      .pipe(
        rmap(([cart, products]) => {
          this.cdr.detectChanges();
          return {
            cart: cart,
            lineItems: LineItemService.groupItems(_.get(cart, 'LineItems')),
            orderOrQuote: _.isNil(_.get(cart, 'Order')) ? _.get(cart, 'Proposald') : _.get(cart, 'Order'),
            productList: products
          } as ManageCartState;
        })
      );
  }

  trackById(index, record): string {
    return _.get(record, 'MainLine.Id');
  }
}

/** @ignore */
export interface ManageCartState {
  cart: Cart;
  lineItems: Array<ItemGroup>;
  orderOrQuote: Order | Quote;
  productList: Array<Product>;
}