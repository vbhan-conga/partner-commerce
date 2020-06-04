import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Cart, CartService, ConstraintRuleService, CartItemService, Product } from '@apttus/ecommerce';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CartResolver, ManageCartState } from '../services/cart.resolver';

@Component({
  selector: 'app-cart-detail',
  templateUrl: './cart-detail.component.html',
  styleUrls: ['./cart-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Manage Cart component is used to show the list of cart line item(s)  and summary of the cart.
 */
export class CartDetailComponent implements OnInit {
  @ViewChild('discardChangesTemplate', { static: false }) discardChangesTemplate: TemplateRef<any>;


  discardChangesModal: BsModalRef;
  /**
   * Observable of the information for rendering this view.
   */
  view$: Observable<ManageCartState>;

  productList$: Observable<Array<Product>>;

  constructor(private crService: ConstraintRuleService, private resolver: CartResolver) { }

  ngOnInit() {
    this.view$ = this.resolver.state();
    this.productList$ = this.crService.getRecommendationsForCart();
  }

  trackById(index, record): string {
    return _.get(record, 'MainLine.Id');
  }
}
