import { Component, OnInit } from '@angular/core';
import { ACondition, AFilter, AObject, Operator } from '@apttus/core';
import {
  CartService,
  AssetService,
  AssetLineItemExtended,
  AssetLineItem,
  StorefrontService,
  Product
} from '@apttus/ecommerce';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import * as _ from 'lodash';
import {
  AssetModalService,
  TableOptions,
  TableAction,
  ChildRecordOptions,
  FilterOptions
} from '@apttus/elements';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { ClassType } from 'class-transformer/ClassTransformer';

/**
 * Asset list component is used to set the structure of the asset list page.
 *
 * @example
 * <app-asset-list></app-asset-list>
 */
@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.scss'],
  providers: [DatePipe]
})
export class AssetListComponent implements OnInit {
  /**
   * The view object used for rendering information in the template.
   */
  view$: BehaviorSubject<AssetListView> = new BehaviorSubject<AssetListView>(
    null
  );
  /**
   * Value of the days to renew filter.
   */
  renewFilter: AFilter;
  /**
   * Value of the price type filter.
   */
  priceTypeFilter: AFilter;
  /**
   * Value of the asset action filter.
   */
  assetActionFilter: AFilter;
  /**
   * Value of the product family field filter.
   */
  productFamilyFilter: AFilter;
  /**
   * Value of the advanced filter component.
   */
  advancedFilters: Array<AFilter> = [];
  /**
   * Configuration object used to configure the data filter.
   */
  advancedFilterOptions: FilterOptions = {
    visibleFieldsWithOperators: [
      {
        field: 'Name',
        operators: [
          Operator.CONTAINS,
          Operator.DOES_NOT_CONTAIN,
          Operator.BEGINS_WITH,
          Operator.EQUAL,
          Operator.NOT_EQUAL
        ]
      },
      {
        field: 'SellingFrequency',
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.IN,
          Operator.NOT_IN
        ]
      },
      {
        field: 'StartDate',
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.GREATER_THAN,
          Operator.GREATER_EQUAL,
          Operator.LESS_THAN,
          Operator.LESS_EQUAL
        ]
      },
      {
        field: 'EndDate',
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.GREATER_THAN,
          Operator.GREATER_EQUAL,
          Operator.LESS_THAN,
          Operator.LESS_EQUAL
        ]
      },
      {
        field: 'NetPrice',
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.GREATER_THAN,
          Operator.GREATER_EQUAL,
          Operator.LESS_THAN,
          Operator.LESS_EQUAL
        ]
      },
      {
        field: 'Quantity',
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.GREATER_THAN,
          Operator.GREATER_EQUAL,
          Operator.LESS_THAN,
          Operator.LESS_EQUAL
        ]
      },
      {
        field: 'AssetStatus',
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.IN,
          Operator.NOT_IN
        ]
      },
      {
        field: 'PriceType',
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.IN,
          Operator.NOT_IN
        ]
      },
      {
        field: 'ProductId',
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.IN,
          Operator.NOT_IN
        ]
      }
    ]
  };
  /**
   * Default filters that will be applied to the table and chart components.
   */
  defaultFilters: Array<AFilter> = [
    new AFilter(this.assetService.type, [
      new ACondition(this.assetService.type, 'LineType', 'NotEqual', 'Option'),
      new ACondition(
        this.assetService.type,
        'Product.ConfigurationType',
        'NotEqual',
        'Option'
      ),
      new ACondition(this.assetService.type, 'IsPrimaryLine', 'Equal', true)
    ])
  ];
  /**
   * Flag to pre-select items in the table component.
   */
  preselectItemsInGroups: boolean = false;
  /**
   * Color palette used for the chart component styling.
   */
  colorPalette = [
    '#D22233',
    '#F2A515',
    '#6610f2',
    '#008000',
    '#17a2b8',
    '#0079CC',
    '#CD853F',
    '#6f42c1',
    '#20c997',
    '#fd7e14'
  ];
  /**
   * Map of asset actions to their appropriate filter.
   */
  private assetActionMap = {
    All: null,
    Renew: new AFilter(AssetLineItem, [
      new ACondition(AssetLineItem, 'PriceType', 'NotEqual', 'One Time')
    ]),
    Terminate: new AFilter(AssetLineItem, [
      new ACondition(AssetLineItem, 'PriceType', 'NotEqual', 'One Time')
    ]),
    'Buy More': new AFilter(this.assetService.type, [
      new ACondition(this.assetService.type, 'PriceType', 'Equal', 'One Time'),
      new ACondition(
        Product,
        'Product.ConfigurationType',
        'Equal',
        'Standalone'
      )
    ])
  };
  /**
   * Mass actions to be used with the table configuration options.
   */
  private massActions: Array<TableAction> = [
    {
      icon: 'fa-sync',
      massAction: true,
      label: 'Renew',
      theme: 'primary',
      validate(record: AssetLineItemExtended): boolean {
        return record.canRenew();
      },
      action: (recordList: Array<AObject>): Observable<void> => {
        this.assetModalService.openRenewModal(
          <AssetLineItem>recordList[0],
          <Array<AssetLineItem>>recordList
        );
        return of(null);
      }
    },
    {
      icon: 'fa-ban',
      massAction: true,
      label: 'Terminate',
      theme: 'danger',
      validate(record: AssetLineItemExtended): boolean {
        return record.canTerminate();
      },
      action: (recordList: Array<AObject>): Observable<void> => {
        this.assetModalService.openTerminateModal(
          <AssetLineItem>recordList[0],
          <Array<AssetLineItem>>recordList
        );
        return of(null);
      }
    },
    {
      icon: 'fa-dollar-sign',
      massAction: false,
      label: 'Buy More',
      theme: 'primary',
      validate(record: AssetLineItemExtended): boolean {
        return record.canBuyMore();
      },
      action: (recordList: Array<AObject>): Observable<void> => {
        this.assetModalService.openBuyMoreModal(
          <AssetLineItem>recordList[0],
          <Array<AssetLineItem>>recordList
        );
        return of(null);
      }
    },
    {
      icon: 'fa-wrench',
      label: 'Change Configuration',
      theme: 'primary',
      validate(record: AssetLineItemExtended): boolean {
        return record.canChangeConfiguration();
      },
      action: (recordList: Array<AObject>): Observable<void> => {
        this.assetModalService.openChangeConfigurationModal(
          <AssetLineItem>recordList[0],
          <Array<AssetLineItem>>recordList
        );
        return of(null);
      }
    }
  ];

  constructor(
    private route: ActivatedRoute,
    public assetService: AssetService,
    private assetModalService: AssetModalService,
    protected cartService: CartService,
    protected toastr: ToastrService,
    private storefrontService: StorefrontService
  ) {}

  /**
   * @ignore
   */
  ngOnInit() {
    if (!_.isEmpty(_.get(this.route, 'snapshot.queryParams'))) {
      this.preselectItemsInGroups = true;
      this.assetActionFilter = this.assetActionMap[
        _.get(this.route, 'snapshot.queryParams.action')
      ];
      this.advancedFilters = [
        new AFilter(
          this.assetService.type,
          _.map(
            _.split(
              decodeURIComponent(
                _.get(this.route, 'snapshot.queryParams.productIds')
              ),
              ','
            ),
            id =>
              new ACondition(this.assetService.type, 'ProductId', 'Equal', id)
          ),
          null,
          'OR'
        )
      ];
    }
    this.loadView();
  }
  /**
   * Loads the view data.
   */
  loadView() {
    combineLatest(
      this.assetService.query({
        aggregate: true,
        groupBy: ['PriceType'],
        filters: this.getFilters()
      }),
      this.storefrontService.getStorefront()
    )
      .pipe(take(1))
      .subscribe(([chartData, storefront]) => {
        this.view$.next({
          tableOptions: {
            groupBy: 'Product.Name',
            filters: this.getFilters(),
            defaultSort: {
              column: 'Product.Name',
              direction: 'ASC'
            },
            columns: [
              { prop: 'Name' },
              { prop: 'SellingFrequency' },
              { prop: 'StartDate' },
              { prop: 'EndDate' },
              { prop: 'NetPrice' },
              { prop: 'Quantity' },
              { prop: 'AssetStatus' },
              { prop: 'PriceType' }
            ],
            actions: _.filter(this.massActions, action =>
              _.includes(
                _.get(storefront, 'AssetActions'),
                _.get(action, 'label')
              )
            ),
            childRecordOptions: {
              filters: [
                new AFilter(this.assetService.type, [
                  new ACondition(
                    this.assetService.type,
                    'LineType',
                    'NotEqual',
                    'Option'
                  ),
                  new ACondition(
                    Product,
                    'Product.ConfigurationType',
                    'NotEqual',
                    'Option'
                  ),
                  new ACondition(
                    this.assetService.type,
                    'IsPrimaryLine',
                    'Equal',
                    false
                  )
                ])
              ],
              relationshipField: 'BundleAssetId',
              childRecordFields: [
                'ChargeType',
                'SellingFrequency',
                'StartDate',
                'EndDate',
                'NetPrice',
                'Quantity',
                'AssetStatus',
                'PriceType'
              ]
            } as ChildRecordOptions,
            preselectItemsInGroups: this.preselectItemsInGroups
          } as TableOptions,
          assetType: AssetLineItemExtended,
          colorPalette: this.colorPalette,
          barChartData: _.isArray(chartData)
            ? _.omit(
                _.mapValues(
                  _.groupBy(chartData, 'Apttus_Config2__PriceType__c'),
                  s => _.sumBy(s, 'total_records')
                ),
                'null'
              )
            : _.zipObject(
                [_.get(chartData, 'Apttus_Config2__PriceType__c')],
                _.map([_.get(chartData, 'Apttus_Config2__PriceType__c')], key =>
                  _.get(chartData, 'total_records')
                )
              ),
          doughnutChartData: _.isArray(chartData)
            ? _.omit(
                _.mapValues(
                  _.groupBy(chartData, 'Apttus_Config2__PriceType__c'),
                  s => _.sumBy(s, 'SUM_NetPrice')
                ),
                'null'
              )
            : _.zipObject(
                [_.get(chartData, 'Apttus_Config2__PriceType__c')],
                _.map([_.get(chartData, 'Apttus_Config2__PriceType__c')], key =>
                  _.get(chartData, 'SUM_NetPrice')
                )
              ),
          assetActionValue: !_.isEmpty(
            _.get(this.route, 'snapshot.queryParams')
          )
            ? decodeURIComponent(
                _.get(this.route, 'snapshot.queryParams.action')
              )
            : 'All',
          advancedFilterList: this.advancedFilters
        } as AssetListView);
        this.preselectItemsInGroups = false;
      });
  }
  /**
   * Event handler for when the advanced filter changes.
   * @param event The event that was fired.
   */
  handleAdvancedFilterChange(event: any) {
    this.advancedFilters = event;
    this.loadView();
  }
  /**
   * Event handler for when the days to renew filter is changed.
   * @param event The Event that was fired.
   */
  onRenewalChange(event: AFilter) {
    this.renewFilter = event;
    this.loadView();
  }
  /**
   * Event handler for when price type filter is changed.
   * @param event Event object that was fired.
   */
  onPriceTypeChange(event: AFilter) {
    this.priceTypeFilter = event;
    this.loadView();
  }
  /**
   * Event handler for when the asset action filter changes.
   * @param event The event that was fired.
   */
  onAssetActionChange(event: string) {
    this.assetActionFilter = this.assetActionMap[event];
    this.loadView();
  }
  /**
   * Event handler for when the product family filter changes.
   * @param event The event that was fired.
   */
  onProductFamilyChange(event: AFilter) {
    this.productFamilyFilter = event;
    this.loadView();
  }
  /**
   * Get all the currently applied filters.
   */
  private getFilters() {
    return _.concat(
      this.defaultFilters,
      this.advancedFilters,
      this.renewFilter,
      this.priceTypeFilter,
      this.assetActionFilter,
      this.productFamilyFilter
    );
  }
}
/** @ignore */
interface AssetListView {
  tableOptions: TableOptions;
  assetType: ClassType<AObject>;
  colorPalette: Array<string>;
  barChartData: Object;
  doughnutChartData: Object;
  assetActionValue?: string;
  advancedFilterList?: Array<AFilter>;
}
