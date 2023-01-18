import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { first, get, map as _map } from 'lodash';
import { AFilter, ACondition } from '@congacommerce/core';
import { Favorite, FavoriteService, User, UserService, CartItem } from '@congacommerce/ecommerce';
import { TableOptions, TableAction, ExceptionService } from '@congacommerce/elements';


@Component({
  selector: 'app-favorite-list',
  templateUrl: './favorite-list.component.html',
  styleUrls: ['./favorite-list.component.scss']
})
export class FavoriteListComponent implements OnInit {

  type = Favorite;

  /**
   * An observable with the aggregate count of favorites.
   */
  favoritesAggregate$: Observable<any>;

  /**
   * Options passed to table component to render the favorites in a grid view.
   */
  tableOptions$: Observable<TableOptions>;

  user: User;

  constructor(private router: Router,
    private favoriteService: FavoriteService,
    private userService: UserService,
    private exceptionService: ExceptionService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.tableOptions$ = this.userService.getCurrentUser().pipe(
      map((user: User) => {
        this.user = user;
        this.getFavoritesAggregate();
        return {
          columns: [
            {
              prop: 'Name',
              label: 'Favorite Name'
            },
            {
              prop: 'Description',
              showPopOver: true
            },
            {
              prop: 'Scope',
              label: 'Visibility'
            },
            {
              prop: 'Active',
              value: (record: Favorite) => record.Active ? of('Yes') : of('No')
            },
            {
              prop: 'CreatedDate'
            }
          ],
          actions: [
            {
              enabled: true,
              icon: 'fa-check',
              massAction: false,
              label: 'Add to Cart',
              theme: 'primary',
              validate: (record: Favorite) => this.isActiveFavorite(record),
              action: (recordList: Array<Favorite>) => this.addFavoriteToCart(first(recordList)),
              disableReload: true
            } as TableAction,
            {
              enabled: true,
              icon: 'fa-pencil',
              massAction: false,
              label: 'Edit',
              theme: 'primary',
              validate: (record: Favorite) => this.canEdit(record),
              action: (recordList: Array<Favorite>) => this.editFavorite(first(recordList)),
              disableReload: true
            } as TableAction,
            {
              enabled: true,
              icon: 'fa-trash',
              massAction: true,
              label: 'Delete',
              theme: 'danger',
              validate: (record: Favorite) => this.canDelete(record),
              action: (recordList: Array<Favorite>) => this.removeFavorites(recordList),
              disableReload: true,
            } as TableAction
          ],
          fields: [
            'Name',
            'Description',
            'Scope',
            'Active',
            'CreatedDate',
            'OwnerId'
          ],
          filters: this.getFilters(),
          routingLabel: 'favorites'
        } as TableOptions;
      }));
  }

  /**
   * @ignore
   */
  private isActiveFavorite(favorite: Favorite) {
    return favorite.Active;
  }

  /**
   * @param favorite record to add saved configurations from.
   * @returns list of line items from favorite configuration added to active cart.
   */
  private addFavoriteToCart(favorite: Favorite): Observable<Array<CartItem>> {
    return this.favoriteService.addFavoriteToCart(favorite.Id).pipe(
      tap(() => this.exceptionService.showSuccess('SUCCESS.FAVORITE.ADD_FAVORITE_TO_CART', 'SUCCESS.FAVORITE.TITLE', { name: favorite.Name }))
    )
  }

  /**
   * @ignore
   */
  private editFavorite(favorite: Favorite) {
    this.router.navigate(['/favorites', favorite.Id]);
  }

  /**
   * @ignore
   */
  private removeFavorites(favoriteList: Array<Favorite>): Observable<Array<Favorite>> {
    return this.favoriteService.removeFavorites(favoriteList).pipe(
      tap(() => this.loadData())
    );
  }

  /**
   * @ignore
   */
  private canDelete(favorite: Favorite) {
    return get(favorite, 'OwnerId') === get(this.user, 'Id');
  }

  /**
   * @ignore
   */
  private canEdit(favorite: Favorite) {
    return this.isActiveFavorite(favorite) && (get(favorite, 'OwnerId') === get(this.user, 'Id'));
  }

  /**
   * @ignore
   */
  private getFavoritesAggregate(): Observable<any> {
    return this.favoritesAggregate$ = this.favoriteService.query({
      aggregate: true,
      skipCache: true,
      filters: this.getFilters()
    }).pipe(map(first));
  }

  /**
   * @ignore
   */
  private getFilters(): Array<AFilter> {
    const filters = [];
    filters.push(new AFilter(this.type, null, [
      new AFilter(this.type, [new ACondition(this.type, 'Apttus_Config2__Scope__c', 'Equal', 'Public')]),
      new AFilter(this.type, null, [
        new AFilter(this.type, [new ACondition(this.type, 'Apttus_Config2__Scope__c', 'Equal', 'Private')]),
        new AFilter(this.type, [
          new ACondition(this.type, 'OwnerId', 'Equal', `${get(this.user, 'Id')}`),
          new ACondition(this.type, 'CreatedById', 'Equal', `${get(this.user, 'Id')}`)
        ], null, 'OR')
      ], 'AND')
    ], 'OR'));
    return filters;
  }

}