import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartsLayoutComponent } from './cart-detail.component';

describe('ManageCartComponent', () => {
  let component: CartsLayoutComponent;
  let fixture: ComponentFixture<CartsLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartsLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
