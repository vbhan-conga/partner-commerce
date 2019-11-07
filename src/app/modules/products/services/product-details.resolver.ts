import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Product, CartItem, ProductService, CartItemService, ConstraintRuleService } from '@apttus/ecommerce';
import { Observable, zip, BehaviorSubject, Subscription } from 'rxjs';
import { take, map, tap, filter } from 'rxjs/operators';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductDetailsResolver implements Resolve<any> {
  private subject: BehaviorSubject<ProductDetailsState> = new BehaviorSubject<ProductDetailsState>(null);
  private subscription: Subscription;

  constructor(private productService: ProductService, private cartItemService: CartItemService, private crService: ConstraintRuleService, private router: Router, private http: HttpClient) {}


  state(): BehaviorSubject<ProductDetailsState> {
    return this.subject;
  }

  resolve(route: ActivatedRouteSnapshot): Observable<ProductDetailsState> {
    const routeParams = route.paramMap;
    if(!_.isNil(this.subscription))
      this.subscription.unsubscribe();
    this.subject.next(null);
    this.subscription  = zip(
      this.productService.get([_.get(routeParams, 'params.id')]),
      this.cartItemService.get([_.get(routeParams, 'params.cartItem')]),
      this.crService.getRecommendationsForProducts([_.get(routeParams, 'params.id')])
    ).pipe(
      map(([productList, cartitemList, rProductList]) => {
        return {
          product: _.first(productList),
          recommendedProducts: rProductList,
          relatedTo: _.first(cartitemList)
        };
      })
    ).subscribe(r => this.subject.next(r));

    return this.subject.pipe(
      filter(s => s != null)
      ,tap(state => {
        if(!_.isNil(_.get(routeParams, 'params.cartItem')) && _.isNil(state.relatedTo))
          this.router.navigate(['/products', _.get(state, 'product.Id')]);
      })
      ,take(1)
    );
  }
}

export interface ProductDetailsState {
  product: Product;
  recommendedProducts: Array<Product>;
  relatedTo: CartItem;
}
