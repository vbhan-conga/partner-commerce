import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AFilter, ACondition } from '@apttus/core';
import { AssetService, AssetLineItem, Product } from '@apttus/ecommerce';
import { take } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-product-family-filter',
  template: `
  <div class="card mb-2">
    <div class="card-body">
      <h5 class="card-title"> {{'INSTALLED_PRODUCTS.PRODUCT_FAMILY' | translate}} </h5>
      <apt-input-select
        [picklistType]="'multipicklist'"
        [values]="productFamilies"
        placeholder="Select product families"
        (onChange)="handlePicklistChange($event)"
      ></apt-input-select>
    </div>
  </div>
  `
})
export class ProductFamilyFilterComponent implements OnInit {

  @Output() value: EventEmitter<AFilter> = new EventEmitter();

  productFamilies: Array<string> = [];

  constructor(private assetService: AssetService) {}

  ngOnInit() {
    this.assetService.query({groupBy: ['Product.Family']})
    .pipe(take(1))
    .subscribe(assets => {
      this.productFamilies = _.filter(_.map(assets, asset => asset.Product.Family), value => value != null);
    });
  }

  handlePicklistChange(event: any) {
    if (!_.isEmpty(event)) {
      this.value.emit(new AFilter(this.assetService.type, [new ACondition(Product, 'Product.Family', 'In', event)]));
    }
    else this.value.emit(null);
  }
}
