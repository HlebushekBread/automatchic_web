import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectBrowser } from './subject-browser';

describe('SubjectBrowser', () => {
  let component: SubjectBrowser;
  let fixture: ComponentFixture<SubjectBrowser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectBrowser],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectBrowser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
