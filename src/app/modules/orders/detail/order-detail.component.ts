import { Component, OnInit, ViewEncapsulation, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewChecked, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import { filter, flatMap, map, switchMap, mergeMap, startWith, take } from 'rxjs/operators';
import { get, set, indexOf, first, sum, isEmpty, cloneDeep, filter as rfilter, find, compact, uniq, defaultTo } from 'lodash';
import { Order, Quote, OrderLineItem, OrderService, UserService, ProductInformationService, 
         ItemGroup, LineItemService, Note, NoteService, EmailService, AccountService,
        Contact, CartService, Cart, OrderLineItemService, Account, Attachment, AttachmentService  } from '@apttus/ecommerce';
import { ExceptionService, LookupOptions } from '@apttus/elements';
import { ACondition, APageInfo, AFilter, ApiService } from '@apttus/core';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderDetailComponent implements OnInit, OnDestroy, AfterViewChecked {

  /**
   * Observable instance of an Order.
   */
  order$: BehaviorSubject<Order> = new BehaviorSubject<Order>(null);
  orderLineItems$: BehaviorSubject<Array<ItemGroup>> = new BehaviorSubject<Array<ItemGroup>>(null);
  noteList$: BehaviorSubject<Array<Note>> = new BehaviorSubject<Array<Note>>(null);
  attachments$: BehaviorSubject<Array<Attachment>> = new BehaviorSubject<Array<Attachment>>(null);

  noteSubscription: Subscription;
  attachmentSubscription: Subscription;
  orderSubscription: Subscription;
  
  private subscriptions: Subscription[] = [];

  /**
   * String containing the lookup fields to be queried for a proposal record.
   */
  private proposalLookups = `PriceListId,Primary_Contact,BillToAccountId,ShipToAccountId,AccountId,OpportunityId,Owner`;

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
    secondaryTextField: 'Email',
    fieldList: ['Name', 'Id', 'Email']
  };

  constructor(private activatedRoute: ActivatedRoute, 
              private orderService: OrderService,
              private userService: UserService, 
              private productInformationService: ProductInformationService,
              private exceptionService: ExceptionService, 
              private noteService: NoteService,
              private lineItemService: LineItemService, 
              private router: Router, 
              private emailService: EmailService,
              private accountService: AccountService, 
              private cartService: CartService,
              private orderLineItemService: OrderLineItemService,
              private apiService: ApiService,
              private cdr: ChangeDetectorRef, 
              private attachmentService: AttachmentService, 
              private ngZone: NgZone) { }

  ngOnInit() {
    this.isLoggedIn$ = this.userService.isLoggedIn();
    this.getOrder();
    this.subscriptions.push(this.accountService.getCurrentAccount().subscribe(account => {
      // Setting lookup options for primary contact field
      this.lookupOptions.conditions = [new ACondition(Contact, 'AccountId', 'Equal', get(account, 'Id'))];
      this.lookupOptions.expressionOperator = 'AND';
      this.lookupOptions.filters = null;
      this.lookupOptions.sortOrder = null;
      this.lookupOptions.page = new APageInfo(10);
    }));
  }

  getOrder() {
    if(this.orderSubscription) this.orderSubscription.unsubscribe();
    
    const order$ = this.activatedRoute.params
      .pipe(
        filter(params => get(params, 'id') != null),
        map(params => get(params, 'id')),
        flatMap(orderId => this.orderService.fetch(orderId)),
        switchMap((order: Order) => combineLatest(
          of(order), 
          get(order,'Proposal.Id') ? this.apiService.get(`/quotes/${order.Proposal.Id}?lookups=${this.proposalLookups}`, Quote) : of(null),
          // Using query instead of get(), as get is not returning list of accounts as expected.
          this.accountService.query({
            conditions: [
              new ACondition(Account, 'Id', 'In', compact(uniq([order.BillToAccountId, order.ShipToAccountId, order.SoldToAccountId, get(order, 'PrimaryContact.AccountId')])))
          ]})
        )),
        map(([order, quote, accounts]) => {
          order.Proposal = quote;
          order.SoldToAccount = defaultTo(find(accounts, acc => acc.Id === order.SoldToAccountId), order.SoldToAccount);
          order.BillToAccount = defaultTo(find(accounts, acc => acc.Id === order.BillToAccountId), order.BillToAccount);
          order.ShipToAccount = defaultTo(find(accounts, acc => acc.Id === order.ShipToAccountId), order.ShipToAccount);
          set(order, 'PrimaryContact.Account', find(accounts, acc => order.PrimaryContact && acc.Id === order.PrimaryContact.AccountId));
          return order;
        })
      );

    const lineItems$ = this.activatedRoute.params
      .pipe(
        filter(params => get(params, 'id') != null),
        map(params => get(params, 'id')),
        mergeMap(orderId => this.orderLineItemService.getOrderLineItems(orderId)));

      this.orderSubscription = combineLatest(order$.pipe(startWith(null)), lineItems$.pipe(startWith(null)))
        .pipe(map(([order, lineItems]) => {
          if(!order) return;

          if (order.Status === 'Partially Fulfilled' && indexOf(this.orderStatusSteps, 'Fulfilled') > 0)
            this.orderStatusSteps[indexOf(this.orderStatusSteps, 'Fulfilled')] = 'Partially Fulfilled';

          if (order.Status === 'Fulfilled' && indexOf(this.orderStatusSteps, 'Partially Fulfilled') > 0)
            this.orderStatusSteps[indexOf(this.orderStatusSteps, 'Partially Fulfilled')] = 'Fulfilled';

          order.OrderLineItems = lineItems;
          this.orderLineItems$.next(LineItemService.groupItems(lineItems));

          return this.updateOrder(order);
      })).subscribe();

      this.getNotes();
      this.getAttachments();
  }

  refreshOrder(fieldValue, order, fieldName) {
    set(order, fieldName, fieldValue);
    this.orderService.update([order]).subscribe(r => {
      this.getOrder();
    });
  }

  updateOrder(order) {
    this.order$.next(cloneDeep(order));
  }

  /**
   * @ignore
   */
  getNotes() {
    if(this.noteSubscription) this.noteSubscription.unsubscribe();
    this.noteSubscription = this.activatedRoute.params
    .pipe(
      switchMap(params => this.noteService.getNotes(get(params, 'id')))
    ).subscribe(
      (notes: Array<Note>) => this.noteList$.next(notes),
      err => console.log('Error ', err)
      );
    this.subscriptions.push(this.noteSubscription);
  }

  getAttachments() {
    if (this.attachmentSubscription) {
      this.attachmentSubscription.unsubscribe();
    }

    this.attachmentSubscription = this.activatedRoute.params
      .pipe(
        switchMap(params => this.attachmentService.getAttachments(get(params, 'id')))
      ).subscribe((attachments: Array<Attachment>) => this.attachments$.next(attachments));
  }

  /**
   * @ignore
   */
  getTotalPromotions(order: Order): number {
    return ((get(order, 'OrderLineItems.length') > 0)) ? sum(get(order, 'OrderLineItems').map(res => res.IncentiveAdjustmentAmount)) : 0;
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
        this.getOrder();
      }
      else
        this.exceptionService.showError('ACTION_BAR.ORDER_CONFIRMATION_FAILURE');
    });
  }

  addComment(orderId: string) {
    this.comments_loader = true;
    set(this.note, 'ParentId', orderId);
    set(this.note, 'OwnerId', get(this.userService.me(), 'Id'));
    if (!this.note.Title) {
      set(this.note, 'Title', 'Notes Title');
    }
    this.noteService.create([this.note])
      .subscribe(r => {
        this.getNotes();
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
        if (!isEmpty(rfilter(carts, cart => cart.Status === 'New'))) {
          return this.cartService.setCartActive(
              first(
                rfilter(carts, cart => cart.Status === 'New')
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
    set(this.note, 'Body', null);
    set(this.note, 'Title', null);
    set(this.note, 'Id', null);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }

    if (this.attachmentSubscription) {
      this.attachmentSubscription.unsubscribe();
    }

    if (this.noteSubscription) {
      this.noteSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(){
    this.cdr.detectChanges();
  }

}