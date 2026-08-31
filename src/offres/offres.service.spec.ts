import { Test, TestingModule } from '@nestjs/testing';
import { OffresService } from './offres.service';

describe('OffresService', () => {
  let service: OffresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OffresService],
    }).compile();

    service = module.get<OffresService>(OffresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
