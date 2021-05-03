import { Component, OnInit, HostListener, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Storefront, ContactService, StorefrontService, UserService, CurrencyType, User, 
          Contact, Cart, CartService } from '@apttus/ecommerce';
import { MiniProfileComponent } from '@apttus/elements';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  
  @ViewChild('profile', { static: false }) profile: MiniProfileComponent;
  
  pageTop: boolean = true;
  storefront$: Observable<Storefront>;
  user$: Observable<User>;
  contact$: Observable<Contact>;
  cart$: Observable<Cart>;

  constructor(private storefrontService: StorefrontService,
              private userService: UserService,
              private router: Router,
              private contactService: ContactService,
              private translateService: TranslateService,
              private cartService: CartService) {}

  ngOnInit() {
    this.storefront$ = this.storefrontService.getStorefront();
    this.contact$ = this.contactService.getMyContact();
    this.user$ = this.userService.me();
    this.cart$ = this.cartService.getMyCart();
  }

  setCurrency(currency: CurrencyType) {
    this.userService.setCurrency(currency.IsoCode).subscribe(() => { });
  }

  setLanguage(lang: string) {
    this.translateService.use(lang);
    localStorage.setItem('locale', lang);
  }

  setStorefront(storefront: Storefront) {
    this.storefrontService.cacheService._set('storefront', storefront.Id, true);
    window.location.reload();
  }

  goToAddress() {
    this.router.navigate(['/address']);
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
