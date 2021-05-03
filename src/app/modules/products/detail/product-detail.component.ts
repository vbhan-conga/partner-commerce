import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, get, isNil, find, forEach, maxBy, filter, last } from 'lodash';
import { combineLatest, Observable, Subscription, of } from 'rxjs';
import { switchMap, map as rmap } from 'rxjs/operators';

import { ApiService } from '@apttus/core';
import {
    CartService,
    CartItem,
    ConstraintRuleService,
    Product,
    ProductService,
    ProductInformationService,
    ProductInformation,
    StorefrontService,
    Storefront
} from '@apttus/ecommerce';
import { ProductConfigurationComponent, ProductConfigurationSummaryComponent, ProductConfigurationService } from '@apttus/elements';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss']
})
/**
 * Product Details Component is the details of the product for standalone and bundle products with attributes and options.
 */
export class ProductDetailComponent implements OnInit, OnDestroy {

    viewState$: Observable<ProductDetailsState>;
    recommendedProducts$: Observable<Array<Product>>;

    attachments$: Observable<Array<ProductInformation>>;

    cartItemList: Array<CartItem>;
    product: Product;
    subscriptions: Array<Subscription> = new Array<Subscription>();
    
    /**
     * Flag to detect if there is change in product configuration.
     */
    configurationChanged: boolean = false;
    /**
     * Flag to detect if there is pending in product configuration.
     */
    configurationPending: boolean = false;

    quantity: number = 1;

    /** @ignore */
    productCode: string;

    /**@ignore */
    relatedTo: CartItem;

    private configurationLayout: string = null;

    @ViewChild(ProductConfigurationSummaryComponent, { static: false})
    configSummaryModal: ProductConfigurationSummaryComponent;
    @ViewChild(ProductConfigurationComponent, { static: false })
    productConfigComponent: ProductConfigurationComponent;

    constructor(private cartService: CartService,
        private router: Router,
        private route: ActivatedRoute,
        private productService: ProductService,
        private apiService: ApiService,
        private productInformationService: ProductInformationService,
        private storefrontService: StorefrontService,
        private productConfigurationService: ProductConfigurationService,
        private crService: ConstraintRuleService) {
    }

    ngOnInit() {
        this.viewState$ = this.route.params.pipe(
            switchMap(params => {
                this.product = null;
                this.cartItemList = null;
                const product$ = (this.product instanceof Product && get(params, 'id') === this.product.Id) ? of(this.product) :
                    this.productService.fetch(get(params, 'id'));
                const cartItem$ = (get(params, 'cartItem')) ? this.apiService.get(`/Apttus_Config2__LineItem__c/${get(params, 'cartItem')}?lookups=AttributeValue,AssetLineItem,PriceList,PriceListItem,Product,TaxCode`, CartItem,) : of(null);
                return combineLatest([product$, cartItem$, this.storefrontService.getStorefront()]);
            }),
            rmap(([product, cartItemList, storefront]) => {
                return {
                    product: product as Product,
                    relatedTo: cartItemList,
                    quantity: get(cartItemList, 'Quantity', 1),
                    storefront: storefront
                };
            })
        );

        this.recommendedProducts$ = this.route.params.pipe(
            switchMap(params => this.crService.getRecommendationsForProducts([get(params, 'id')])),
            rmap(r => Array.isArray(r) ? r : [])
        );

        this.attachments$ = this.route.params.pipe(
            switchMap(params => this.productInformationService.getProductInformation(get(params, 'id')))
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

        if (get(cartItems, 'LineItems') && this.configurationLayout === 'Embedded') {
            cartItems = get(cartItems, 'LineItems');
        }
        this.relatedTo = primaryItem;
        if (!isNil(primaryItem) && (get(primaryItem, 'HasOptions') || get(primaryItem, 'HasAttributes')))
            this.router.navigate(['/products', get(this, 'product.Id'), get(primaryItem, 'Id')]);

        if (this.quantity <= 0) {
            this.quantity = 1;
        }

        this.productConfigurationService.onChangeConfiguration({
            product: get(this, 'product'),
            itemList: cartItems,
            configurationFlags: null,
            configurationPending: false
        });
    }

    /**
     * Change the product quantity and update the primary cartItem
     * to see the updated the netprice of the product.
     */
     changeProductQuantity(newQty: any) {
        if (this.cartItemList && this.cartItemList.length > 0)
            forEach(this.cartItemList, c => {
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
        if (isNil(this.relatedTo)) {
            primaryItem = maxBy(filter(cartItems, i => get(i, 'LineType') === 'Product/Service' && isNil(get(i, 'Option')) && get(this, 'product.Id') === get(i, 'ProductId')), 'PrimaryLineNumber');
        }
        else {
            primaryItem = find(cartItems, i => get(i, 'LineType') === 'Product/Service' && i.PrimaryLineNumber === get(this, 'relatedTo.PrimaryLineNumber') && isNil(get(i, 'Option')));
        }
        return primaryItem;
    }

    ngOnDestroy() {
        forEach(this.subscriptions, item => {
            if (item) item.unsubscribe();
        });
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
    /**
     * The storefront.
     */
    storefront: Storefront;
}
