import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosFullscreen } from './pos-fullscreen';

describe('PosFullscreen', () => {
  let component: PosFullscreen;
  let fixture: ComponentFixture<PosFullscreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosFullscreen],
    }).compileComponents();

    fixture = TestBed.createComponent(PosFullscreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
