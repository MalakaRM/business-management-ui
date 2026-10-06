import { TestBed } from '@angular/core/testing';

import { PosSaleService } from './pos-sale-service';

describe('PosSaleService', () => {
  let service: PosSaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosSaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
