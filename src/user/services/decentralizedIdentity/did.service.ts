import { Resolver } from "did-resolver";
import { Injectable } from "@nestjs/common";
import { EthrDid } from "./didServices/ethrDid.js";

@Injectable()
export class DidService {
  constructor(private readonly didService: EthrDid) {}

  public async createDid(): Promise<any> {
    return await this.didService.createDid();
  }

  public async signJwt(did: any, message: string): Promise<any> {
    return await this.didService.signJwtWithDid(did, message);
  }

  public async getDidResolver(): Promise<Resolver> {
    return await this.didService.getDidResolver();
  }

  public async verifyJwt(
    did: any,
    jwt: string,
    didResolver: Resolver
  ): Promise<boolean> {
    return await this.didService.verifyJwt(did, jwt, didResolver);
  }
}
