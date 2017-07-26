import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorConsoleComponent } from './error-console.component';

describe('ErrorConsoleComponent', () => {
  let component: ErrorConsoleComponent;
  let fixture: ComponentFixture<ErrorConsoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorConsoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
