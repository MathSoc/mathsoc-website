import permissionsConfig from "../config/admin/user-perms.json";

export class PermissionsHandler {
  static shouldHaveAdminRights(email: string): boolean {
    return permissionsConfig.admin.includes(email);
  }
}
