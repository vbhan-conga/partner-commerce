import { Component, OnInit, HostListener, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Storefront, StorefrontService, UserService, User, Cart, CartService } from '@apttus/ecommerce';
import { MiniProfileComponent } from '@apttus/elements';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  @ViewChild('profile', { static: false }) profile: MiniProfileComponent;

  index: number = 0;
  pageTop: boolean = true;

  storefront$: Observable<Storefront>;
  user$: Observable<User>;
  cart$: Observable<Cart>;

  constructor(
    private storefrontService: StorefrontService,
    private userService: UserService,
    private router: Router,
    private cartService: CartService) {
  }

  ngOnInit() {
    this.storefront$ = this.storefrontService.getStorefront();
    this.user$ = this.userService.me();
    this.cart$ = this.cartService.getMyCart();
  }

  doLogout() {
    this.profile.doLogout();
    this.router.navigate(['/']);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    this.pageTop = window.pageYOffset <= 0;
  }
}
