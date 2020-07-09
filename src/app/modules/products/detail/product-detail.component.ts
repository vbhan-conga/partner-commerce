import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CartService, CartItem, BundleProduct } from '@apttus/ecommerce';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import * as _ from 'lodash';
import { ProductConfigurationSummaryComponent } from '@apttus/elements';
import { ProductDetailsState, ProductDetailsResolver } from '../services/product-details.resolver';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  cartItemList: Array<CartItem>;
  product: BundleProduct;

  viewState$: BehaviorSubject<ProductDetailsState>;

  /**
   * Flag to detect if their is change in product configuration.
   */
  configurationChanged = false;

  quantity = 1;

  /**
   * Flag used in update configuration method
   */
  saving = false;

  /**
   * Default term is set to 1.
   */
  term = 1;

  /** @ignore */
  productCode: string;

  @ViewChild(ProductConfigurationSummaryComponent, { static: false })
  configSummaryModal: ProductConfigurationSummaryComponent;

  constructor(private cartService: CartService,
    private resolver: ProductDetailsResolver,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.resolver
      .resolve(this.activatedRoute.snapshot)
      .pipe(take(1))
      .subscribe(() => (this.viewState$ = this.resolver.state()));
  }

  /**
   * onConfigurationChange method is invoked whenever there is change in product configuration and this method ets flag
   * isConfigurationChanged to true.
   */
  onConfigurationChange(result: any) {
    this.product = _.first(result);
    this.cartItemList = result[1];
    if (_.get(_.last(result), 'optionChanged') || _.get(_.last(result), 'attributeChanged')) this.configurationChanged = true;
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
    const primaryItem = _.find(cartItems, i => _.get(i, 'IsPrimaryLine') === true && _.isNil(_.get(i, 'Option')));
    if (!_.isNil(primaryItem) && (_.get(primaryItem, 'Product.HasOptions') || _.get(primaryItem, 'Product.HasAttributes'))) {
      this.router.navigate(['/products', _.get(this, 'viewState$.value.product.Id'), _.get(primaryItem, 'Id')]);
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
