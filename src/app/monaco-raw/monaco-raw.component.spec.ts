import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonacoRawComponent } from './monaco-raw.component';

describe('MonacoRawComponent', () => {
  let component: MonacoRawComponent;
  let fixture: ComponentFixture<MonacoRawComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonacoRawComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonacoRawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
