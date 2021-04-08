import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, get, isNil, find, has, forEach, maxBy, filter } from 'lodash';
import { combineLatest, Observable, Subscription, of } from 'rxjs';
import { switchMap, map as rmap } from 'rxjs/operators';

import { ApiService } from '@apttus/core';
import { CartService, CartItem, Storefront, StorefrontService, Product, ProductService, TranslatorLoaderService, ConstraintRuleService } from '@apttus/ecommerce';
import { ProductConfigurationSummaryComponent, ProductConfigurationService } from '@apttus/elements';
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
    product: Product;
    viewState$: Observable<ProductDetailsState>;    
    recommendedProducts$: Observable<Array<Product>>;
    
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

    @ViewChild(ProductConfigurationSummaryComponent) configSummaryModal: ProductConfigurationSummaryComponent;
    subscriptions: Array<Subscription> = [];

    constructor(private cartService: CartService,
        private router: Router,
        private route: ActivatedRoute,
        private productService: ProductService,
        private storefrontService: StorefrontService,
        private translatorService: TranslatorLoaderService,
        private apiService: ApiService,
        private crService: ConstraintRuleService,
        private productConfigurationService: ProductConfigurationService) { }

    ngOnInit() {
        this.viewState$ = this.route.params.pipe(
            switchMap(params => {
                this.productConfigurationService.onChangeConfiguration(null);
                return combineLatest([
                    this.productService.get([get(params, 'id')])
                        .pipe(
                            switchMap(data => this.translatorService.translateData(data)),
                            rmap(first)
                        ),
                    (get(params, 'cartItem')) ? this.apiService.get(`/Apttus_Config2__LineItem__c/${get(params, 'cartItem')}?lookups=AttributeValue,PriceList,PriceListItem,Product,TaxCode`, CartItem) : of(null)
                ])
            }),
            switchMap(([product, cartitemList]) => combineLatest([of([product, cartitemList]), this.storefrontService.getStorefront()])),
            rmap(([[product, cartitemList], storefront]) => {
                this.configurationLayout = storefront.ConfigurationLayout;
                this.relatedTo = cartitemList;
                this.product = product;
                return {
                    product: product as Product,
                    relatedTo: cartitemList,
                    quantity: get(cartitemList, 'Quantity', 1),
                    storefront: storefront
                };
            })
        );

        this.recommendedProducts$ = this.route.params.pipe(
            switchMap(params => this.crService.getRecommendationsForProducts([get(params, 'id')])),
            rmap(r =>  Array.isArray(r) ? r : [])
        );

        this.subscriptions.push(this.productConfigurationService.configurationChange.subscribe(response => {
            if (response && has(response, 'configurationPending')) {
                this.configurationPending = get(response, 'configurationPending');
            }
            else {
                this.product = get(response, 'product');
                this.cartItemList = get(response, 'itemList');
                if (get(response, 'configurationFlags.optionChanged') || get(response, 'configurationFlags.attributeChanged')) this.configurationChanged = true;
            }
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

        if (get(cartItems, 'LineItems') && this.configurationLayout === 'Embedded') {
            cartItems = get(cartItems, 'LineItems');
        }
        const primaryItem = this.getPrimaryItem(cartItems);
        this.relatedTo = primaryItem;
        if (!isNil(primaryItem) && (get(primaryItem, 'HasOptions') || get(primaryItem, 'HasAttributes')))
            this.router.navigate(['/products', get(this, 'product.Id'), get(primaryItem, 'Id')]);

        if (this.quantity <= 0) {
            this.quantity = 1;
        }
    }

    changeProductQuantity(newQty: any) {
        if (this.cartItemList && this.cartItemList.length > 0) {
            forEach(this.cartItemList, c => {
                if (c.LineType === 'Product/Service') c.Quantity = newQty;
                this.productConfigurationService.changeProductQuantity(newQty);
            });
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