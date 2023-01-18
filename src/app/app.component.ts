import { Component, OnInit } from '@angular/core';
import { BatchSelectionService} from '@congacommerce/elements';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { get } from 'lodash';
@Component({
  selector: 'app-root',
  template: `
    <router-outlet>
      <div class="container d-flex align-items-center justify-content-center" *ngIf="loading">
        <apt-dots></apt-dots>
      </div>
    </router-outlet>
    <apt-product-drawer *ngIf="showDrawer$ | async"></apt-product-drawer>
  `,
  styles: [`.container{height: 90vh;}`]
})
export class AppComponent implements OnInit{
  showDrawer$: Observable<boolean>;
  constructor(
    private batchSelectionService: BatchSelectionService) {
  }
  loading = false;
  ngOnInit() {
    this.showDrawer$ = combineLatest([
      this.batchSelectionService.getSelectedProducts(),
      this.batchSelectionService.getSelectedLineItems()
    ])
      .pipe(map(([productList, lineItemList]) => get(productList, 'length', 0) > 0 || get(lineItemList, 'length', 0) > 0));
  }


}

