import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { LaddaModule } from 'angular2-ladda';
import { FormsModule } from '@angular/forms';
import { ApttusModule } from '@apttus/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PricingModule } from '@apttus/ecommerce';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ToastrModule } from 'ngx-toastr';

import { MiniProfileModule, MiniCartModule, ConstraintSideMenuModule, IconModule, PriceModule, OutputFieldModule, BreadcrumbModule, ButtonModule, DirectivesModule, ConstraintRuleModule } from '@apttus/elements';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { ProgressComponent } from './progress/progress.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  imports: [
    CommonModule,
    MiniProfileModule,
    MiniCartModule,
    ConstraintRuleModule,
    ConstraintSideMenuModule,
    BsDropdownModule.forRoot(),
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(),
    LaddaModule,
    RouterModule,
    FormsModule,
    ApttusModule,
    PricingModule,
    IconModule,
    PriceModule,
    NgScrollbarModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot({ onActivateTick: true }),
    OutputFieldModule,
    BreadcrumbModule,
    ButtonModule,
    DirectivesModule,
    ConstraintRuleModule
  ],
  exports: [
    HeaderComponent,
    LaddaModule,
    ToastrModule,
    ActionBarComponent,
    ProgressComponent,
    ConstraintRuleModule
  ],
  declarations: [
    HeaderComponent,
    ActionBarComponent,
    ProgressComponent
  ]
})
export class ComponentModule { }
