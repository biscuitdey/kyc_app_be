import { Injectable } from '@nestjs/common';
import { ZeroKnowledge } from './zkServices/zk';

@Injectable()
export class ZkService {
  constructor(private readonly zkService: ZeroKnowledge) {}
}
