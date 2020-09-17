import { Component, OnInit, HostListener, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import {
  CategoryService, Category, Storefront, ContactService, StorefrontService,
  UserService, CurrencyType, User, ProductService, Product, Contact, Cart, CartService
} from '@apttus/ecommerce';
import { MiniProfileComponent } from '@apttus/elements';
import { Router } from '@angular/router';
import { Observable, combineLatest, BehaviorSubject, Subscription } from 'rxjs';
import { ConfigurationService } from '@apttus/core';
import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  
  @ViewChild('profile') profile: MiniProfileComponent;
  

  index: number = 0;
  pageTop: boolean = true;
  view$: BehaviorSubject<HeaderView> = new BehaviorSubject<HeaderView>(null);
  categoryView$: Observable<CategoryView>;
  subscription: Subscription;

  constructor(private categoryService: CategoryService,
    private storefrontService: StorefrontService,
    private userService: UserService,
    private router: Router,
    private contactService: ContactService,
    private translateService: TranslateService,
    private cartService: CartService) {

    
  }

  ngOnInit() {

    this.categoryView$ = this.categoryService.getCategoryTree()
      .pipe(
        map(categoryTree => ({
          categoryTree: categoryTree,
          categoryBranch: _.map(categoryTree, (c) => {
            const depth = this.getDepth(c);
            return new Array<any>(depth);
          })
        }))
      );

    this.subscription = combineLatest(
      this.storefrontService.getStorefront()
      , this.contactService.getMyContact()
      , this.userService.me()
      , this.cartService.getMyCart()
    ).pipe(
      map(([storefront, contact, user, activeCart]) => {
        user.SmallPhotoUrl = this.userService.configurationService.get('endpoint') + user.SmallPhotoUrl.substring(user.SmallPhotoUrl.indexOf('/profilephoto'));
        return {
          storefront: storefront,
          contact: contact,
          me: user,
          cart: activeCart
        };
      })
    ).subscribe((r) => this.view$.next(r));
  }

  ngOnDestroy(){
    if(this.subscription)
      this.subscription.unsubscribe();
  }

  getDepth(obj) {
    let depth = 0;
    if (obj.Children) {
      obj.Children.forEach(d => {
        const tmpDepth = this.getDepth(d);
        if (tmpDepth > depth) {
          depth = tmpDepth;
        }
      });
    }
    return 1 + depth;
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

  goToCategory(category: Category, view: HeaderView) {
    _.set(view, `categoryBranch[${this.index}]`, category);
    this.index += 1;
  }

  goBack(view: HeaderView) {
    _.set(view, `categoryBranch[${this.index}]`, new Category());
    this.index -= 1;
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
/** @ignore */
interface HeaderView {
  storefront: Storefront;
  contact: Contact;
  me: User;
  cart: Cart;
}

interface CategoryView{
  categoryTree: Array<Category>;
  categoryBranch: Array<Category>;
}
