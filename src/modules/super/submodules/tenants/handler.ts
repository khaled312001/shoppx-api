import { Response } from "express";
import { TenantRepository } from "./Tenant/tenant.repository";
import { makeMongoURI } from "../../../../database";

export const handleGetAllTenants = async (req: any, res: Response) => {
  try {
    const tenantRepository = new TenantRepository(req.connectionKey);
    const tenants = await tenantRepository.findAllTenants();
    return res.status(200).json({ tenants });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const handleGetSingleTenant = async (req: any, res: Response) => {
  try {
    const { key, value } = req.params;
    if (!key && !value) {
      return res.status(400).send("Need to have key and value params.");
    }

    const tenantRepository = new TenantRepository(req.connectionKey);
    const tenant = await tenantRepository.findTernantByKey(key, value);
    return res.status(200).json({ tenant });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const handleAddNewTenant = async (req: any, res: Response) => {
  try {
    if (!req.body.name)
      return res.status(400).send("Need to have tenant data.");

    let members = req.body.members ? req.body.members : [];
    members.push(req.user._id);
    const uri = makeMongoURI(req.body.name.trim().replace(" ", "-"));
    const tenantRepository = new TenantRepository(req.connectionKey);
    console.log(req.connectionKey, req.body, req.user);
    const tenant = await tenantRepository.addTenant({
      ...req.body,
      name: req.body.name.trim(),
      createdBy: req.user._id,
      members,
      uri,
    });
    return res.status(200).json({ tenant });
  } catch (e: any) {
    console.log(e);
    switch (e.code) {
      case 11000:
        return res.status(400).json({
          error: "Tenant already exists with the same name.",
        });
      default:
        return res.status(e.status || 500).json({ error: e.message });
    }
  }
};

export const handleUpdateTenant = async (req: any, res: Response) => {
  try {
    const { tenant_id } = req.params;
    const status = req.body.status;

    if (!tenant_id) return res.status(400).send("Need to have tenant id.");
    if (
      status &&
      status !== "active" &&
      status !== "deleted" &&
      status !== "suspended"
    ) {
      return res.status(400).json({ error: "Can identify this status." });
    }
    const tenantRepository = new TenantRepository(req.connectionKey);
    const tenant = await tenantRepository.updateTenant({
      ...req.body,
      _id: tenant_id,
    });
    return res.status(200).json({ tenant });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const handleGetAllTenantsByNames = async (req: any, res: Response) => {
  try {
    const { tenantNames } = req.params;
    if (!tenantNames) return res.status(400).send("Need to have tenant names.");

    const tenantNamesArray = tenantNames.split(",");
    const tenantRepository = new TenantRepository(req.connectionKey);
    const tenants = await tenantRepository.findTenantsByNames(tenantNamesArray);
    return res.status(200).json({ tenants });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
