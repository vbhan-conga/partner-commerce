import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ConfigurationService } from '@apttus/core';
import { CartService, CartItem, Storefront, StorefrontService, BundleProduct, Cart } from '@apttus/ecommerce';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ProductConfigurationSummaryComponent, ProductConfigurationService } from '@apttus/elements';
import { ProductDetailsState, ProductDetailsResolver } from '../services/product-details.resolver';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss']
})
/**
 * Product Details Component is the details of the product for standalone and bundle products with attributes and options.
 */
export class ProductDetailComponent implements OnInit, OnDestroy {

    cartItemList: Array<CartItem>;
    product: BundleProduct;
    viewState$: BehaviorSubject<ProductDetailsState>;

    /**
     * Flag to detect if there is change in product configuration.
     */
    configurationChanged: boolean = false;

    quantity: number = 1;
    /**
     * Flag used in update configuration method
     */
    saving: boolean = false;
    /**
     * Default term is set to 1.
     */
    term: number = 1;

    /** @ignore */
    productCode: string;

    /**@ignore */
    relatedTo: CartItem;
    private endpoint: string;


    @ViewChild(ProductConfigurationSummaryComponent, { static: false })
    configSummaryModal: ProductConfigurationSummaryComponent;
    subscriptions: Array<Subscription> = [];

    constructor(private cartService: CartService,
        private resolver: ProductDetailsResolver,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private storefrontService: StorefrontService,
        private productConfigurationService: ProductConfigurationService,
        private configurationService: ConfigurationService) {
    }

    ngOnInit() {
        this.resolver
            .resolve(this.activatedRoute.snapshot)
            .pipe(take(1))
            .subscribe(() => {
                this.viewState$ = this.resolver.state();
                this.relatedTo = this.viewState$.value.relatedTo;
            });
        this.subscriptions.push(this.productConfigurationService.configurationChange.subscribe(response => {
            this.product = _.get(response,'product');
            this.cartItemList = _.get(response,'itemList');
            if (_.get(response, 'configurationFlags.optionChanged') || _.get(response, 'configurationFlags.attributeChanged')) this.configurationChanged = true;
        }));
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
        if (_.get(cartItems, 'LineItems') && this.viewState$.value.storefront.ConfigurationLayout === 'Embedded') cartItems = _.get(cartItems, 'LineItems');
        const primaryItem = this.getPrimaryItem(cartItems);
        this.relatedTo = primaryItem;
        if (!_.isNil(primaryItem) && (_.get(primaryItem, 'Product.HasOptions') || _.get(primaryItem, 'Product.HasAttributes'))) {
            this.router.navigate(['/products', _.get(this, 'viewState$.value.product.Id'), _.get(primaryItem, 'Id')]);
        }
        if (this.quantity <= 0) {
            this.quantity = 1;
        }
    }

    changeProductQuantity(newQty: any) {
        if (this.cartItemList && this.cartItemList.length > 0)
            _.forEach(this.cartItemList, c => {
                if (c.LineType === 'Product/Service') c.Quantity = newQty;
                this.productConfigurationService.changeProductQuantity(newQty);
            });
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

    getPrimaryItem(cartItems: Array<CartItem>): CartItem {
        let primaryItem: CartItem;
        if (_.isNil(this.viewState$.value.relatedTo))
            primaryItem = _.maxBy(_.filter(cartItems, i => _.get(i, 'IsPrimaryLine') === true && _.isNil(_.get(i, 'Option'))), 'PrimaryLineNumber');
        else
            primaryItem = _.find(cartItems, i => _.get(i, 'IsPrimaryLine') === true && i.PrimaryLineNumber === _.get(this.viewState$.value.relatedTo, 'PrimaryLineNumber') && _.isNil(_.get(i, 'Option')));
        return primaryItem;
    }

    ngOnDestroy() {
        _.forEach(this.subscriptions, (item) => item.unsubscribe());
    }
}