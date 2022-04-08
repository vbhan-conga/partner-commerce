import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService, Quote, User, Cart, CartService, StorefrontService } from '@congacommerce/ecommerce';

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss']
})
export class DashboardViewComponent implements OnInit {

  type = Quote;
  me$: Observable<User>;
  cart$: Observable<Cart>;
  showFavorites$: Observable<boolean>;

  constructor(private userService: UserService,
    private cartService: CartService,
    private storefrontService: StorefrontService) { }

  ngOnInit() {
    this.cart$ = this.cartService.getMyCart();
    this.showFavorites$ = this.storefrontService.isFavoriteDisabled().pipe(map(res => !res));
    this.me$ = this.userService.me()
      .pipe(
        map((user: User) => {
          user.SmallPhotoUrl = this.userService.configurationService.get('endpoint') + user.SmallPhotoUrl.substring(user.SmallPhotoUrl.indexOf('/profilephoto'));
          return user;
        })
      );
  }

}
