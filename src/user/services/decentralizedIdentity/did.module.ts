import { DynamicModule, Module } from "@nestjs/common";
import { DidService } from "./did.service.js";
import { EthrDid } from "./didServices/ethrDid.js";

@Module({})
export class DidModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: DidModule,
      providers: [
        { provide: "VALIDATION_OPTIONS", useValue: options },
        DidService,
        EthrDid,
      ],
      exports: [DidService],
    };
  }
}
