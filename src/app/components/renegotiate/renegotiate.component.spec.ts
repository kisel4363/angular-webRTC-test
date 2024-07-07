import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenegotiateComponent } from './renegotiate.component';

describe('RenegotiateComponent', () => {
  let component: RenegotiateComponent;
  let fixture: ComponentFixture<RenegotiateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenegotiateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenegotiateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
