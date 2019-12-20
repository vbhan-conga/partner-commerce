import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginGuard, GuestGuard } from '@apttus/ecommerce';
import { MainComponent } from './main.component';
import { RouteGuard } from './services/route.guard';
import { ConstraintRuleGuard } from './services/constraint-rule.guard';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        children: [
          {
            path: 'u',
            loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule),
            canActivate: [GuestGuard],
            data: {
              redirectUrl: ''
            }
          },
          {
            path: '',
            canActivate: [LoginGuard],
            component: MainComponent,
            data: {
              redirectUrl: '/u/login'
            },
            children: [
              {
                path: '',
                redirectTo: 'orders',
                pathMatch: 'full'
              },
              {
                path: 'proposals',
                loadChildren: () => import('./modules/quotes/quotes.module').then(m => m.QuotesModule)
              },
              {
                path: 'orders',
                loadChildren: () => import('./modules/orders/orders.module').then(m => m.OrdersModule)
              },
              {
                path: 'products',
                loadChildren: () => import('./modules/products/products.module').then(m => m.ProductsModule)
              },
              {
                path: 'carts',
                loadChildren: () => import('./modules/carts/carts.module').then(m => m.CartsModule)
              },
              {
                path: 'search/:query',
                loadChildren: () => import('./modules/products/products.module').then(m => m.ProductsModule),
                data: { title: 'Search' }
              },
              {
                path: 'checkout',
                loadChildren: () => import('./modules/checkout/checkout.module').then(m => m.CheckoutModule),
                canActivate: [RouteGuard, ConstraintRuleGuard]
              },
              {
                path: 'assets',
                canActivate: [LoginGuard],
                loadChildren: () => import('./modules/assets/assets.module').then(m => m.AssetsModule),
                data: { title: 'Assets' }
              },
              {
                path: 'payment',
                loadChildren: () => import('./modules/payment/payment.module').then(m => m.PaymentModule)
              },
              {
                path: 'user',
                loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule)
              }
            ]
          }
        ]
      }
    ], {
      useHash: environment.hashRouting,
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
