
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConstraintRuleService } from '@congacommerce/ecommerce';

@Injectable()
export class ConstraintRuleGuard implements CanActivate {

    constructor(private router: Router, private crService: ConstraintRuleService) { 
        this.crService.hasPendingErrors().subscribe(hasErrors => {
            if(hasErrors && this.router.url === '/checkout')
                this.router.navigate(['/cart']);
        });
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.crService.hasPendingErrors().pipe(map(res => !res));
    }

}