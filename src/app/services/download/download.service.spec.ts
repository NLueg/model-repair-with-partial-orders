import { TestBed } from '@angular/core/testing';

import { MergeService } from '../../components/display-merged-run/merge.service';
import { DisplayService } from '../display.service';
import { DownloadService } from './download.service';

describe('DownloadService', () => {
  let service: DownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DisplayService, useValue: {} },
        { provide: MergeService, useValue: MergeService },
      ],
    });
    service = TestBed.inject(DownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
