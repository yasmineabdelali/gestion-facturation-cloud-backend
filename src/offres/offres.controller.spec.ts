import { Test, TestingModule } from '@nestjs/testing';
import { OffresController } from './offres.controller';

describe('OffresController', () => {
  let controller: OffresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffresController],
    }).compile();

    controller = module.get<OffresController>(OffresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
