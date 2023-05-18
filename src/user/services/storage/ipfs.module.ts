import { DynamicModule, Module } from '@nestjs/common';
import { IpfsService } from './ipfs.service.js';
import { StorageService } from './ipfs.js';

@Module({})
export class IpfsModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: IpfsModule,
      providers: [
        { provide: 'VALIDATION_OPTIONS', useValue: options },
        IpfsService,
        StorageService,
      ],
      exports: [IpfsService],
    };
  }
}
