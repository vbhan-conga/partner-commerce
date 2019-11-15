import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService, Category, SearchResults, SearchService, ProductCategory, ProductService, AccountService } from '@apttus/ecommerce';
import * as _ from 'lodash';
import { ACondition, AJoin } from '@apttus/core';
import { Observable, of, BehaviorSubject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { map, take, mergeMap, tap } from 'rxjs/operators';

/**
 * Product list component shows all the products in a list for user selection.
 */
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {

  /**
   * Current page used by the pagination component. Default is 1.
   */
  page = 1;
  /**
   * Number of records per page used by the pagination component. Default is 12.
   */
  pageSize = 12;
  /**
   * Layout in which one wants to see products. Grid/list. Default is Grid.
   */
  view = 'grid';
  /**
   * A field name on which one wants to apply sorting.
   */
  sortField: string;
  /**
   * Value of the product family field filter.
   */
  productFamilyFilter: ACondition;
  /**
   * Condition to filter products from all products.
   */
  conditions: Array<ACondition> = new Array<ACondition>();
  /**
   * Used to hold the current array of subcategories that are selected.
   */
  subCategories: Array<Category> = [];
  joins: Array<AJoin> = new Array<AJoin>();
  /**
   * Search query to filter products list from grid.
   */
  searchString: string = null;
  searchResults$: BehaviorSubject<SearchResults> = new BehaviorSubject<SearchResults>(null);
  productFamilies$: Observable<Array<string>> = new Observable<Array<string>>();
  category: Category;
  subscription: Subscription;
  routeSub: Subscription;

  /**
   * Control over button's text/label of pagination component for Multi-Language Support
   */
  paginationButtonLabels: any = {
    first: '',
    previous: '',
    next: '',
    last: ''
  };
  /**
   * Array of product families associated with the list of assets.
   */

  /**
   * @ignore
   */
  constructor(private activatedRoute: ActivatedRoute, private searchService: SearchService, private categoryService: CategoryService, private router: Router, public productService: ProductService, private translateService: TranslateService, private accountService: AccountService) { }

  /**
   * @ignore
   */
  ngOnDestroy() {
    if (!_.isNil(this.subscription))
      this.subscription.unsubscribe();
    this.routeSub.unsubscribe();
  }

  /**
   * @ignore
   */
  ngOnInit() {
    this.subscription = this.accountService.getCurrentAccount().subscribe(res => this.getResults());

    this.productFamilies$ = this.productService.query({ groupBy: ['Family'] })
      .pipe(
        map(productList => _.compact(_.map(productList, 'Family')))
      );

    this.translateService.stream('PAGINATION').subscribe((val: string) => {
      this.paginationButtonLabels.first = val['FIRST'];
      this.paginationButtonLabels.previous = val['PREVIOUS'];
      this.paginationButtonLabels.next = val['NEXT'];
      this.paginationButtonLabels.last = val['LAST'];
    });
  }

  /**
   * @ignore
   */
  getResults() {
    if (!_.isNil(this.routeSub))
      this.routeSub.unsubscribe();
    this.routeSub = this.activatedRoute.params.pipe(
      tap(() => {
        if (!_.isNil(this.searchResults$)) {
          const results = this.searchResults$.value;
          _.set(results, 'productList', null);
          this.searchResults$.next(results);
        }
      }),
      mergeMap(params => {
        this.searchString = _.get(params, 'query');

        if (!_.isNil(_.get(params, 'categoryName')) && _.isEmpty(this.subCategories))
          return this.categoryService.getCategoryByName(_.get(params, 'categoryName')).pipe(
            tap(category => this.category = category),
            mergeMap(category => this.categoryService.getCategoryBranchChildren([category.Id])),
            tap(categoryList => {
              this.joins = [new AJoin(ProductCategory, 'Id', 'ProductId', [new ACondition(ProductCategory, 'ClassificationId', 'In', categoryList.map(c => c.Id))])];
            })
          );
        else if (!_.isEmpty(this.subCategories)) {
          _.remove(this.joins, (j) => j.type === ProductCategory);
          this.joins.push(new AJoin(ProductCategory, 'Id', 'ProductId', [new ACondition(ProductCategory, 'ClassificationId', 'In', this.subCategories.map(category => category.Id))]));
          return of(null);
        }
        else {
          return of(null);
        }
      }),
      mergeMap(() => {
        return this.searchService.searchProducts(this.searchString, this.pageSize, this.page, this.sortField, 'ASC', this.conditions, this.joins);
    })
    ).subscribe(r => {
      this.searchResults$.next(r);
    });
  }

  /**
   * This function helps at UI to scroll at the top of the product list.
   */
  scrollTop() {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
      window.requestAnimationFrame(this.scrollTop);
      window.scrollTo(0, c - c / 8);
    }
  }

  /**
   * Filters peers Category from the categorylist.
   * @param categoryList Array of Category.
   */
  onCategory(categoryList: Array<Category>) {
    const category = _.get(categoryList, '[0]');
    if (category)
      this.router.navigate(['/products/category', category.Name]);
  }

  /**
   * Event handler for the pagination component when the page is changed.
   * @param evt Event object that was fired.
   */
  onPage(evt) {
    if (_.get(evt, 'page') !== this.page) {
      this.page = evt.page;
      this.getResults();
    }
  }

  /**
   * @ignore
   */
  onPriceTierChange(evt) {
    this.page = 1;
    this.getResults();
  }

  /**
   * Filters child category from the categorylist.
   * @param categoryList Array of Category.
   */
  onSubcategoryFilter(categoryList: Array<Category>) {
    this.subCategories = categoryList;
    this.page = 1;
    this.getResults();
  }

  /**
   * This function is called when adding saerch filter criteria to product grid.
   * @param condition Search filter query to filter products.
   */
  onFilterAdd(condition: ACondition) {
    _.remove(this.conditions, (c) => _.isEqual(c, condition));
    this.page = 1;

    this.conditions.push(condition);
    this.getResults();
  }

  /**
   * This function is called when removing saerch filter criteria to product grid.
   * @param condition Search filter query to remove from products grid.
   */
  onFilterRemove(condition: ACondition) {
    _.remove(this.conditions, (c) => _.isEqual(c, condition));
    this.page = 1;
    this.getResults();
  }

  /**
   * @ignore
   */
  onFieldFilter(evt: ACondition) {
    this.page = 1;
    this.getResults();
  }

  /**
   * Fired when sorting is changed on products grid.
   * @param evt Event object that was fired.
   */
  onSortChange(evt) {
    this.page = 1;
    this.sortField = evt === 'Name' ? evt : null;
    this.getResults();
  }

  /**
   * Fired when page size is changed for products grid.
   * @param event Event object that was fired.
   */
  onPageSizeChange(event) {
    this.pageSize = event;
    this.getResults();
  }

  /**
   * Filter on products grid forby product family.
   * @param event Event Object that was fired.
   */
  handlePicklistChange(event: any) {
    if (this.productFamilyFilter) _.remove(this.conditions, this.productFamilyFilter);
    if (event.length > 0) {
      let values = [];
      event.forEach(item => values.push(item));
      this.productFamilyFilter = new ACondition(this.productService.type, 'Family', 'In', values);
      this.conditions.push(this.productFamilyFilter);
    }
    this.getResults();
  }

}
