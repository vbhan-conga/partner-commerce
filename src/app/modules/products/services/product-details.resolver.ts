import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService, ACondition } from '@apttus/core';
import {
  Product,
  CartItem,
  ProductService,
  CartItemService,
  ConstraintRuleService,
  StorefrontService,
  TranslatorLoaderService
} from '@apttus/ecommerce';
import { Observable, zip, BehaviorSubject, Subscription } from 'rxjs';
import { take, map, tap, filter, switchMap } from 'rxjs/operators';
import { isNil, get, first } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ProductDetailsResolver implements Resolve<any> {
  private subject: BehaviorSubject<ProductDetailsState> = new BehaviorSubject<ProductDetailsState>(null);

  private subscription: Subscription;

  constructor(private apiService: ApiService,
    private productService: ProductService,
    private cartItemService: CartItemService,
    private crService: ConstraintRuleService,
    private router: Router,
    private http: HttpClient,
    private storefrontService: StorefrontService,
    private translatorService: TranslatorLoaderService) { }


  state(): BehaviorSubject<ProductDetailsState> {
    return this.subject;
  }

  resolve(route: ActivatedRouteSnapshot): Observable<ProductDetailsState> {
    const routeParams = route.paramMap;
    if (!isNil(this.subscription))
      this.subscription.unsubscribe();
    this.subject.next(null);
    this.subscription = zip(
      this.productService.get([get(routeParams, 'params.id')])
      .pipe(
        switchMap(data => this.translatorService.translateData(data)),
        map(first)
      ),
      this.cartItemService.query({
        conditions: [new ACondition(this.cartItemService.type, 'Id', 'In', [get(routeParams, 'params.cartItem')])],
        skipCache: true
      }),
      this.crService.getRecommendationsForProducts([get(routeParams, 'params.id')])
    ).pipe(
      map(([product, cartitemList, rProductList]) => {
        return {
          product: product as Product,
          recommendedProducts: rProductList,
          relatedTo: first(cartitemList),
          quantity: get(first(cartitemList), 'Quantity', 1)
        };
      })
    ).subscribe(r => this.subject.next(r));

    return this.subject.pipe(
      filter(s => s != null)
      , tap(state => {
        if (!isNil(get(routeParams, 'params.cartItem')) && isNil(state.relatedTo))
          this.router.navigate(['/products', get(state, 'product.Id')]);
      })
      , take(1)
    );
  }
}

/** @ignore */
export interface ProductDetailsState {
  /**
   * The product to display.
   */
  product: Product;
  /**
   * Array of products to act as recommendations.
   */
  recommendedProducts: Array<Product>;
  /**
   * The CartItem related to this product.
   */
  relatedTo: CartItem;
  /**
   * Quantity to set to child components
   */
  quantity: number;
}
