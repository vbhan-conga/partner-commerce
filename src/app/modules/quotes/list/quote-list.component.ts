import { Component, OnInit } from '@angular/core';
import { Quote, QuoteService, CartService } from '@apttus/ecommerce';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment';
import { map, switchMap } from 'rxjs/operators';
import { TableOptions } from '@apttus/elements';
import { AFilter, ACondition } from '@apttus/core';

@Component({
  selector: 'app-quote-list',
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.scss']
})
export class QuoteListComponent implements OnInit {
  type = Quote;
  aggregateData$: Observable<QuoteListView>;
  quotesByStatus$: Observable<Object>;
  quotesByDueDate$: Observable<Object>;
  colorPalette: Array<String> = [];
  minDaysFromDueDate: number = 7;
  maxDaysFromDueDate: number = 14;

  tableOptions: TableOptions = {
    columns: [
      {
        prop: 'Name'
      },
      {
        prop: 'Proposal_Name'
      },
      {
        prop: 'Approval_Stage'
      },
      {
        prop: 'PriceListId'
      },
      {
        prop: '_AccountId'
      },
      {
        prop: 'Grand_Total',
        value: (record) => {
          return this.currencyPipe.transform(_.get(_.find(_.get(record, 'ProposalSummaryGroups'), {LineType : 'Grand Total'}), 'NetPrice'));
        }
      },
      {
        prop: 'ExpectedStartDate'
      },
      {
        prop: 'ExpectedEndDate'
      },
      {
        prop: 'LastModifiedDate'
      }
    ],
    children : ['ProposalSummaryGroups']
  };

  filterList$: BehaviorSubject<Array<AFilter>> = new BehaviorSubject<Array<AFilter>>([]);

  constructor(private quoteService: QuoteService, private cartService: CartService) { }

  ngOnInit() {
    this.aggregateData$ = combineLatest(
      this.cartService.getMyCart(),
      this.filterList$
    )
    .pipe(
      switchMap(([cart, filterList]) => {
        return combineLatest(
          of(cart),
          this.quoteService.query({
            aggregate: true,
            groupBy: ['Approval_Stage', 'RFP_Response_Due_Date'],
            filters: filterList
          })
        );
      }),
      map(([cart, data]) => {
        return {
          tableOptions: _.clone(_.assign(this.tableOptions, {filters: this.filterList$.value})),
          total: _.get(data, 'total_records', _.sumBy(data, 'total_records')),
          totalAmount: _.get(data, 'SUM_Total_Quote_Amount', _.sumBy(data, 'SUM_Total_Quote_Amount')),
          amountsByStatus: _.isArray(data)
          ? _.omit(_.mapValues(_.groupBy(data, 'Apttus_Proposal__Approval_Stage__c'), s => _.sumBy(s, 'SUM_Total_Quote_Amount')), 'null')
          : _.zipObject([_.get(data, 'Apttus_Proposal__Approval_Stage__c')], _.map([_.get(data, 'Apttus_Proposal__Approval_Stage__c')], key => _.get(data, 'SUM_Grand_Total'))),
          quotesByStatus: _.isArray(data)
            ? _.omit(_.mapValues(_.groupBy(data, 'Apttus_Proposal__Approval_Stage__c'), s => _.sumBy(s, 'total_records')), 'null')
            : _.zipObject([_.get(data, 'Apttus_Proposal__Approval_Stage__c')], _.map([_.get(data, 'Apttus_Proposal__Approval_Stage__c')], key => _.get(data, 'total_records'))),
          quotesByDueDate: _.isArray(data)
            ? _.omit(_.mapKeys(_.mapValues(_.groupBy(data, 'Apttus_Proposal__RFP_Response_Due_Date__c'), s => _.sumBy(s, 'total_records')), _.bind(this.generateLabel, this)), 'null')
            : _.zipObject([_.get(data, 'Apttus_Proposal__RFP_Response_Due_Date__c')], _.map([_.get(data, 'Apttus_Proposal__RFP_Response_Due_Date__c')], key => _.get(data, 'total_records')))
        };
      })
    );
  }

  generateLabel(date): string {
    const today = moment(new Date());
    const dueDate = (date) ? moment(date) : null;
    if (dueDate && dueDate.diff(today, 'days') < this.minDaysFromDueDate) {
      if (!_.includes(this.colorPalette, 'rgba(208, 2, 27, 1)')) this.colorPalette.push('rgba(208, 2, 27, 1)');
      return '< ' + this.minDaysFromDueDate + ' Days';
    }
    else if (dueDate && dueDate.diff(today, 'days') > this.minDaysFromDueDate && dueDate.diff(today, 'days') < this.maxDaysFromDueDate) {
      if (!_.includes(this.colorPalette, 'rgba(245, 166, 35, 1)')) this.colorPalette.push('rgba(245, 166, 35, 1)');
      return '< ' + this.maxDaysFromDueDate + ' Days';
    }
    else {
      if (!_.includes(this.colorPalette, 'rgba(43, 180, 39, 1)')) this.colorPalette.push('rgba(43, 180, 39, 1)');
      return '> ' + this.maxDaysFromDueDate + ' Days';
    }
  }

  handleFilterListChange(event: any) {
    this.filterList$.next(event);
  }
}
/** @ignore */
export interface QuoteListView{
  tableOptions: TableOptions;
  total: number;
  totalAmount: number;
  quotesByStatus: object;
  quotesByDueDate: object;
}
