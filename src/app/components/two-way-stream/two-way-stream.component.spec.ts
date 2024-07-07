import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoWayStreamComponent } from './two-way-stream.component';

describe('TwoWayStreamComponent', () => {
  let component: TwoWayStreamComponent;
  let fixture: ComponentFixture<TwoWayStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwoWayStreamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoWayStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
