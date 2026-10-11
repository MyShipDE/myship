import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbraucherComponent } from './verbraucher.component';

describe('VerbraucherComponent', () => {
  let component: VerbraucherComponent;
  let fixture: ComponentFixture<VerbraucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerbraucherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbraucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
