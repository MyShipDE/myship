import {Injectable} from "@angular/core";
import {BaseService, HttpMethod} from "./base.service";
import {Gateway} from "../cloud/models/Gateway";

@Injectable()
export class CloudGatewayService {

  constructor(private base: BaseService) {
    //
  }

  async getGateways() {
    return await this.base.executeRequest<Gateway[]>('/gateways', HttpMethod.GET);
  }

  async getGateway(id: number) {
    return await this.base.executeRequest<Gateway>('/gateway/' + id, HttpMethod.GET);
  }

  async saveGateway(gateway: Gateway) {
    return await this.base.executeRequest<void>('/gateway', HttpMethod.PUT, gateway);
  }

  async addClient(comment: string, gateway_id: number, isAdmin: boolean) {
    return await this.base.executeRequest<{ token: string }>('/gateway/client', HttpMethod.POST, {
      comment,
      gateway_id,
      isAdmin
    });
  }

}
