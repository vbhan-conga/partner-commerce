import { Component, OnInit, ViewChild, TemplateRef, NgZone, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UserService, QuoteService, Quote, Order, OrderService, Note, NoteService, AttachmentService,
  ProductInformationService, ItemGroup, LineItemService, Attachment } from '@apttus/ecommerce';
import { ActivatedRoute } from '@angular/router';
import { filter, map, take, mergeMap, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { ExceptionService } from '@apttus/elements';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ACondition } from '@apttus/core';

@Component({
  selector: 'app-quote-details',
  templateUrl: './quote-detail.component.html',
  styleUrls: ['./quote-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuoteDetailComponent implements OnInit {
  quote$: Observable<Quote>;
  quoteLineItems$: Observable<Array<ItemGroup>>;
  order$: Observable<Order>;
  note: Note = new Note();
  newlyGeneratedOrder: Order;
  intimationModal: BsModalRef;
  hasSizeError: boolean;
  file: File;
  uploadFileList: any;
  edit_loader = false;
  accept_loader = false;
  comments_loader = false;
  attachments_loader = false;
  attachmentList = new Array<Attachment>();
  noteList = new Array<Note>();

  @ViewChild('intimationTemplate', { static: false }) intimationTemplate: TemplateRef<any>;

  constructor(private activatedRoute: ActivatedRoute,
    private quoteService: QuoteService,
    private noteService: NoteService,
    private exceptionService: ExceptionService,
    private modalService: BsModalService,
    private orderService: OrderService,
    private attachmentService: AttachmentService,
    private productInformationService: ProductInformationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private userService: UserService) { }

  ngOnInit() {
    this.quote$ = this.activatedRoute.params
      .pipe(
        filter(params => _.get(params, 'id') != null),
        mergeMap(params => this.quoteService.query({
          conditions: [new ACondition(this.quoteService.type, 'Id', 'In', [_.get(params, 'id')])],
          waitForExpansion: false
        })),
        map(quoteList => {
          return _.get(quoteList, '[0]');
        })
      );
    this.quoteLineItems$ = this.quote$.pipe(
      map(
        quote => {
          this.noteList = _.get(quote, 'Notes') ? _.get(quote, 'Notes') : new Array<Note>();
          this.attachmentList = _.get(quote, 'Attachments') ? _.get(quote, 'Attachments') : new Array<Attachment>();
          return LineItemService.groupItems(quote.QuoteLineItems);
        }
      )
    );
    this.order$ = this.quote$.pipe(
      mergeMap(quote => this.orderService.getOrderByQuote(_.get(quote, 'Id')))
    );
  }

  addComment(quoteId: string) {
    this.comments_loader = true;

    _.set(this.note, 'ParentId', quoteId);
    _.set(this.note, 'OwnerId', _.get(this.userService.me(), 'Id'));
    if (!this.note.Title) {
      _.set(this.note, 'Title', 'Dummy Title');
    }
    this.noteService.create([this.note])
      .subscribe(r => {
        this.noteService.query({
            conditions: [new ACondition(this.noteService.type, 'Id', 'In', (_.get(_.first(r), 'Id')))],
            waitForExpansion: false
          }).subscribe(comment => {
            if(comment && comment.length > 0)
              this.noteList.push(comment[0]);
          });
        this.clear();
        this.comments_loader = false;
        this.cdr.detectChanges();
      },
      err => {
        this.exceptionService.showError(err);
        this.comments_loader = false;
    });
  }

  clear() {
    _.set(this.note, 'Body', null);
    _.set(this.note, 'Title', null);
    _.set(this.note, 'Id', null);
  }

  acceptQuote(quoteId: string) {
    this.accept_loader = true;
    this.quoteService.acceptQuote(quoteId).pipe(take(1)).subscribe(
      res => {
        if (res) {
          this.accept_loader = false;
          const ngbModalOptions: ModalOptions = {
            backdrop: 'static',
            keyboard: false
          };
          this.ngZone.run(() => {
            this.intimationModal = this.modalService.show(this.intimationTemplate, ngbModalOptions);
          });
        }
      },
      err => {
        this.accept_loader = false;
      }
    );
  }

  /**
   * @ignore
   */
  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.uploadFileList = event.target.files;
      this.hasFileSizeExceeded(this.uploadFileList, event.target.dataset.maxSize);
      this.file = fileList[0];
    }
  }

  /**
   * @ignore
   */
  hasFileSizeExceeded(fileList, maxSize) {
    let totalFileSize = 0;
    for (let i = 0; i < fileList.length; i++) {
      totalFileSize = totalFileSize + fileList[i].size;
    }
    this.hasSizeError = totalFileSize > maxSize;
  }

  /**
   * @ignore
   */
  onDragFile(event) {
    event.preventDefault();
  }

  /**
   * @ignore
   */
  onDropFile(event) {
    event.preventDefault();
    const itemList: DataTransferItemList = event.dataTransfer.items;
    const fileList: FileList = event.dataTransfer.files;
    if (fileList.length > 0) {
      this.uploadFileList = event.dataTransfer.files;
      this.hasFileSizeExceeded(this.uploadFileList, event.target.dataset.maxSize);
    } else {
      let f = [];
      for (let i = 0; i < itemList.length; i++) {
        if (itemList[i].kind === 'file') {
          let file: File = itemList[i].getAsFile();
          f.push(file);
        }
        this.uploadFileList = f;
      }
      this.hasFileSizeExceeded(fileList, event.target.dataset.maxSize);
    }
    this.file = this.uploadFileList[0];
  }

  /**
   * @ignore
   */
  clearFiles() {
    this.file = null;
    this.uploadFileList = null;
  }

  /**
   * @ignore
   */
  uploadAttachment(parentId: string) {
    this.attachments_loader = true;
    this.attachmentService.uploadAttachment(this.file, parentId)
    .pipe(
      switchMap((res) =>
        this.attachmentService.query({
            conditions: [new ACondition(this.attachmentService.type, 'ParentId', 'In', parentId)]
        })), take(1))
      .subscribe(documentList => {
        if(documentList.length > 0)
          this.attachmentList.push(_.first(documentList));
        this.attachments_loader = false;
        this.clearFiles();
        this.cdr.detectChanges();
      }, err => {
          this.clearFiles();
          this.exceptionService.showError(err);
      });
  }

  /**
   * @ignore
   */
  downloadAttachment(attachmentId: string, parentId: string) {
    return this.productInformationService.getAttachmentUrl(attachmentId, parentId);
  }

  /**
   * @ignore
   */
  getTotalPromotions(quote: Quote): number {
    return ((_.get(quote, 'QuoteLineItems.length') > 0)) ? _.sum(_.get(quote, 'QuoteLineItems').map(res => res.IncentiveAdjustmentAmount)) : 0;
  }

  closeModal() {
    this.intimationModal.hide();
    this.quoteService.where([new ACondition(Quote, 'Id', 'In', this.activatedRoute.snapshot.params.id)], 'AND', null, null, null, null, true).subscribe(res => {
      this.quote$ = of(res[0]);
    });
  }
}