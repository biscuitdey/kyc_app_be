import { DynamicModule, Module } from '@nestjs/common';
import { ZkService } from './zk.service.js';
import { ZeroKnowledge } from './zkServices/zk.js';

@Module({})
export class ZkModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: ZkModule,
      providers: [
        { provide: 'VALIDATION_OPTIONS', useValue: options },
        ZkService,
        ZeroKnowledge,
      ],
      exports: [ZkService],
    };
  }
}
