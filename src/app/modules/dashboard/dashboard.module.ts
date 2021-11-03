import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardViewComponent } from './view/dashboard-view.component';
import { AuthProviderModule, ApttusModule } from '@congacommerce/core';
import { TableModule, BreadcrumbModule, AlertModule } from '@congacommerce/elements';
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
    ComponentModule,
    AlertModule
  ]
})
export class DashboardModule { }
