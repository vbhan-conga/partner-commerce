import { Component, OnInit, HostListener, ViewChild, ElementRef, TemplateRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import {
  CategoryService, Category, Storefront, ContactService, StorefrontService,
  UserService, CurrencyType, User, ProductService, Product, Contact, Cart, CartService
} from '@apttus/ecommerce';

import { MiniProfileComponent } from '@apttus/elements';

import { Router } from '@angular/router';
import { Observable, combineLatest, BehaviorSubject, Subscription } from 'rxjs';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { APageInfo, ConfigurationService, ACondition } from '@apttus/core';
import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchModal', { static: false }) searchModal: ElementRef;
  @ViewChild('profile', { static: false }) profile: MiniProfileComponent;
  @ViewChild('searchBox', { static: false }) searchBox: ElementRef;

  index: number = 0;
  searchQuery: string;
  pageTop: boolean = true;
  modalRef: BsModalRef;

  typeahead$: Observable<Array<Product>> = new Observable<Array<Product>>();
  typeaheadLoading: boolean = false;
  keyupEvent: any;

  view$: BehaviorSubject<HeaderView> = new BehaviorSubject<HeaderView>(null);
  categoryView$: Observable<CategoryView>;
  subscription: Subscription;

  constructor(private categoryService: CategoryService,
    private storefrontService: StorefrontService,
    private userService: UserService,
    private router: Router,
    private productService: ProductService,
    private config: ConfigurationService,
    private contactService: ContactService,
    private modalService: BsModalService,
    private translateService: TranslateService,
    private cartService: CartService) {

    this.typeahead$ = Observable.create((observer: any) => {
      observer.next(this.searchQuery);
    }).pipe(
      switchMap((query: string) => {
        return this.productService.query({
          searchString: query,
          page: new APageInfo(5, 0),
          groupBy: ['Name', 'Id', 'IconId', 'ProductCode']
        });
      })
    );
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
      , this.storefrontService.describe(null, 'DefaultLocale', true)
      , this.cartService.getMyCart()
    ).pipe(
      map(([storefront, contact, user, localeFields, activeCart]) => {
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
    if (obj._children) {
      obj._children.forEach(d => {
        const tmpDepth = this.getDepth(d);
        if (tmpDepth > depth) {
          depth = tmpDepth;
        }
      });
    }
    return 1 + depth;
  }

  openModal(template: TemplateRef<any>) {
    this.searchQuery = '';
    this.modalRef = this.modalService.show(template);
  }

  setCurrency(currency: CurrencyType) {
    this.userService.setCurrency(currency.IsoCode).subscribe(() => { });
  }

  setLanguage(lang: string) {
    this.translateService.use(lang);
    localStorage.setItem('locale', lang);
  }

  setStorefront(storefront: Storefront) {
    this.modalRef.hide();
    this.storefrontService.cacheService._set('storefront', storefront.Id, true);
    window.location.reload();
  }

  onSubmit() {
    this.router.navigate(['/search', this.searchQuery]);
  }

  typeaheadOnSelect(evt) {
    this.modalRef.hide();
    this.typeaheadLoading = false;
    this.router.navigate(['/products', evt.item[this.config.get('productIdentifier')]]);
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

  doSearch() {
    this.modalRef.hide();
    this.typeaheadLoading = false;
    if (this.searchQuery) this.router.navigate(['/search', this.searchQuery]);
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
