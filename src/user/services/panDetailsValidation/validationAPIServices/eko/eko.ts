import axios from 'axios';
import * as crypto from 'crypto';
import 'dotenv/config';
import { PanValidationStatus } from '../../../../models/panValidationStatus';

export class EKO {
  private developerKey;
  private secretKey;
  private secretKeyTimestamp;

  constructor() {
    this.developerKey = process.env.EKO_DEVELOPER_KEY;
    const key = process.env.EKO_KEY;

    const encodedKey = Buffer.from(key).toString('base64');

    const currentDate = new Date();
    this.secretKeyTimestamp = currentDate.getTime().toString();

    const hmacData = crypto
      .createHmac('sha1', encodedKey)
      .update(this.secretKeyTimestamp)
      .digest();

    this.secretKey = Buffer.from(hmacData).toString('base64');
  }

  async validatePAN(panNumber: string): Promise<PanValidationStatus> {
    const url = 'https://staging.eko.in:25004/ekoapi/v1/pan/verify';
    const params = new URLSearchParams({
      pan_number: panNumber,
      purpose: '1',
      initiator_id: process.env.EKO_INITIATOR_ID,
      purpose_desc: 'onboarding',
    });
    const headers = {
      developer_key: this.developerKey,
      'secret-key': this.secretKey,
      'secret-key-timestamp': this.secretKeyTimestamp,
    };

    const response = await axios.post(url, params, { headers: headers });

    return new PanValidationStatus(
      response.data.message,
      response.data.data['pan_number'],
    );
  }
}
