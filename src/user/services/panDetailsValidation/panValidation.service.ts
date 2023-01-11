import { Injectable } from '@nestjs/common';
import { EKO } from './validationAPIServices/eko/eko';
import { PanValidationStatus } from '../../models/panValidationStatus';

@Injectable()
export class PanValidationService {
  constructor(private readonly validationService: EKO) {}

  public async validatePAN(panNumber: string): Promise<PanValidationStatus> {
    return await this.validationService.validatePAN(panNumber);
  }
}
