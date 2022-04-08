import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { get } from 'lodash';
import { CartService, Cart, AccountService, OrderService } from '@congacommerce/ecommerce';
import { ExceptionService, OutputFieldComponent } from '@congacommerce/elements';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ActionBarComponent implements OnInit {

  cart$: Observable<Cart>;
  loading: boolean = false;

  @ViewChild('accountField', { static: false }) accountField: OutputFieldComponent;

  constructor(
    private cartService: CartService,
    private accountService: AccountService,
    private exceptionService: ExceptionService,
    private orderService: OrderService)
    { }

  ngOnInit() {
    this.cart$ = this.cartService.getMyCart()
    .pipe(
      switchMap(cart => combineLatest([of(cart), get(cart,'OrderId') ? this.orderService.getOrder(get(cart, 'OrderId')) : of(null), this.accountService.getAccount(get(cart, 'AccountId'))])),
      map(([cart, order, account]) => {
        cart.Order = order;
        cart.Account = account;
        return cart;
      })
    );
  }

  changeAccount(x){
    this.accountService.setAccount(x, true).pipe(take(1))
    .subscribe(
      () => {
        this.exceptionService.showSuccess('ACTION_BAR.CHANGE_ACCOUNT_MESSAGE', 'ACTION_BAR.CHANGE_ACCOUNT_TITLE');
        this.accountField.handleHidePop();
      }
    );
  }

  createNewCart() {
    this.loading = true;
    this.cartService.createNewCart()
    .pipe(
      take(1),
      switchMap(cart => this.cartService.setCartActive(cart))
    )
    .subscribe(cart => {
      this.loading = false;
      this.exceptionService.showSuccess('ACTION_BAR.CART_CREATION_TOASTR_MESSAGE');
    },
    error => {
      this.loading = false;
      this.exceptionService.showError(error);
    });
  }

}
