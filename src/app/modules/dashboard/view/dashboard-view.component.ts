import { Component, OnInit } from '@angular/core';
import { UserService, Quote, User } from '@congacommerce/ecommerce';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss']
})
export class DashboardViewComponent implements OnInit {

  type = Quote;
  me$: Observable<User>;
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.me$ = this.userService.me()
      .pipe(
        map(user => {
          user.SmallPhotoUrl = this.userService.configurationService.get('endpoint') + user.SmallPhotoUrl.substring(user.SmallPhotoUrl.indexOf('/profilephoto'));
          return user;
        })
      );
  }

}
