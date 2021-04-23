import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, map as rmap } from 'rxjs/operators';
import { first, last, get, isNil, find, forEach, set } from 'lodash';

import { ApiService } from '@apttus/core';
import { CartService, CartItem, Product, ProductService, ProductInformationService, ConstraintRuleService } from '@apttus/ecommerce';
import { ProductConfigurationComponent, ProductConfigurationSummaryComponent } from '@apttus/elements';
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  viewState$: Observable<ProductDetailsState>;
  recommendedProducts$: Observable<Array<Product>>;
  cartItemList: Array<CartItem>;
  product: Product;

  /**
   * Flag to detect if their is change in product configuration.
   */
  configurationChanged = false;

  quantity = 1;

  /** @ignore */
  productCode: string;

  @ViewChild(ProductConfigurationSummaryComponent, { static: false })
  configSummaryModal: ProductConfigurationSummaryComponent;

  @ViewChild(ProductConfigurationComponent, { static: false })
    productConfigComponent: ProductConfigurationComponent;

  constructor(private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private productInformationService: ProductInformationService,
    private apiService: ApiService,
    private crService: ConstraintRuleService) {
  }

  ngOnInit() {
    this.viewState$ = this.route.params.pipe(
      switchMap(params => {
        const product$ = (this.product instanceof Product && get(params, 'id') === this.product.Id) ? of(this.product) :
          this.productService.fetch(get(params, 'id'));
        const cartItem$ = (get(params, 'cartItem')) ? this.apiService.get(`/Apttus_Config2__LineItem__c/${get(params, 'cartItem')}?lookups=AttributeValue,AssetLineItem,PriceList,PriceListItem,Product,TaxCode`, CartItem,) : of(null);
        const attachments$ = this.productInformationService.getProductInformation(get(params, 'id'))
        return combineLatest([product$, cartItem$, attachments$]);
      }),
      rmap(([product, cartItemList, attachments]) => {
        set(product, 'ProductInformation', attachments);
        return {
          product: product as Product,
          relatedTo: cartItemList,
          quantity: get(cartItemList, 'Quantity', 1)
        };
      })
    );

    this.recommendedProducts$ = this.route.params.pipe(
      switchMap(params => this.crService.getRecommendationsForProducts([get(params, 'id')])),
      rmap(r => Array.isArray(r) ? r : [])
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
   * Change the product quantity and update the primary cartItem
   * to see the updated the netprice of the product.
   */
  changeProductQuantity(newQty: any) {
    if (this.cartItemList && this.cartItemList.length > 0)
      forEach(this.cartItemList, c => {
        if (c.LineType === 'Product/Service') c.Quantity = newQty;
        this.productConfigComponent.changeProductQuantity(newQty);
      });
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
   * The CartItem related to this product.
   */
  relatedTo: CartItem;
  /**
  * Quantity to set to child components
  */
  quantity: number;
}
