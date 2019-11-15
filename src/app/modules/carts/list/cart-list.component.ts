import { Component, OnInit, TemplateRef, NgZone } from '@angular/core';
import { ACondition } from '@apttus/core';
import { CartService, Cart, PriceService } from '@apttus/ecommerce';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { take, map } from 'rxjs/operators';

/**
 * Cart list Component loads and shows all the carts for logged in user.
 */
@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss']
})
export class CartListComponent implements OnInit {

  /**
   * All carts for logged in user.
   */
  cartList$: Observable<Array<Cart>>;
  currentCart$: Observable<Cart>;
  modalRef: BsModalRef;
  message: string;
  loading: boolean = false;
  cart: Cart;
  cartAggregate: any;
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

  /**
   * @ignore
   */
  constructor(private cartService: CartService, public priceService: PriceService, private modalService: BsModalService, private ngZone: NgZone, private translateService: TranslateService) { }

  /**
   * @ignore
   */
  ngOnInit() {
    this.currentCart$ = this.cartService.getMyCart()
      .pipe(
        map(cart => (_.isNil(cart)) ? new Cart() : cart)
      );
    this.cartService.aggregate([new ACondition(Cart, 'Id', 'NotNull', null)]).pipe(take(1)).subscribe(res => this.cartAggregate = res);
    this.loadCarts(this.currentPage);
    this.translateService.stream('PAGINATION').subscribe((val: string) => {
      this.paginationButtonLabels.first = val['FIRST'];
      this.paginationButtonLabels.previous = val['PREVIOUS'];
      this.paginationButtonLabels.next = val['NEXT'];
      this.paginationButtonLabels.last = val['LAST'];
    });
  }

  /**
   * It loads all the cart of logged in user for given page number.
   * @param page Page number to load cart list.
   */
  loadCarts(page) {
    this.cartList$ = this.cartService.getMyCarts(this.limit, page);
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
    this.cartService.deleteCart(cart).subscribe(
      res => { },
      err => {
        _.set(cart, '_metadata.state', 'ready');
      }
    );
  }

  /**
   * Sets given cart to active state.
   * @param cart Cart that needs to be Active.
   */
  setCartActive(cart: Cart) {
    _.set(cart, '_metadata.state', 'processing');
    this.cartService.setCartActive(cart).subscribe(
      res => {
        _.set(cart, '_metadata.state', 'ready');
      },
      err => {
        _.set(cart, '_metadata.state', 'ready');
      }
    );
  }

  /**
   * @ignore
   */
  createCart() {
    this.loading = true;
    this.currentPage = 1;
    this.cartService.createNewCart(this.cart).subscribe(
      res => {
        this.loading = false;
        this.modalRef.hide();
      },
      err => {
        this.loading = false;
        this.translateService.stream('MY_ACCOUNT.CART_LIST.CART_CREATION_FAILED').subscribe((val: string) => {
          this.message = val;
        });
      }
    );
  }
}
