import express from "express";
import {
  handleGetAllTenants,
  handleGetSingleTenant,
  handleAddNewTenant,
  handleUpdateTenant,
  handleGetAllTenantsByNames,
} from "./handler";
import {
  authorize,
  authorizeWithNoTenant,
} from "../../../../middleware/auth/authorization.factory-middleware";

export const tenantRouter = express.Router();

tenantRouter.get("/", authorizeWithNoTenant(["super"]), handleGetAllTenants);
tenantRouter.get(
  "/:tenantNames",
  authorizeWithNoTenant(["admin", "super"]),
  handleGetAllTenantsByNames
);
tenantRouter.get(
  "/:key/:value",
  authorizeWithNoTenant(["super"]),
  handleGetSingleTenant
);
tenantRouter.post("/new", authorizeWithNoTenant(["super"]), handleAddNewTenant);
tenantRouter.put(
  "/:tenant_id",
  authorizeWithNoTenant(["super"]),
  handleUpdateTenant
);
