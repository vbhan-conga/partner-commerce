import { Component, Output, EventEmitter } from '@angular/core';
/**
 * Price type filter component is used to create an asset filter on the PriceType field.
 */
@Component({
  selector: 'app-price-type-filter',
  template: `
    <div class="card animated fadeIn">
      <div class="card-body">
        <h5 class="card-title">{{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.PRICE_TYPE' | translate}} </h5>
        <ul class="list-unstyled pl-2">
          <li>
            <div class="custom-control custom-radio">
              <input
                type="radio"
                  id="priceTypeAll"
                  class="custom-control-input"
                  name="priceType"
                  value=""
                  (change)="handleCheckChange($event)"
                  checked
                >
              <label class="custom-control-label" for="priceTypeAll">
              {{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.ALL' | translate}}
              </label>
            </div>
          </li>
          <li>
            <div class="custom-control custom-radio">
              <input
                type="radio"
                id="oneTime"
                class="custom-control-input"
                name="priceType"
                value="One Time"
                (change)="handleCheckChange($event)"
              >
              <label class="custom-control-label" for="oneTime">
              {{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.ONE_TIME' | translate}}
              </label>
            </div>
          </li>
          <li>
            <div class="custom-control custom-radio">
              <input
                type="radio"
                id="recurring"
                class="custom-control-input"
                name="priceType"
                value="Recurring"
                (change)="handleCheckChange($event)"
              >
              <label class="custom-control-label" for="recurring">
              {{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.RECURRING' | translate}}
              </label>
            </div>
          </li>
          <li>
            <div class="custom-control custom-radio">
              <input
                type="radio"
                id="usage"
                class="custom-control-input"
                name="priceType"
                value="Usage"
                (change)="handleCheckChange($event)"
              >
              <label class="custom-control-label" for="usage">
              {{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.USAGE' | translate}}
              </label>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    li {
      font-size: smaller;
      line-height: 24px;
    }
  `]
})
export class PriceTypeFilterComponent {
  /**
   * Event emitter for the value of the filter.
   */
  @Output() value: EventEmitter<string> = new EventEmitter();
  /**
   * Event handler for when a checkbox value has been changed.
   * @param event Event object that was fired.
   */
  handleCheckChange(event: any) {
    this.value.emit(event.target.value);
  }
}
