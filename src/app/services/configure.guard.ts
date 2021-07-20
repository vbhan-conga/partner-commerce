import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, filter, distinctUntilKeyChanged, flatMap, switchMap, take } from 'rxjs/operators';
import { get, some } from 'lodash';
import { ACondition, ConfigurationService } from '@congacommerce/core';
import { ProductService, Product, ConstraintRuleService, CartService } from '@congacommerce/ecommerce';
import { ProductDetailComponent } from '../modules/products/detail/product-detail.component';


@Injectable()
export class ConfigureGuard implements CanActivate, CanDeactivate<ProductDetailComponent>{

    constructor(private router: Router, private productService: ProductService, private constraintRuleService: ConstraintRuleService, private config: ConfigurationService, private cartService: CartService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.productService.where([new ACondition(Product, this.config.get('productIdentifier'), 'Equal', route.params.productCode)])
            .pipe(
                map(res => res[0])
                , filter(product => product != null)
                , distinctUntilKeyChanged('Id')
                , flatMap(product =>
                    this.constraintRuleService.getConstraintRulesForProducts([product])
                        .pipe(
                            map(rules => {
                                const activate =
                                    ((get(product, 'Apttus_Config2__HasAttributes__c') && get(product, 'Apttus_Config2__AttributeGroups__r', []).totalSize > 0)
                                        || (get(product, 'Apttus_Config2__HasOptions__c') && get(product, 'Apttus_Config2__OptionGroups__r', []).totalSize > 0))
                                    && rules.filter(rule => rule.ConstraintRuleActions.filter(action => action.ActionType === 'Replacement').length > 0).length === 0;
                                if (!activate)
                                    this.router.navigate(['/products', product[this.config.get('productIdentifier')]]);
                                return activate;
                            })
                        )

                )
            );
    }

    canDeactivate(component: ProductDetailComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.cartService.getMyCart().pipe(
            take(1),
            switchMap(cart => { 
                if (component.configurationChanged && some(cart.LineItems, { Id: get(route.params, 'cartItem')})) {
                    if (confirm('You have unsaved changes to the product configuration! Are you sure you want to proceed?'))
                        return of(true);
                    else
                        return of(false);
                }
                else
                    return of(true);
            })
        );
    }

}