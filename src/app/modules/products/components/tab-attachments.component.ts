import { Input, Component, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { Product, ProductInformation, ProductInformationService } from '@apttus/ecommerce';
import { Observable } from 'rxjs';
@Component({
    selector: 'app-tab-attachments',
    template: `
      <table class="table table-sm">
        <thead>
          <tr>
            <th scope="col" class="border-top-0">{{'PRODUCT_DETAILS.FILE_NAME' | translate}}</th>
            <th scope="col" class="border-top-0">{{'PRODUCT_DETAILS.DESCRIPTION' | translate}}</th>
            <th scope="col" class="border-top-0">{{'COMMON.CREATED_DATE' |  translate}}</th>
            <th scope="col" class="border-top-0">{{'PRODUCT_DETAILS.INFORMATION_TYPE' | translate}}</th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let item of (productInformation$ | async)">
            <tr *ngFor="let attachment of item?.Attachments">
              <td><a href="{{getAttachmentUrl(attachment.Id, item.ProductId)}}" target="_blank">{{attachment.Name}}</a></td>
              <td>{{attachment.Description}}</td>
              <td>{{attachment.CreatedDate | date : 'short'}}</td>
              <td>{{item.InformationType}}</td>
            </tr>
          </ng-container>
        </tbody>
      </table>
    `,
    styles: [`
      :host{
        font-size: smaller;
      }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Tab Attachments Component displays the list of attachment for the product.
 */
export class TabAttachmentsComponent implements OnChanges{

    @Input() product: Product;

    /**
     * productInformation Observable to get product information.
     */
    productInformation$: Observable<ProductInformation[]>;

    constructor(private productInformationService: ProductInformationService){}

    ngOnChanges(){
      this.productInformation$ = this.productInformationService.getProductInformation(this.product.Id);
    }
    /**
     * getAttachmentUrl method fetches the attachment url based on attachment id and product id.
     * @param attachmentId is a string consisting of attachment id
     * @param productId is a string consisting of product id.
     * @returns the attachment url which is type of string
     */
    getAttachmentUrl(attachmentId, productId){
      return this.productInformationService.getAttachmentUrl(attachmentId,productId);
    }
}