import {NgModule} from "@angular/core";
import {User} from "../models/User";
import {BaseService, HttpMethod} from "./base.service";

@NgModule()
export class CloudUserService {

  constructor(private base: BaseService) {
    // httpService.url
  }

  changePassword(password: string) {
    return this.base.executeRequest<void>('/password', HttpMethod.PUT, {
      password
    });
  }

  changeMail(email: string) {
    return this.base.executeRequest<void>('/email', HttpMethod.PUT, {
      email
    });
  }

  confirmMail(token: number) {
    return this.base.executeRequest<void>('/email', HttpMethod.POST, {
      token
    });
  }

  getUsers() {
    return this.base.executeRequest<User[]>('/users', HttpMethod.GET);
  }

  changeUserdataOfCurrentUser(obj: User) {
    return this.base.executeRequest<void>('/userdata', HttpMethod.PUT, obj);
  }

  changeUsername(username: string) {
    return this.base.executeRequest<void>('/username', HttpMethod.PUT, {
      username
    });
  }

  changeUserdataAsAdmin(obj: User) {
    return this.base.executeRequest<void>('/user', HttpMethod.PUT, obj);
  }

}
