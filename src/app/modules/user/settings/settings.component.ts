import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, AccountService, User, Account } from '@apttus/ecommerce';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

import { first, cloneDeep } from 'lodash';

/**
 * Loads user and account specific settings.
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  user$: BehaviorSubject<User> = new BehaviorSubject<User>({} as User);
  account$: Observable<Account>;

  userSubscription: Subscription = null;

  /** @ignore */
  constructor(private userService: UserService, private accountService: AccountService) { }

  /** @ignore */
  ngOnInit() {
    this.userSubscription = this.userService.me().subscribe(res => {
      this.user$.next(res);
    });
    this.account$ = this.accountService.getMyAccount();
  }

  updateUser() {
    this.userSubscription = this.userService.update([this.user$.value]).subscribe((res: Array<User>) => {
      const updatedUser = cloneDeep(first(res));
      this.user$.next(updatedUser);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }
}
