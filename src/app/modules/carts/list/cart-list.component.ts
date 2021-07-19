import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { combineLatest, Observable, of } from 'rxjs';
import { ClassType } from 'class-transformer/ClassTransformer';
import { TranslateService } from '@ngx-translate/core';
import { map, mergeMap, take } from 'rxjs/operators';
import * as _ from 'lodash';

import { AObject, ACondition, AFilter } from '@apttus/core';
import { CartService, Cart, PriceService, CartApiService } from '@apttus/ecommerce';
import { TableOptions, TableAction } from '@apttus/elements';

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
  cartAggregate$: Observable<any>;
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
    this.view$ = combineLatest(
      this.cartService.getMyCart(),
      this.getCartAggregate()
    )
    .pipe(
      map(([currentCart, cartList]) => {
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
                sortable: false,
                value: (record: Cart) => CartApiService.getCurrentCartId() === record.Id ? of('Yes') : of('No')
              },
              {
                prop: 'TotalAmount',
                label: 'Total Amount',
                sortable: false,
                value: (record: Cart) => this.getCartTotal(record)
              },
              {
                prop: 'Status'
              }
            ],
            lookups: [],
            actions: [
              {
                enabled: true,
                icon: 'fa-check',
                massAction: false,
                label: 'Set Active',
                theme: 'primary',
                validate: (record: Cart) => this.canActivate(record),
                action: (recordList: Array<Cart>) => this.cartService.setCartActive(_.first(recordList), true)
              } as TableAction,
              {
                enabled: true,
                icon: 'fa-trash',
                massAction: true,
                label: 'Delete',
                theme: 'danger',
                validate: (record: Cart) => this.canDelete(record),
                action: (recordList: Array<Cart>) => this.cartService.deleteCart(recordList).pipe(map(res => this.getCartAggregate()))
              } as TableAction
            ],
            highlightRow: (record: Cart) => of(CartApiService.getCurrentCartId() === record.Id),
            children: ['SummaryGroups'],
            filters: this.getFilters()
          },
          type: Cart
        } as CartListView;
      })
    );
  }

  /** @ignore */
  private getCartAggregate(): any {
    return this.cartAggregate$ = this.cartService.query({
      aggregate: true,
      skipCache: true,
      filters: this.getFilters()
    }).pipe(map(_.first));
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
  canActivate(cartToActivate: Cart) {
    return (CartApiService.getCurrentCartId() !== cartToActivate.Id && cartToActivate.Status !== 'Finalized');
  }

  /**@ignore */
  getFilters(): Array<AFilter> {
    return new Array(new AFilter(this.cartService.type, [
      new ACondition(this.cartService.type, 'ParentConfigurationId', 'Equal', null),
      new ACondition(this.cartService.type, 'Status', 'NotEqual', 'Saved')
    ]));
  }


}
/** @ignore */
interface CartListView {
  tableOptions: TableOptions;
  type: ClassType<AObject>;
}
