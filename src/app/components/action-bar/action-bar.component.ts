import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CartService, Cart, AccountService } from '@apttus/ecommerce';
import { Observable, of } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { first } from 'lodash';
import { ExceptionService } from '@apttus/elements';
import { OutputFieldComponent } from '@apttus/elements';
import { Router } from '@angular/router';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ActionBarComponent implements OnInit {

  cart$: Observable<Cart>;
  loading: boolean = false;

  @ViewChild('accountField', {static: false}) accountField: OutputFieldComponent;
  // @ViewChild('priceListField', {static: false}) priceListField;

  constructor(
    private cartService: CartService,
    private accountService: AccountService,
    private exceptionService: ExceptionService,
    private router: Router) { }

  ngOnInit() {
    this.cart$ = this.cartService.getMyCart()
    .pipe(
      switchMap(cart => this.accountService.getAccountById(cart.AccountId)
      .pipe(
        map(account => {
          cart.Account = first(account);
          return cart;
        })
      ))
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
      this.router.navigate(['/carts', cart.Id]);
    },
    error => {
      this.loading = false;
      this.exceptionService.showError(error);
    });
  }

}
