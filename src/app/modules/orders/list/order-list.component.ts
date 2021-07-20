import { Component, OnInit } from '@angular/core';

import { of, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { clone, assign, get, isArray, groupBy, sumBy, omit, zipObject, mapValues, map } from 'lodash';

import { AFilter, Operator } from '@congacommerce/core';
import { OrderService, Order, AccountService } from '@congacommerce/ecommerce';
import { TableOptions, FilterOptions } from '@congacommerce/elements';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  type = Order;

  totalRecords$: Observable<number>;
  totalAmount$: Observable<number>;
  ordersByStatus$: Observable<number>;
  orderAmountByStatus$: Observable<number>;

  colorPalette = ['#D22233', '#F2A515', '#6610f2', '#008000', '#17a2b8', '#0079CC', '#CD853F', '#6f42c1', '#20c997', '#fd7e14'];

  tableOptions: TableOptions = {
    columns: [
      {
        prop: 'Name'
      },
      {
        prop: 'Description',
        label: 'Title'
      },
      {
        prop: 'Status'
      },
      {
        prop: 'PriceListId'
      },
      {
        prop: 'BillToAccountId'
      },
      {
        prop: 'ShipToAccountId'
      },
      {
        prop: 'OrderAmount'
      },
      {
        prop: 'CreatedDate'
      },
      {
        prop: 'ActivatedDate'
      }
    ],
    fields: [
      'Id',
      'Name',
      'Description',
      'Status',
      'BillToAccount.Name',
      'ShipToAccount.Name',
      'PriceList.Name',
      'OrderAmount',
      'CreatedDate',
      'ActivatedDate'
    ]
  };

  filterList$: BehaviorSubject<Array<AFilter>> = new BehaviorSubject<Array<AFilter>>([]);

  filterOptions: FilterOptions = {
    visibleFields: [
      'BillToAccountId',
      'Status',
      'OrderAmount',
      'CreatedDate'
    ],
    visibleOperators: [
      Operator.EQUAL,
      Operator.LESS_THAN,
      Operator.GREATER_THAN,
      Operator.GREATER_EQUAL,
      Operator.LESS_EQUAL,
      Operator.IN
    ]
  };

  constructor(private orderService: OrderService, private accountService: AccountService) { }

  ngOnInit() {

    combineLatest([
      this.accountService.getCurrentAccount(),
      this.filterList$
    ]).pipe(
      switchMap(([account, filterList]) => {
        return combineLatest([
          of(account),
          this.orderService.query({
            aggregate: true,
            groupBy: ['Status'],
            filters: this.filterList$.value
          })
        ]);
      })
    ).subscribe(([account, data]) => {
      this.tableOptions = clone(assign(this.tableOptions, { filters: this.filterList$.value }));
      this.totalRecords$ = of(get(data, 'total_records', sumBy(data, 'total_records')));
      this.totalAmount$ = of(get(data, 'SUM_OrderAmount', sumBy(data, 'SUM_OrderAmount')));
      this.ordersByStatus$ = of(
        isArray(data)
          ? omit(mapValues(groupBy(data, 'Apttus_Config2__Status__c'), s => sumBy(s, 'total_records')), 'null')
          : zipObject([get(data, 'Apttus_Config2__Status__c')], map([get(data, 'Apttus_Config2__Status__c')], key => get(data, 'total_records')))
      );
      this.orderAmountByStatus$ = of(
        isArray(data)
          ? omit(mapValues(groupBy(data, 'Apttus_Config2__Status__c'), s => sumBy(s, 'SUM_OrderAmount')), 'null')
          : zipObject([get(data, 'Apttus_Config2__Status__c')], map([get(data, 'Apttus_Config2__Status__c')], key => get(data, 'SUM_OrderAmount')))
      )
    });
  }

  handleFilterListChange(event: any) {
    this.filterList$.next(event);
  }

}
