import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { ACondition } from '@apttus/core';
import { CartService, Cart, PriceService } from '@apttus/ecommerce';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Observable, Subscription, of } from 'rxjs';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { map, mergeMap } from 'rxjs/operators';
import { TableOptions, FilterOptions, TableAction } from '@apttus/elements';
import { Operator } from '@apttus/core';

/**
 * Cart list Component loads and shows all the carts for logged in user.
 */
@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss']
})
export class CartListComponent implements OnInit, OnDestroy {

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
  cartAggregate$: Observable<any>;
  currentCart: Cart;
  /**
   * Current page used by the pagination component. Default is 1.
   */
  currentPage: number = 1;
  /**
   * Number of records per page used by the pagination component. Default is 10.
   */
  limit: number = 10;
  /** @ignore */
  type = Cart;

  tableOptions: TableOptions = {
    columns: [
      {
        prop: 'Name'
      },
      {
        prop: 'CreatedDate'
      },
      {
        prop: 'NumberOfItems'
      },
      {
        prop: 'IsActive',
        label: 'Is Active',
        value:(record: Cart) => this.isCartActive(this.currentCart, record) ? of('Yes') : of('No')
      },
      {
        prop: 'TotalAmount',
        label: 'Total Amount',
        value:(record: Cart) => this.getCartTotal(record)
      },
      {
        prop: 'Status'
      }
    ],
    actions: [
      {
        enabled: true,
        icon: 'fa-check',
        massAction: false,
        label: 'Set Active',
        theme: 'primary',
        validate:(record: Cart) => this.canActivate(this.currentCart, record),
        action:(recordList: Array<Cart>) => this.cartService.setCartActive(_.first(recordList)).pipe(map(cart => null))
      } as TableAction,
      {
        enabled: true,
        icon: 'fa-trash',
        massAction: true,
        label: 'Delete',
        theme: 'danger',
        validate:(record: Cart) => this.canDelete(record),
        action:(recordList: Array<Cart>) => this.cartService.deleteCart(recordList).pipe(map(res => null))
      } as TableAction
    ],
    highlightRow:(record: Cart) => of(this.isCartActive(this.currentCart, record))
  };

  filterOptions: FilterOptions = {
    visibleFields: [
      'CreatedDate'
    ],
    visibleOperators: [
      Operator.EQUAL,
      Operator.LESS_THAN,
      Operator.GREATER_THAN,
      Operator.GREATER_EQUAL,
      Operator.LESS_EQUAL,
      Operator.IN
    ]
  };

  private subscriptions: Subscription[] = [];

  /**
   * @ignore
   */
  constructor(private cartService: CartService, public priceService: PriceService,
      private modalService: BsModalService, private translateService: TranslateService) { }
  /**
   * @ignore
   */
  ngOnInit() {
    this.currentCart$ = this.cartService.getMyCart()
      .pipe(map(cart => (_.isNil(cart)) ? new Cart() : cart));
    this.subscriptions.push(this.currentCart$.subscribe((currCart) => this.currentCart = currCart));
    this.cartAggregate$ = this.cartService.query({ conditions: [new ACondition(Cart, 'Id', 'NotNull', null)], aggregate: true });
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

  /**
   * This function returns Observable of NetPrice
   * @param currentCart Current cart object from where we need to fetch cart total.
   */
  getCartTotal(currentCart: Cart) {
    return this.priceService.getCartPrice(currentCart).pipe(mergeMap((price) => { return price.netPrice$; }));
  }
  /**@ignore */
  canDelete(cartToDelete: Cart) {
    return (cartToDelete.Status !== 'Finalized');
  }
  /**@ignore */
  canActivate(currentActiveCart: Cart, rowCart: Cart) {
    return (rowCart.Status !== 'Finalized') && (currentActiveCart.Id !== rowCart.Id);
  }
  /**@ignore */
  isCartActive(currentActiveCart: Cart, rowCart: Cart) {
    return (currentActiveCart.Id === rowCart.Id);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
