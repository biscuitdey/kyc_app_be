import { Injectable } from '@nestjs/common';
import { StorageService } from './ipfs';

@Injectable()
export class IpfsService {
  constructor(private readonly ipfsService: StorageService) {}
}
