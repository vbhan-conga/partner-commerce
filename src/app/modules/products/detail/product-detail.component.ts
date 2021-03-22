import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, map as rmap } from 'rxjs/operators';
import { first, last, get, isNil, find } from 'lodash';

import { ApiService } from '@apttus/core';
import { CartService, CartItem, Product, ProductService, TranslatorLoaderService, ConstraintRuleService } from '@apttus/ecommerce';
import { ProductConfigurationSummaryComponent } from '@apttus/elements';
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  cartItemList: Array<CartItem>;
  product: Product;
  viewState$: Observable<ProductDetailsState>

  /**
   * Flag to detect if their is change in product configuration.
   */
  configurationChanged = false;

  quantity = 1;

  /** @ignore */
  productCode: string;

  @ViewChild(ProductConfigurationSummaryComponent, { static: false })
  configSummaryModal: ProductConfigurationSummaryComponent;

  constructor(private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private translatorService: TranslatorLoaderService,
    private apiService: ApiService,
    private crService: ConstraintRuleService) { }

  ngOnInit() {
    this.viewState$ = this.route.params.pipe(
      switchMap(params => combineLatest([
        this.productService.get([get(params, 'id')])
          .pipe(
            switchMap(data => this.translatorService.translateData(data)),
            rmap(first)
          ),
        (get(params, 'cartItem')) ? this.apiService.get(`/Apttus_Config2__LineItem__c/${get(params, 'cartItem')}?lookups=AttributeValue,PriceList,PriceListItem,Product,TaxCode`, CartItem,) : of(null),
        this.crService.getRecommendationsForProducts([get(params, 'id')])
      ])),
      rmap(([product, cartitemList, rProductList]) => {
        return {
          product: product as Product,
          recommendedProducts: rProductList,
          relatedTo: cartitemList,
          quantity: get(cartitemList, 'Quantity', 1)
        };
      })
    );
  }

  /**
   * onConfigurationChange method is invoked whenever there is change in product configuration and this method sets flag
   * isConfigurationChanged to true.
   */
  onConfigurationChange(result: any) {
    this.product = first(result);
    this.cartItemList = result[1];
    if (get(last(result), 'optionChanged') || get(last(result), 'attributeChanged')) this.configurationChanged = true;
  }

  /**
   * Changes the quantity of the cart item passed to this method.
   *
   * @param cartItem Cart item reference to the cart line item object.
   * @fires CartService.updateCartItems()
   */

  handleStartChange(cartItem: CartItem) {
    this.cartService.updateCartItems([cartItem]);
  }

  onAddToCart(cartItems: Array<CartItem>): void {
    this.configurationChanged = false;
    const primaryItem = find(cartItems, i => get(i, 'IsPrimaryLine') === true && isNil(get(i, 'Option')));
    if (!isNil(primaryItem) && (get(primaryItem, 'Product.HasOptions') || get(primaryItem, 'Product.HasAttributes'))) {
      this.router.navigate(['/products', get(this, 'product.Id'), get(primaryItem, 'Id')]);
    }

    if (this.quantity <= 0) {
      this.quantity = 1;
    }
  }

  /**
   * Changes the quantity of the cart item passed to this method.
   *
   * @param cartItem Cart item reference to the cart line item object.
   * @fires CartService.updateCartItems()
   */
  handleEndDateChange(cartItem: CartItem) {
    this.cartService.updateCartItems([cartItem]);
  }

  showSummary() {
    this.configSummaryModal.show();
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
