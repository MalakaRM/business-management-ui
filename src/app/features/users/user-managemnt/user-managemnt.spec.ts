import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagemnt } from './user-managemnt';

describe('UserManagemnt', () => {
  let component: UserManagemnt;
  let fixture: ComponentFixture<UserManagemnt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagemnt],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagemnt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
