import { Injectable } from '@nestjs/common';
import { VerifiableCredential } from './vcServices/vc.js';

@Injectable()
export class VcService {
  constructor(private readonly vcService: VerifiableCredential) {}
}
