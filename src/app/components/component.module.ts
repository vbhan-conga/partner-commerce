import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { LaddaModule } from 'angular2-ladda';
import { ApttusModule } from '@congacommerce/core';
import { PricingModule } from '@congacommerce/ecommerce';
import { ToastrModule } from 'ngx-toastr';
import { MiniProfileModule, MiniCartModule, PriceModule, OutputFieldModule, ButtonModule, DirectivesModule, ConstraintRuleModule, ProductSearchModule } from '@congacommerce/elements';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { ProgressComponent } from './progress/progress.component';
import { CategoryCarouselComponent } from './category-carousel/category-carousel.component';

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
    ProductSearchModule
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
    ProgressComponent,
    CategoryCarouselComponent
  ]
})
export class ComponentModule { }
