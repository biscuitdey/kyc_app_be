import { DynamicModule, Module } from "@nestjs/common";
import { VcService } from "./vc.service.js";
import { VerifiableCredential } from "./vcServices/vc.js";

@Module({})
export class VcModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: VcModule,
      providers: [
        { provide: "VALIDATION_OPTIONS", useValue: options },
        VcService,
        VerifiableCredential,
      ],
      exports: [VcService],
    };
  }
}
