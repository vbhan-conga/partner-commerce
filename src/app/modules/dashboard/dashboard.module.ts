import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardViewComponent } from './view/dashboard-view.component';
import { AuthProviderModule, ApttusModule } from '@apttus/core';
import { TableModule, BreadcrumbModule } from '@apttus/elements';
import { ComponentModule } from '../../components/component.module';


@NgModule({
  declarations: [DashboardViewComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    AuthProviderModule,
    TableModule,
    ApttusModule,
    BreadcrumbModule,
    ComponentModule
  ]
})
export class DashboardModule { }
