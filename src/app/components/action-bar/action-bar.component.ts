import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CartService, Cart, AccountService, OrderService, CategoryService } from '@apttus/ecommerce';
import { Observable, of, combineLatest } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { ExceptionService } from '@apttus/elements';
import { OutputFieldComponent } from '@apttus/elements';
import { Router } from '@angular/router';
import { first, get } from 'lodash';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ActionBarComponent implements OnInit {

  cart$: Observable<Cart>;
  loading: boolean = false;

  @ViewChild('accountField') accountField: OutputFieldComponent;
  // @ViewChild('priceListField', {static: false}) priceListField;

  constructor(
    private cartService: CartService,
    private accountService: AccountService,
    private exceptionService: ExceptionService,
    private orderService: OrderService,
    private categoryService: CategoryService,
    private router: Router) { }

  ngOnInit() {
    this.cart$ = this.cartService.getMyCart()
    .pipe(
      switchMap(cart => combineLatest(of(cart), get(cart,'OrderId') ? this.orderService.getOrder(cart.OrderId) : of(null))),
      map(([cart, order]) => {
        cart.Order = first(order);
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
        this.categoryService.refresh();
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
      this.router.navigate(['/carts', cart.Id]);
    },
    error => {
      this.loading = false;
      this.exceptionService.showError(error);
    });
  }

}
