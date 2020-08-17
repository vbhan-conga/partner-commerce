
import {map, take} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService, StorefrontService } from '@apttus/ecommerce';
import { Observable } from 'rxjs';

@Injectable()
export class AboGuard implements CanActivate {

  EnableABO: boolean;

  constructor(private router: Router, private userService: UserService, private storefrontService: StorefrontService) {
      this.storefrontService.getStorefront().pipe(take(1)).subscribe(storefront => this.EnableABO = storefront.EnableABO);
  }

  canActivate(): Observable<boolean> {
    return this.userService.isLoggedIn().pipe(map(res => {
      if (res) {
        if (this.EnableABO) return true;
        else {
          this.router.navigate(['/']);
        }
      }
      else {
        this.router.navigate(['/']);
        return false;
      }
    }));
  }
}