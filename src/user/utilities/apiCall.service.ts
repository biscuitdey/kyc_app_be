import axios from 'axios';
import { Injectable } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class APIService {
  public async get(
    url: string,
    authType: string,
    token?: string,
    clientCredentials?: object,
  ): Promise<any> {
    let params;
    if (authType === 'Bearer') {
      params = {
        method: 'GET',
        url: url,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    } else if (authType === 'Basic') {
      const clientCredentialValues = Object.values(clientCredentials);
      const authToken = Buffer.from(
        `${clientCredentialValues[0]}:${clientCredentialValues[1]}`,
      ).toString('base64');

      params = {
        method: 'GET',
        url: url,
        headers: {
          Authorization: `Basic ${authToken}`,
        },
      };
    } else {
      const clientCredentialKeys = Object.keys(clientCredentials);

      params = {
        method: 'GET',
        url: url,
        headers: {
          [clientCredentialKeys[0]]: clientCredentials[clientCredentialKeys[0]],
          [clientCredentialKeys[1]]: clientCredentials[clientCredentialKeys[1]],
        },
      };
    }

    const response = await axios(params);
    return response.data;
  }

  public async post(
    url: string,
    authType: string,
    requestParams?: any,
    token?: string,
    clientCredentials?: object,
  ): Promise<any> {
    let params;
    if (authType === 'Bearer') {
      params = {
        method: 'POST',
        url: url,
        data: requestParams,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
    } else if (authType === 'Basic') {
      const clientCredentialValues = Object.values(clientCredentials);
      const authToken = Buffer.from(
        `${clientCredentialValues[0]}:${clientCredentialValues[1]}`,
      ).toString('base64');

      params = {
        method: 'POST',
        url: url,
        data: requestParams,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authToken}`,
        },
      };
    } else {
      const clientCredentialKeys = Object.keys(clientCredentials);
      params = {
        method: 'POST',
        url: url,
        data: requestParams,
        headers: {
          'Content-Type': 'application/json',
          [clientCredentialKeys[0]]: clientCredentials[clientCredentialKeys[0]],
          [clientCredentialKeys[1]]: clientCredentials[clientCredentialKeys[1]],
        },
      };
    }
    const response = await axios(params);
    return response.data;
  }
}
