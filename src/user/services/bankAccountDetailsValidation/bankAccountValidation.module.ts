import { DynamicModule, Module } from '@nestjs/common';
import { BankAccountValidationService } from './bankAccountValidation.service';
import { Razorpay } from './validationAPIServices/razorpay/razorpay';

@Module({})
export class BankAccountValidationModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: BankAccountValidationModule,
      providers: [
        { provide: 'VALIDATION_OPTIONS', useValue: options },
        BankAccountValidationService,
        Razorpay,
      ],
      exports: [BankAccountValidationService],
    };
  }
}
