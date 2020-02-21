import { Component, OnInit, TemplateRef, NgZone, OnDestroy } from '@angular/core';
import { CartService, Cart, PriceService } from '@apttus/ecommerce';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { get, set } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { take, map, switchMap } from 'rxjs/operators';

/**
 * Cart list Component loads and shows all the carts for logged in user.
 */
@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss']
})
export class CartListComponent implements OnInit, OnDestroy {

  modalRef: BsModalRef;
  message: string;
  loading: boolean = false;
  cart: Cart;
  view$: Observable<CartListView>;
  /**
   * Current page used by the pagination component. Default is 1.
   */
  currentPage: number = 1;
  /**
   * Number of records per page used by the pagination component. Default is 10.
   */
  limit: number = 10;
  /**
   * Control over button's text/label of pagination component for Multi-Language Support
   */
  paginationButtonLabels: any = {
    first: '',
    previous: '',
    next: '',
    last: ''
  };

  private subscriptions: Subscription[] = [];

  /**
   * @ignore
   */
  constructor(private cartService: CartService, public priceService: PriceService, private modalService: BsModalService, private ngZone: NgZone, private translateService: TranslateService) { }

  /**
   * @ignore
   */
  ngOnInit() {
    this.loadView();
    this.subscriptions.push(this.translateService.stream('PAGINATION').subscribe((val: string) => {
      this.paginationButtonLabels.first = val['FIRST'];
      this.paginationButtonLabels.previous = val['PREVIOUS'];
      this.paginationButtonLabels.next = val['NEXT'];
      this.paginationButtonLabels.last = val['LAST'];
    }));
  }
  /** @ignore */
  loadView() {
    this.view$ = combineLatest(
      this.cartService.getMyCart(),
      this.cartService.getMyCarts(this.limit, this.currentPage),
    ).pipe(
      switchMap(([currentCart, cartList]) => {
        return combineLatest(
          of(currentCart),
          of(cartList),
          this.cartService.query({
            aggregate: true,
            skipCache: true
          })
        );
      }),
      map(([currentCart, cartList, aggregate]) => {
        return {
          currentCart: currentCart,
          cartList: cartList,
          totalCarts: get(aggregate, 'total_records')
        } as CartListView;
      })
    );
  }
  /** @ignore */
  loadCarts(event: any) {
    if (get(event, 'page') !== this.currentPage) {
      this.currentPage = get(event, 'page');
      this.loadView();
    }
  }

  /**
   * Creates new cart for logged in user based on input.
   * @param template Modal input for taking user inputs for new cart.
   */
  newCart(template: TemplateRef<any>) {
    this.cart = new Cart();
    this.message = null;
    this.modalRef = this.modalService.show(template);
  }

  /**
   * Deletes given cart for logged in user.
   * @param cart Cart to delete.
   */
  deleteCart(cart: Cart) {
    cart._metadata = { state: 'processing' };
    this.cartService.deleteCart(cart).pipe(take(1)).subscribe(
      res => { },
      err => {
        set(cart, '_metadata.state', 'ready');
      }
    );
  }

  /**
   * Sets given cart to active state.
   * @param cart Cart that needs to be Active.
   */
  setCartActive(cart: Cart) {
    set(cart, '_metadata.state', 'processing');
    this.cartService.setCartActive(cart).pipe(take(1)).subscribe(
      res => {
        set(cart, '_metadata.state', 'ready');
      },
      err => {
        set(cart, '_metadata.state', 'ready');
      }
    );
  }

  /**
   * @ignore
   */
  createCart() {
    this.loading = true;
    this.currentPage = 1;
    this.cartService.createNewCart(this.cart).pipe(take(1)).subscribe(
      res => {
        this.loading = false;
        this.modalRef.hide();
        this.setCartActive(this.cart);
        this.loadView();
      },
      err => {
        this.loading = false;
        this.translateService.get('MY_ACCOUNT.CART_LIST.CART_CREATION_FAILED').pipe(take(1)).subscribe((val: string) => {
          this.message = val;
        });
      }
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}

/** @ignore */
interface CartListView {
  currentCart: Cart;
  cartList: Array<Cart>;
  totalCarts: number;
}
