import {Permission} from "./Permission";

export interface PermissionAssignment {
  id: number;
  permission_id: number;
  user_id: number;
  group_id: number;
  writeable: boolean;
  createdAt: Date
  updatedAt: Date
  permission: Permission;
}
