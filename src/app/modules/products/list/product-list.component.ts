import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService, Category, SearchService, ProductService, ProductResult,  AccountService} from '@apttus/ecommerce';
import { get, set, compact, map, isNil, isEmpty, remove, isEqual } from 'lodash';
import { ACondition, AJoin } from '@apttus/core';
import { Observable, of, BehaviorSubject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { map as rmap, mergeMap } from 'rxjs/operators';

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
  data$: BehaviorSubject<ProductResult> = new BehaviorSubject<ProductResult>(null);
  productFamilies$: Observable<Array<string>> = new Observable<Array<string>>();
  category: Category;
  subscription: Subscription;


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
  constructor(private activatedRoute: ActivatedRoute, private accountService: AccountService, private searchService: SearchService, private categoryService: CategoryService, private router: Router, public productService: ProductService, private translateService: TranslateService) {}

  /**
   * @ignore
   */
  ngOnDestroy() {
    if (!isNil(this.subscription))
      this.subscription.unsubscribe();
  }

  /**
   * @ignore
   */
  ngOnInit() {
    this.subscription = this.accountService.getCurrentAccount().subscribe(res => this.getResults());

    this.productFamilies$ = this.productService.query({ groupBy: ['Family'] })
      .pipe(
        rmap(productList => compact(map(productList, 'Family')))
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
    this.ngOnDestroy();
    this.subscription = this.activatedRoute.params.pipe(
      mergeMap(params => {
        this.searchString = get(params, 'query');

        const categories =  (!isNil(get(params, 'categoryId')) && isEmpty(this.subCategories)) ? [get(params, 'categoryId')] : null;

          return this.productService.getProducts(categories, this.pageSize, this.page, this.sortField, 'ASC', this.searchString, this.conditions);
      }),
    ).subscribe(r => {
      console.log(r);
      this.data$.next(r);
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
  onCategory(categoryList: Array<Category>){
    const category = get(categoryList, '[0]');
    if(category){
      this.subCategories = [];
      this.router.navigate(['/products/category', category.Id]);
    }
  }

  /**
   * Event handler for the pagination component when the page is changed.
   * @param evt Event object that was fired.
   */
  onPage(evt) {
    if(get(evt, 'page') !== this.page){
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
    remove(this.conditions, (c) => isEqual(c, condition));
    this.page = 1;

    this.conditions.push(condition);
    this.getResults();
  }

  /**
   * This function is called when removing saerch filter criteria to product grid.
   * @param condition Search filter query to remove from products grid.
   */
  onFilterRemove(condition: ACondition) {
    remove(this.conditions, (c) => isEqual(c, condition));
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
    if (this.productFamilyFilter) remove(this.conditions, this.productFamilyFilter);
    if (event.length > 0) {
      let values = [];
      event.forEach(item => values.push(item));
      this.productFamilyFilter = new ACondition(this.productService.type, 'Family', 'In', values);
      this.conditions.push(this.productFamilyFilter);
    }
    this.getResults();
  }

}
