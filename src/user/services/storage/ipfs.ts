import { Injectable } from '@nestjs/common';
import { IPFSHTTPClient, create } from 'ipfs-http-client';
import 'dotenv/config';
import * as fs from 'fs';

@Injectable()
export class StorageService {
  private ipfsClient: IPFSHTTPClient;

  constructor() {
    const token = Buffer.from(
      process.env.INFURA_IPFS_API_KEY +
        ':' +
        process.env.INFURA_IPFS_PROJECT_SECRET,
    ).toString('base64');

    const auth = 'Basic ' + token;

    this.ipfsClient = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      apiPath: '/api/v0',
      headers: {
        authorization: auth,
      },
    });
  }

  async createDirectory() {
    try {
      await this.ipfsClient.files.mkdir('/kyc_documents');
    } catch (e) {
      console.log(e);
    }
  }

  async store(data: any) {
    const { cid } = await this.ipfsClient.add(JSON.stringify(data));

    //store cid in a file
    fs.writeFileSync(
      './src/user/services/storage/kyc_list.txt',
      JSON.stringify({ cid: cid.toString() }),
    );
  }

  async retrieve() {
    //fetch cid from file
    const cidFile = fs.readFileSync('./src/user/services/storage/kyc_list.txt');

    const cid = JSON.parse(cidFile.toString()).cid;

    const stream = this.ipfsClient.cat(cid);

    const decoder = new TextDecoder();
    let data = '';

    for await (const chunk of stream) {
      data += decoder.decode(chunk, { stream: true });
    }

    // remove null characters
    data = data.replace(/\0/g, '');

    return data;
  }
}
