import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LaddaModule } from 'angular2-ladda';
import { UserRoutingModule } from './user-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { OutputFieldModule, IconModule } from '@congacommerce/elements';
import { ChangePasswordComponent } from './change-password/change-password.component';



@NgModule({
  imports: [
    CommonModule,
    UserRoutingModule,
    TranslateModule.forChild(),
    OutputFieldModule,
    FormsModule,
    LaddaModule,
    IconModule
  ],
  declarations: [SettingsComponent, ChangePasswordComponent]
})
export class UserModule { }
