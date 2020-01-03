import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet>
      <div class="container d-flex align-items-center justify-content-center" *ngIf="loading">
        <apt-dots></apt-dots>
      </div>
    </router-outlet>
  `,
  styles: [`.container{height: 90vh;}`]
})
export class AppComponent implements OnInit {

  loading = false;

  ngOnInit() {}
}
