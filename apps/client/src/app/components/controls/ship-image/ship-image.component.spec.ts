import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipImageComponent } from './ship-image.component';

describe('ShipImageComponent', () => {
  let component: ShipImageComponent;
  let fixture: ComponentFixture<ShipImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShipImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
