import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, flatMap, map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Order, OrderLineItem, OrderService, UserService, ProductInformationService, ItemGroup, LineItemService, Note, NoteService, EmailService, orderLineItemFactory, AccountService, Contact, CartService, Cart  } from '@apttus/ecommerce';
import { ExceptionService, LookupOptions } from '@apttus/elements';
import { ACondition, APageInfo, AFilter } from '@apttus/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderDetailComponent implements OnInit, OnDestroy {

  /**
   * Observable instance of an Order.
   */
  order$: Observable<Order>;
  orderLineItems$: Observable<Array<ItemGroup>>;

  /**
    * Boolean observable to check if user is logged in.
    */
  isLoggedIn$: Observable<boolean>;

  orderStatusSteps = [
    'Draft',
    'Generated',
    'Presented',
    'Pending',
    'In Fulfillment',
    'Fulfilled',
    'Activated'
  ];

  orderStatusMap = {
    'Draft': 'Draft',
    'Pending': 'Pending',
    'Processing': 'Generated',
    'In Fulfillment': 'In Fulfillment',
    'Partially Fulfilled': 'Partially Fulfilled',
    'Fulfilled': 'Fulfilled',
    'Activated': 'Activated',
    'In Amendment': 'Draft',
    'Being Amended': 'Draft',
    'Superseded': 'Draft',
    'Generated': 'Generated',
    'Presented': 'Presented'
  };

  isLoading: boolean = false;
  note: Note = new Note();
  comments_loader: boolean = false;
  lineItem_loader: boolean = false;
  lookupOptions: LookupOptions = {
    primaryTextField: 'Name',
    secondaryTextField: 'Email'
  };

  private subscriptions: Subscription[] = [];

  constructor(private activatedRoute: ActivatedRoute, private orderService: OrderService,
    private userService: UserService, private productInformationService: ProductInformationService,
    private exceptionService: ExceptionService, private noteService: NoteService,
    private lineItemService: LineItemService, private router: Router, private emailService: EmailService,
    private accountService: AccountService, private cartService: CartService) { }

  ngOnInit() {
    this.order$ = this.activatedRoute.params
      .pipe(
        filter(params => _.get(params, 'id') != null),
        flatMap(params => this.orderService.query({
          conditions: [new ACondition(this.orderService.type, 'Id', 'In', [_.get(params, 'id')])],
          waitForExpansion: false
        })),
        map(orderList => _.get(orderList, '[0]'))
      );
    this.isLoggedIn$ = this.userService.isLoggedIn();
    this.orderLineItems$ = this.order$.pipe(
      map(order => {
        if (order.Status === 'Partially Fulfilled' && _.indexOf(this.orderStatusSteps, 'Fulfilled') > 0)
          this.orderStatusSteps[_.indexOf(this.orderStatusSteps, 'Fulfilled')] = 'Partially Fulfilled';
        if (order.Status === 'Fulfilled' && _.indexOf(this.orderStatusSteps, 'Partially Fulfilled') > 0)
          this.orderStatusSteps[_.indexOf(this.orderStatusSteps, 'Partially Fulfilled')] = 'Fulfilled';
        return LineItemService.groupItems(order.OrderLineItems);
      })
    );
    this.subscriptions.push(this.accountService.getCurrentAccount().subscribe(account => {
      // Setting lookup options for primary contact field
      this.lookupOptions.conditions = [new ACondition(Contact, 'AccountId', 'Equal', _.get(account, 'Id'))];
      this.lookupOptions.expressionOperator = 'AND';
      this.lookupOptions.filters = null;
      this.lookupOptions.sortOrder = null;
      this.lookupOptions.page = new APageInfo(10);
    }));
  }

  /**
   * @ignore
   */
  getTotalPromotions(order: Order): number {
    return ((_.get(order, 'OrderLineItems.length') > 0)) ? _.sum(_.get(order, 'OrderLineItems').map(res => res.IncentiveAdjustmentAmount)) : 0;
  }

  /**
   * @ignore
   */
  getChildItems(orderLineItems: Array<OrderLineItem>, lineItem: OrderLineItem): Array<OrderLineItem> {
    return orderLineItems.filter(orderItem => !orderItem.IsPrimaryLine && orderItem.PrimaryLineNumber === lineItem.PrimaryLineNumber);
  }

  /**
 * @ignore
 */
  downloadAttachment(attachmentId: string, parentId: string) {
    return this.productInformationService.getAttachmentUrl(attachmentId, parentId);
  }

  confirmOrder(orderId: string, primaryContactId: string) {
    this.isLoading = true;
    this.orderService.acceptOrder(orderId).subscribe((res) => {
      this.isLoading = false;
      if (res) {
        this.exceptionService.showSuccess('ACTION_BAR.ORDER_CONFIRMATION_TOASTR_MESSAGE', 'ACTION_BAR.ORDER_CONFIRMATION_TOASTR_TITLE');
        this.emailService.orderStatusChangeNotification('CustomerOrderEmailNotificationsTemplate', orderId, primaryContactId).pipe(take(1)).subscribe();
      }
      else
        this.exceptionService.showError('ACTION_BAR.ORDER_CONFIRMATION_FAILURE');
    });
  }

  addComment(orderId: string) {
    this.comments_loader = true;
    _.set(this.note, 'ParentId', orderId);
    _.set(this.note, 'OwnerId', _.get(this.userService.me(), 'Id'));
    if (!this.note.Title) {
      _.set(this.note, 'Title', 'Notes Title');
    }
    this.noteService.create([this.note])
      .subscribe(r => {
        this.clear();
        this.comments_loader = false;
      },
      err => {
        this.exceptionService.showError(err);
        this.comments_loader = false;
        });
  }

  editOrderItems(order: Order) {
    this.lineItem_loader = true;
    this.accountService.getCurrentAccount()
    .pipe(
      take(1),
      switchMap(account => {
        return this.cartService.query({
          filters: [
            new AFilter(
              this.cartService.type,
              [
                new ACondition(this.cartService.type, 'OrderId', 'Equal', order.Id),
                new ACondition(this.cartService.type, 'AccountId', 'Equal', account.Id),
              ]
            )
          ]
        })
        .pipe(take(1)) as Observable<Array<Cart>>;
      }),
      switchMap(carts => {
        if (!_.isEmpty(_.filter(carts, cart => cart.Status === 'New'))) {
          return this.cartService.setCartActive(
              _.first(
                _.filter(carts, cart => cart.Status === 'New')
              )
            );
        }
        else return this.orderService.convertOrderToCart(order);
      })
    ).pipe(take(1)).subscribe(cart => {
      this.lineItem_loader = false;
      this.router.navigate(['/carts', 'active'])
      .then(result => this.lineItem_loader = false)
      .catch(error => {
        this.exceptionService.showError(error);
        this.lineItem_loader = false;
      });
    },
      err => {
        this.exceptionService.showError(err),
          this.lineItem_loader = false;
      });
  }

  clear() {
    _.set(this.note, 'Body', null);
    _.set(this.note, 'Title', null);
    _.set(this.note, 'Id', null);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}