import {Injectable} from "@angular/core";
import * as Forge from 'node-forge';
import {BaseService, HttpMethod} from "./base.service";

@Injectable()
export class CryptoService {

  public readonly clientPubKey: string | null;
  private readonly clientPrivateKey: string | null;

  get publicKey(): string {
    return this.clientPubKey!;
  }

  constructor(private base: BaseService) {
    this.clientPubKey = localStorage.getItem('RSA.PublicKey');
    this.clientPrivateKey = localStorage.getItem('RSA.PrivateKey');

    if (this.clientPubKey == null || this.clientPrivateKey == null) {
      const pki = Forge.pki;
      const rsa = pki.rsa;
      const keyPair = rsa.generateKeyPair(2048);
      this.clientPubKey = pki.publicKeyToPem(keyPair.publicKey);
      this.clientPrivateKey = pki.privateKeyToPem(keyPair.privateKey);

      localStorage.setItem('RSA.PublicKey', this.clientPubKey);
      localStorage.setItem('RSA.PrivateKey', this.clientPrivateKey);
    }
  }

  getBackendPubKey() {
    return this.base.executeRequest<{ publicKey: string }>('/publicKey', HttpMethod.GET);
  }

  decryptSingleValue(valueToDecrypt: string): string {
    const privateKey = Forge.pki
      .privateKeyFromPem(this.clientPrivateKey!);

    return privateKey
      .decrypt(atob(valueToDecrypt));
  }

  async encryptSingleValue(valueToEncrypt: string): Promise<string> {
    try {
      const keyResult = await this.getBackendPubKey();
      const rsa = Forge.pki.publicKeyFromPem(keyResult.publicKey);
      return btoa(rsa.encrypt(valueToEncrypt));
    } catch (e) {
      throw e;
    }
  }

  async encryptMultipleValues(valuesToEncrypt: string[]): Promise<string[]> {
    try {
      const outputArr: string[] = [];
      const rsa = Forge.pki.publicKeyFromPem((await this.getBackendPubKey()).publicKey);

      valuesToEncrypt.forEach((value: string) => {
        outputArr.push(btoa(rsa.encrypt(value)));
      });

      return outputArr;
    } catch (e) {
      throw e;
    }
  }

}
