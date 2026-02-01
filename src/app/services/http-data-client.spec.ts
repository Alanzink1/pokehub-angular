import { TestBed } from '@angular/core/testing';

import { HttpDataClient } from './http-data-client';

describe('HttpDataClient', () => {
  let service: HttpDataClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpDataClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
