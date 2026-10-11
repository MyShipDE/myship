import {Injectable} from "@angular/core";
import {BaseService, HttpMethod} from "./base.service";
import {UserDetails} from "../cloud/models/UserDetail";

@Injectable()
export class CloudUserDetailsService {

  constructor(private base: BaseService) {
    //
  }

  async getUserDetails() {
    return await this.base.executeRequest<UserDetails>(`/user/details`, HttpMethod.GET);
  }

  async putUserDetails(user: UserDetails) {
    return await this.base.executeRequest<void>(`/user/details`, HttpMethod.PUT, user);
  }

}
