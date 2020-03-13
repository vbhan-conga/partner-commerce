import { Component, OnInit, TemplateRef } from '@angular/core';
import { AObject } from '@apttus/core';
import { CartService, Cart, PriceService } from '@apttus/ecommerce';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Observable, of, combineLatest } from 'rxjs';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { map, mergeMap, take } from 'rxjs/operators';
import { TableOptions, TableAction } from '@apttus/elements';
import { ClassType } from 'class-transformer/ClassTransformer';

/**
 * Cart list Component loads and shows all the carts for logged in user.
 */
@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss']
})
export class CartListComponent implements OnInit {
  modalRef: BsModalRef;
  message: string;
  loading: boolean = false;
  cart: Cart;
  view$: Observable<CartListView>;
  /** @ignore */
  type = Cart;

  /**
   * @ignore
   */
  constructor(private cartService: CartService, public priceService: PriceService,
      private modalService: BsModalService, private translateService: TranslateService) { }
  /**
   * @ignore
   */
  ngOnInit() {
    this.loadView();
  }
  /** @ignore */
  loadView() {
    this.view$ = this.cartService.getMyCart()
    .pipe(
      map((currentCart) => {
        return {
          tableOptions: {
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
                value:(record: Cart) => this.isCartActive(currentCart, record) ? of('Yes') : of('No')
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
                validate:(record: Cart) => this.canActivate(currentCart, record),
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
            highlightRow:(record: Cart) => of(this.isCartActive(currentCart, record))
          },
          type: Cart
        } as CartListView;
      })
    );
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
    this.cartService.createNewCart(this.cart).pipe(take(1)).subscribe(
      res => {
        this.loading = false;
        this.modalRef.hide();
        this.loadView();
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
    return (rowCart.Status !== 'Finalized') && (_.get(currentActiveCart, 'Id') !== _.get(rowCart, 'Id'));
  }
  /**@ignore */
  isCartActive(currentActiveCart: Cart, rowCart: Cart) {
    return (_.get(currentActiveCart, 'Id') === _.get(rowCart, 'Id'));
  }

}
/** @ignore */
interface CartListView {
  tableOptions: TableOptions;
  type: ClassType<AObject>;
}