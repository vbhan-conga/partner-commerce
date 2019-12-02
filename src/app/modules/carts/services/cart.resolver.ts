import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Cart, ItemGroup, CartService, CartItemService, ConstraintRuleService, Product, Quote, Order, LineItemService } from '@apttus/ecommerce';
import { Observable, combineLatest, of } from 'rxjs';
import { take, map, tap, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class CartResolver implements Resolve<any> {
  cartId;

  constructor(private cartService: CartService, private cartItemService: CartItemService) { }

  state(): Observable<ManageCartState> {
    return (this.cartId ? this.cartService.getCartWithId(this.cartId) : this.cartService.getMyCart())
      .pipe(
        map(cart => ({
            cart: cart,
            lineItems: LineItemService.groupItems(_.get(cart, 'LineItems')),
            orderOrQuote: _.isNil(_.get(cart, 'Order')) ? _.get(cart,'Quote') : _.get(cart,'Order')
          })
        )
      );
  }

  resolve(route: ActivatedRouteSnapshot) {
    const routeParams = route.paramMap;
    this.cartId = _.get(routeParams, 'params.id');
    return this.state().pipe(take(1));
  }

}
/** @ignore */
export interface ManageCartState {
  cart: Cart;
  lineItems: Array<ItemGroup>;
  productList?: Array<Product>;
  orderOrQuote: Order | Quote;
}