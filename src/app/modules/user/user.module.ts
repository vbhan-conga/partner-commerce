import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { OutputFieldModule, IconModule } from '@apttus/elements';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { FormsModule } from '@angular/forms';
import { LaddaModule } from 'angular2-ladda';


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
