import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestchatComponent } from './testchat.component';

describe('TestchatComponent', () => {
  let component: TestchatComponent;
  let fixture: ComponentFixture<TestchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestchatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
