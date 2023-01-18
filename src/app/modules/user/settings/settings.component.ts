import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { UserService, AccountService, User, Account } from '@congacommerce/ecommerce';
import { ExceptionService } from '@congacommerce/elements';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  user$: Observable<User>;

  account$: Observable<Account>;

  /** @ignore */
  constructor(private userService: UserService,
              private accountService: AccountService,
              private exceptionService: ExceptionService) {
  }

  /** @ignore */
  ngOnInit() {
    this.user$ = this.userService.me().pipe(map(user => cloneDeep(user)));
    this.account$ = this.accountService.getMyAccount();
  }

  updateUser(user: User) {
    this.userService.updateCurrentUser(user).subscribe(() => {
    }, err => {
      this.exceptionService.showError(err);
    });
  }
}
