import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { clone, assign, find, get, isArray, groupBy, sumBy, omit, zipObject, forOwn, mapValues, map, has, includes } from 'lodash';

import { AFilter, ACondition } from '@congacommerce/core';
import { TableOptions, CustomFilterView } from '@congacommerce/elements';
import { Quote, QuoteService, LocalCurrencyPipe, AccountService } from '@congacommerce/ecommerce';
const _moment = moment;
@Component({
  selector: 'app-quote-list',
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.scss']
})
export class QuoteListComponent implements OnInit {
  type = Quote;

  totalAmount$: Observable<number>;
  amountsByStatus$: Observable<number>;
  totalRecords$: Observable<number>;
  quotesByStatus$: Observable<number>;
  quotesByDueDate$: Observable<number>;
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
        prop: 'RFP_Response_Due_Date'
      },
      {
        prop: 'PriceListId'
      },
      {
        prop: 'Grand_Total',
        label: 'Total Amount',
        value: (record) => {
          return this.currencyPipe.transform(get(find(get(record, 'ProposalSummaryGroups'), { LineType: 'Grand Total' }), 'NetPrice'));
        }
      },
      {
        prop: 'AccountId'
      },
      {
        prop: 'LastModifiedDate'
      }
    ],
    children: ['ProposalSummaryGroups'],
    lookups: [
      {
        field: 'Account'
      },
      {
        field: 'PriceListId'
      },
      {
        field: 'Opportunity'
      },
      {
        field: 'Primary_Contact'
      },
      {
        field: 'BillToAccountId'
      },
      {
        field: 'ShipToAccountId'
      },
      {
        field: 'Owner'
      }
    ]
  };

  filterList$: BehaviorSubject<Array<AFilter>> = new BehaviorSubject<Array<AFilter>>([]);

  customfilter: Array<CustomFilterView> = [
    {
      label:'Pending Duration',
      mapApiField: 'Apttus_Proposal__RFP_Response_Due_Date__c',
      type: 'double',
      minVal: -99,
      execute: (val: number, condition: ACondition): Date =>{
          return this.handlePendingDuration(val, condition);
      }
    }
  ];

  constructor(private quoteService: QuoteService, private currencyPipe: LocalCurrencyPipe, private accountService: AccountService) { }

  ngOnInit() { 
    combineLatest([
      this.accountService.getCurrentAccount(),
      this.filterList$
    ]).pipe(
      switchMap(([account, filterList]) => {
        return combineLatest([
          of(account),
          this.quoteService.query({
            aggregate: true,
            groupBy: ['Approval_Stage', 'RFP_Response_Due_Date'],
            filters: this.filterList$.value,
            skipCache: true
          }),
          this.quoteService.getGrandTotalByApprovalStage()
        ]);
      })
    ).subscribe(([account, data, totalByStage]) => {
      this.tableOptions = clone(assign(this.tableOptions, { filters: this.filterList$.value }));
      this.totalRecords$ = of(get(data, 'total_records', sumBy(data, 'total_records')));
      this.totalAmount$ = of(get(totalByStage, 'NetPrice', sumBy(totalByStage, 'NetPrice')));

      this.amountsByStatus$ = of(
        isArray(totalByStage)
          ? omit(mapValues(groupBy(totalByStage, 'Stage'), s => sumBy(s, 'NetPrice')), 'null')
          : zipObject([get(totalByStage, 'Stage')], map([get(totalByStage, 'Stage')], key => get(totalByStage, 'NetPrice'))),
      );

      this.quotesByStatus$ = of(
        isArray(data)
          ? omit(mapValues(groupBy(data, 'Apttus_Proposal__Approval_Stage__c'), s => sumBy(s, 'total_records')), 'null')
          : zipObject([get(data, 'Apttus_Proposal__Approval_Stage__c')], map([get(data, 'Apttus_Proposal__Approval_Stage__c')], key => get(data, 'total_records')))
      );
      
      const quotesDuedate ={};
      if(isArray(data)) {
        forOwn(omit(mapValues(groupBy(data, 'Apttus_Proposal__RFP_Response_Due_Date__c'), s => sumBy(s, 'total_records')), 'null'), (value,key) => {
            const label = this.generateLabel(key);
            if(has(quotesDuedate,label)) 
              value = quotesDuedate[label]+ value;
            quotesDuedate[label] = value;
        });
      }

      this.quotesByDueDate$ = of(
        isArray(data)
          ? quotesDuedate
          : zipObject([get(data, 'Apttus_Proposal__RFP_Response_Due_Date__c')], map([get(data, 'Apttus_Proposal__RFP_Response_Due_Date__c')], key => get(data, 'total_records')))
      )
    });
  }

  generateLabel(date): string {
    const today = moment(new Date());
    const dueDate = (date) ? moment(date) : null;
    if (dueDate && dueDate.diff(today, 'days') < this.minDaysFromDueDate) {
      if (!includes(this.colorPalette, 'rgba(208, 2, 27, 1)')) this.colorPalette.push('rgba(208, 2, 27, 1)');
      return '< ' + this.minDaysFromDueDate + ' Days';
    }
    else if (dueDate && dueDate.diff(today, 'days') > this.minDaysFromDueDate && dueDate.diff(today, 'days') < this.maxDaysFromDueDate) {
      if (!includes(this.colorPalette, 'rgba(245, 166, 35, 1)')) this.colorPalette.push('rgba(245, 166, 35, 1)');
      return '< ' + this.maxDaysFromDueDate + ' Days';
    }
    else {
      if (!includes(this.colorPalette, 'rgba(43, 180, 39, 1)')) this.colorPalette.push('rgba(43, 180, 39, 1)');
      return '> ' + this.maxDaysFromDueDate + ' Days';
    }
  }

  handleFilterListChange(event: any) {
    this.filterList$.next(event);
  }

  handlePendingDuration(val: number, condition: ACondition): Date {
    const date = _moment(new Date()).format('YYYY-MM-DD');
    let momentdate ;
    if(condition.filterOperator === 'GreaterThan')
      momentdate = _moment(date).add(val,'d').format('YYYY-MM-DD');
    else if(condition.filterOperator === 'LessThan')
      momentdate =  _moment(date).subtract(val,'d').format('YYYY-MM-DD');
    return momentdate;
  }
}
