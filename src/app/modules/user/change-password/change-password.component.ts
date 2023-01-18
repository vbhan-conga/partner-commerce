import { Component, OnInit, NgZone } from '@angular/core';
import { UserService } from '@congacommerce/ecommerce';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


 /**
  * Prevents compile time type error checking from flagging the call as invalid.
  */
const sv = (<any>window).sv;

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  /**
   * Different messages depending on the state of component
   * e.g. PasswordA and PasswordB doesn't match, Reusing old password, some errors/exceptions
   */
  message: string;
  /**
   * Change Password form model consisting PasswordA and PasswordB fields
   */
  passwordForm: PasswordForm = {} as PasswordForm;
  /**
   * Shows/Hides Spinner when LoadingStarts/LoadingEnds
   */
  loading: boolean = false;

  constructor(private userService: UserService, private router: Router, private ngZone: NgZone, private translateService: TranslateService) { }


  /**
   * Takes two password from form inputs, compares them if match is found
   * calls user service's setPassword(newPassword) and changes password for user.
   * Shows error if there are any
   */
  setPassword(){
    if(this.passwordForm.passwordA !== this.passwordForm.passwordB) {
      this.translateService.stream('CHANGE_PASSWORD.PASSWORD_DO_NOT_MATCH_ERROR').subscribe((val: string) => {
        this.message = val;
      });
    }
    else{
      this.loading = true;
      this.userService.setPassword(this.passwordForm.passwordA).subscribe(
        res => this.ngZone.run(() => {
          this.loading = false;
          if(sv && sv.params)
            sv.params = null;
            this.router.navigate(['']);
        }),
        err => this.ngZone.run(() => {
          if(err.indexOf('invalid repeated password') >= 0) {
            this.translateService.stream('CHANGE_PASSWORD.OLD_PASSWORD_CAN_NOT_BE_USED_ERROR').subscribe((val: string) => {
              this.message = val;
            });
          }
          else {
            this.translateService.stream('CHANGE_PASSWORD.OCURRED_SERVER_ERROR').subscribe((val: string) => {
              this.message = val;
            });
          }
          this.loading = false;
        })
      );
    }
  }
}

/** @ignore */
interface PasswordForm{
  passwordA: string;
  passwordB: string;
}
