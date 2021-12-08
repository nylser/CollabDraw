import { TestBed } from '@angular/core/testing';

import { DrawingSocketService } from './drawing-socket.service';

describe('SocketService', () => {
    let service: DrawingSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
