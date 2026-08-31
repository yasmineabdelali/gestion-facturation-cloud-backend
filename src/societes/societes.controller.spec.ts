import { Test, TestingModule } from '@nestjs/testing';
import { SocietesController } from './societes.controller';

describe('SocietesController', () => {
  let controller: SocietesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocietesController],
    }).compile();

    controller = module.get<SocietesController>(SocietesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
