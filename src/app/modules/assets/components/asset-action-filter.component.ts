import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AFilter } from '@apttus/core';

@Component({
  selector: 'app-asset-action-filter',
  template: `
    <div class="card animated fadeIn">
      <div class="card-body">
        <h5 class="card-title">{{'INSTALLED_PRODUCTS.ASSET_ACTION_FILTER.ASSET_ACTION' | translate}} </h5>
        <ul class="list-unstyled pl-2">
          <li>
            <div class="custom-control custom-radio">
              <input
                #all
                type="radio"
                id="assetActionAll"
                class="custom-control-input"
                name="assetAction"
                value="All"
                (change)="handleChange($event)"
                [checked]="value === 'All' || value == null"
              >
              <label class="custom-control-label" for="assetActionAll">
                {{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.ALL' | translate}}
              </label>
            </div>
          </li>
          <li>
            <div class="custom-control custom-radio">
              <input
                #renew
                type="radio"
                id="renew"
                class="custom-control-input"
                name="assetAction"
                value="Renew"
                (change)="handleChange($event)"
                [checked]="value === 'Renew'"
              >
              <label class="custom-control-label" for="renew">
                {{'COMMON.RENEW' | translate}}
              </label>
            </div>
          </li>
          <li>
            <div class="custom-control custom-radio">
              <input
                #terminate
                type="radio"
                id="terminate"
                class="custom-control-input"
                name="assetAction"
                value="Terminate"
                (change)="handleChange($event)"
                [checked]="value === 'Terminate'"
              >
              <label class="custom-control-label" for="terminate">
                {{'COMMON.TERMINATE' | translate}}
              </label>
            </div>
          </li>
          <li>
            <div class="custom-control custom-radio">
              <input
                #buyMore
                type="radio"
                id="buyMore"
                class="custom-control-input"
                name="assetAction"
                value="Buy More"
                (change)="handleChange($event)"
                [checked]="value === 'Buy More'"
              >
              <label class="custom-control-label" for="buyMore">
                {{'COMMON.BUY_MORE' | translate}}
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
export class AssetActionFilterComponent {

  @Input() value: string = 'All';

  @Output() valueChange: EventEmitter<AFilter> = new EventEmitter();

  handleChange(event: any) {
    this.valueChange.emit(event.target.value);
  }
}
