import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { LaddaModule } from 'angular2-ladda';
import { ApttusModule } from '@apttus/core';
import { PricingModule } from '@apttus/ecommerce';
import { ToastrModule } from 'ngx-toastr';
import { MiniProfileModule, MiniCartModule, PriceModule, OutputFieldModule, ButtonModule,
        DirectivesModule, ConstraintRuleModule, ProductSearchModule, PriceModalModule } from '@apttus/elements';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { ProgressComponent } from './progress/progress.component';


@NgModule({
  imports: [
    CommonModule,
    MiniProfileModule,
    MiniCartModule,
    ConstraintRuleModule,
    LaddaModule,
    RouterModule,
    ApttusModule,
    PricingModule,
    PriceModule,
    NgScrollbarModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot({ onActivateTick: true }),
    OutputFieldModule,
    ButtonModule,
    DirectivesModule,
    ConstraintRuleModule,
    ProductSearchModule,
    PriceModalModule
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
