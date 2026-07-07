import {NgModule} from "@angular/core";
import {CryptoService} from "./crypto.service";
import {BaseService, HttpMethod} from "./base.service";
import {Session} from "../cloud/models/Session";
import {UserDetails} from "../cloud/models/UserDetail";

@NgModule()
export class CloudAuthService {

  constructor(private base: BaseService, private crypto: CryptoService) {
    // env.apiUrl
  }

  async login(login: string, password: string, stayLoggedIn: boolean = false) {
    return this.base.executeRequest<Session>('/auth/login', HttpMethod.POST, {
      ec: true,
      login: await this.crypto.encryptSingleValue(login),
      password: await this.crypto.encryptSingleValue(password),
      pubKey: this.crypto.clientPubKey,
      stayLoggedIn
    });
  }

  async register(email: string, username: string, password: string) {
    return this.base.executeRequest<void>('/auth/register', HttpMethod.POST, {
      email, password, username
    });
  }

  confirmOTP(token: string) {
    return this.base.executeRequest('/otp', HttpMethod.POST, {
      token
    });
  }

  passwordResetRequest(email: string) {
    return this.base.executeRequest('/auth/password/reset-request', HttpMethod.POST, {
      email
    });
  }

  passwordReset(email: string, code: number, password: string) {
    return this.base.executeRequest('/auth/password/reset', HttpMethod.POST, {
      email,
      code,
      password
    });
  }

  enableOTP(otpCode: number, password: string) {
    return this.base.executeRequest('/otp/enable', HttpMethod.POST, {
      otpCode,
      password
    });
  }

  disableOTP(password: string) {
    return this.base.executeRequest('/otp/disable', HttpMethod.POST, {
      password
    });
  }

  getCurrentUserDetails() {
    return this.base.executeRequest<{ user: UserDetails, ec: boolean }>('/auth/user', HttpMethod.GET);
  }

  checkSession() {
    return this.base.executeRequest<Session>('/auth/session', HttpMethod.GET);
  }

  logout() {
    return this.base.executeRequest('/auth/logout', HttpMethod.POST);
  }

  requestVerify(method: string = 'email') {
    return this.base.executeRequest<void>('/session/verify/request', HttpMethod.POST, {
      method
    });
  }

  verifySession(token: string) {
    return this.base.executeRequest<void>('/session/verify', HttpMethod.POST, {
      token
    });
  }


}
