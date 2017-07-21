import { TestBed, inject } from '@angular/core/testing';

import { VirtualFsService } from './virtual-fs.service';

describe('VirtualFsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VirtualFsService]
    });
  });

  it('should be created', inject([VirtualFsService], (service: VirtualFsService) => {
    expect(service).toBeTruthy();
  }));
});
