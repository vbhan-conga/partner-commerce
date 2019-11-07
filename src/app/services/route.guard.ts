import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

const sv = (<any>window).sv;

@Injectable()
export class RouteGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (sv && sv.params){
            const params: Params = <Params> this.parseQuery(sv.params);
            if(params.setupid){
                this.router.navigate([params.setupid]);
                return false;
            }else
                return true;
        }else
            return true;
    }

    private parseQuery(queryString: string): Object{
        const query = {};
        const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return query;
    }
}

export interface Params{
    fromFrontdoor: string;
    retURL: string;
    setupid: string;
}