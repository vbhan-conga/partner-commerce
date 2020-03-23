import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Cart, ItemGroup, CartService, Quote, Order, LineItemService } from '@apttus/ecommerce';
import { Observable } from 'rxjs';
import { take, map, filter } from 'rxjs/operators';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class CartResolver implements Resolve<any> {
  cartId;

  constructor(private cartService: CartService) { }

  state(): Observable<ManageCartState> {
    return (this.cartId ? this.cartService.getCartWithId(this.cartId) : this.cartService.getMyCart())
      .pipe(
        filter(c => !_.isNil(c)),
        map(cart => {
          return {
            cart: cart,
            lineItems: LineItemService.groupItems(_.get(cart, 'LineItems')),
            orderOrQuote: _.isNil(_.get(cart, 'Order')) ? _.get(cart,'Proposald') : _.get(cart,'Order')
          } as ManageCartState;
        })
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
  orderOrQuote: Order | Quote;
}