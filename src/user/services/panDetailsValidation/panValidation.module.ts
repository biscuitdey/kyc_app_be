import { DynamicModule, Module } from '@nestjs/common';
import { PanValidationService } from './panValidation.service';
import { EKO } from './validationAPIServices/eko/eko';

@Module({})
export class PanValidationModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: PanValidationModule,
      providers: [
        { provide: 'VALIDATION_OPTIONS', useValue: options },
        PanValidationService,
        EKO,
      ],
      exports: [PanValidationService],
    };
  }
}
