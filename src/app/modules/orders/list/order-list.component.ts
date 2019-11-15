import { Component, OnInit } from '@angular/core';
import { OrderService, Order, CartService } from '@apttus/ecommerce';
import * as _ from 'lodash';
import { combineLatest, of, Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ACondition, AFilter, Operator } from '@apttus/core';
import { TableOptions, FilterOptions } from '@apttus/elements';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  type = Order;
  view$: Observable<OrderListView>;
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

  constructor(private orderService: OrderService, private cartService: CartService) { }

  ngOnInit() {
    this.view$ = combineLatest(
      this.cartService.getMyCart(),
      this.filterList$
    )
    .pipe(
      switchMap(([cart, filterList]) => {
        return combineLatest(
          of(cart),
          this.orderService.query({
            aggregate: true,
            groupBy: ['Status'],
            filters: this.filterList$.value
          })
        );
      }),
      map(([cart, data]) => {
        return {
          tableOptions: _.clone(_.assign(this.tableOptions, {filters: this.filterList$.value})),
          total: _.get(data, 'total_records', _.sumBy(data, 'total_records')),
          totalAmount: _.get(data, 'SUM_OrderAmount', _.sumBy(data, 'SUM_OrderAmount')),
          ordersByStatus: _.isArray(data)
            ? _.omit(_.mapValues(_.groupBy(data, 'Apttus_Config2__Status__c'), s => _.sumBy(s, 'total_records')), 'null')
            : _.zipObject([_.get(data, 'Apttus_Config2__Status__c')], _.map([_.get(data, 'Apttus_Config2__Status__c')], key => _.get(data, 'total_records'))),
          orderAmountByStatus: _.isArray(data)
            ? _.omit(_.mapValues(_.groupBy(data, 'Apttus_Config2__Status__c'), s => _.sumBy(s, 'SUM_OrderAmount')), 'null')
            : _.zipObject([_.get(data, 'Apttus_Config2__Status__c')], _.map([_.get(data, 'Apttus_Config2__Status__c')], key => _.get(data, 'SUM_OrderAmount')))
        } as OrderListView;
      })
    );
  }

  handleFilterListChange(event: any) {
    this.filterList$.next(event);
  }

}

/** @ignore */
interface OrderListView{
  tableOptions: TableOptions;
  total: number;
  totalAmount: number;
  ordersByStatus: object;
  orderAmountByStatus: object;
}
