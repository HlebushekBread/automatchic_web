import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserSubjectComponent } from './browser-subject-component';

describe('BrowserSubjectComponent', () => {
  let component: BrowserSubjectComponent;
  let fixture: ComponentFixture<BrowserSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserSubjectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowserSubjectComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
