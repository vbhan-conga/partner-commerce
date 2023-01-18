import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ConfigurationService, ACondition } from '@congacommerce/core';
import { ProductService, Product,  Cart, CartService } from '@congacommerce/ecommerce';
import { ProductDrawerService, BatchSelectionService} from '@congacommerce/elements';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-compare-layout',
  templateUrl: './compare-layout.component.html',
  styleUrls: ['./compare-layout.component.scss']
})
export class CompareLayoutComponent implements OnInit, OnDestroy {
  /**
   * Array of products to check is theri any product exist.
   */
  products: Array<Product>;
  /**
  * The product identifier set in the configuration file.
  */
  identifiers: Array<string>;
  /**
  * Defined default value if one not found in configuration.
  */
  identifier: string = 'Id';
  /**
  * Defined default value if one not found in configuration.
  */
   cart$: Observable<Cart>;

  constructor(private config: ConfigurationService, private activatedRoute: ActivatedRoute, private cartService: CartService, private router: Router, private productService: ProductService, private batchSelectionService: BatchSelectionService, private productDrawerService: ProductDrawerService) {
    this.identifier = this.config.get('productIdentifier');
  }

  /**
    * Current subscriptions in this class.
    * @ignore
  */
  private subs: Array<any> = [];

  /**
   * @ignore
   */
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.cart$ = this.cartService.getMyCart();
      let newIdentifiers = decodeURIComponent(params.products).split(',');
      if (newIdentifiers.length > 5) {
        newIdentifiers = newIdentifiers.splice(0, 5);
        this.router.navigateByUrl(`/products/compare?products=${newIdentifiers.join(',')}`);
      }
      else {
        const conditions: Array<ACondition> = new Array(new ACondition(this.productService.type, this.identifier, 'In', newIdentifiers));
        this.subs.push(this.productService.getProducts(null, null, null, null, null, null, conditions).pipe(map(res => res.Products)).subscribe(products => {
          const tableProducts = products.filter(product => newIdentifiers.includes(product[this.identifier]));
          this.products = tableProducts;
          this.batchSelectionService.setSelectedProducts(tableProducts);
          if (newIdentifiers.length < 2) this.router.navigateByUrl('/');
          this.identifiers = tableProducts.map(product => product[this.identifier]);
          this.productDrawerService.closeDrawer();
          // wait for product drawer subscription to fire to close drawer if on the compare page.
          setTimeout(() => {
            this.productDrawerService.closeDrawer();
          }, 0);
        }));
      }
    });
  }

 /**
   * @ignore
   */
  ngOnDestroy() {
    if (this.subs && this.subs.length > 0) {
      this.subs.forEach(sub => sub.unsubscribe());
    }
  }

}
