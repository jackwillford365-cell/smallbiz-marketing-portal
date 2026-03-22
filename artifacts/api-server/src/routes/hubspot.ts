import { Router, type IRouter } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router: IRouter = Router();

function getConnectors() {
  return new ReplitConnectors();
}

router.get("/hubspot/status", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const connectors = getConnectors();
    const response = await connectors.proxy("hubspot", "/crm/v3/objects/contacts?limit=1", { method: "GET" });
    if (response.ok) {
      res.json({ connected: true });
    } else {
      res.json({ connected: false });
    }
  } catch {
    res.json({ connected: false });
  }
});

router.get("/hubspot/leads", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { period } = req.query;

  try {
    const connectors = getConnectors();

    let filterGroups: object[] = [];
    if (period && period !== "all") {
      const now = new Date();
      let after: Date;
      if (period === "this_month") {
        after = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === "last_month") {
        after = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      } else if (period === "last_3_months") {
        after = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      } else if (period === "last_6_months") {
        after = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      } else {
        after = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      filterGroups = [
        {
          filters: [
            {
              propertyName: "createdate",
              operator: "GTE",
              value: after.toISOString(),
            },
          ],
        },
      ];
    }

    const searchBody = {
      filterGroups,
      properties: ["firstname", "lastname", "email", "phone", "company", "createdate", "lifecyclestage"],
      limit: 100,
      sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
    };

    const response = await connectors.proxy("hubspot", "/crm/v3/objects/contacts/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      const err = await response.text();
      res.status(500).json({ error: "HubSpot error", details: err });
      return;
    }

    const data: any = await response.json();
    const leads = (data.results || []).map((c: any) => ({
      id: c.id,
      name: [c.properties.firstname, c.properties.lastname].filter(Boolean).join(" ") || "Unknown",
      email: c.properties.email || "",
      phone: c.properties.phone || "",
      company: c.properties.company || "",
      stage: c.properties.lifecyclestage || "lead",
      createdAt: c.properties.createdate || c.createdAt,
    }));

    res.json({ leads, total: data.total || leads.length });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch leads", details: err.message });
  }
});

router.get("/hubspot/deals", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { period } = req.query;

  try {
    const connectors = getConnectors();

    let filterGroups: object[] = [];
    if (period && period !== "all") {
      const now = new Date();
      let after: Date;
      if (period === "this_month") {
        after = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === "last_month") {
        after = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      } else if (period === "last_3_months") {
        after = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      } else if (period === "last_6_months") {
        after = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      } else {
        after = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      filterGroups = [
        {
          filters: [
            {
              propertyName: "createdate",
              operator: "GTE",
              value: after.toISOString(),
            },
          ],
        },
      ];
    }

    const searchBody = {
      filterGroups,
      properties: ["dealname", "amount", "dealstage", "closedate", "createdate", "pipeline"],
      limit: 100,
      sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
    };

    const response = await connectors.proxy("hubspot", "/crm/v3/objects/deals/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      const err = await response.text();
      res.status(500).json({ error: "HubSpot error", details: err });
      return;
    }

    const data: any = await response.json();
    const deals = (data.results || []).map((d: any) => ({
      id: d.id,
      name: d.properties.dealname || "Unnamed Deal",
      amount: d.properties.amount ? parseFloat(d.properties.amount) : null,
      stage: d.properties.dealstage || "unknown",
      pipeline: d.properties.pipeline || "",
      closeDate: d.properties.closedate || null,
      createdAt: d.properties.createdate || d.createdAt,
    }));

    res.json({ deals, total: data.total || deals.length });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch deals", details: err.message });
  }
});

router.get("/hubspot/email-campaigns", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const connectors = getConnectors();
    const response = await connectors.proxy("hubspot", "/marketing/v3/emails?limit=50&orderBy=-updatedAt", {
      method: "GET",
    });

    if (!response.ok) {
      const err = await response.text();
      res.status(500).json({ error: "HubSpot error", details: err });
      return;
    }

    const data: any = await response.json();
    const campaigns = (data.results || []).map((e: any) => ({
      id: e.id,
      name: e.name || "Untitled Campaign",
      subject: e.subject || "",
      state: e.state || "DRAFT",
      sendDate: e.sendDate || null,
      stats: e.stats || {},
      updatedAt: e.updatedAt || null,
    }));

    res.json({ campaigns, total: data.total || campaigns.length });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch email campaigns", details: err.message });
  }
});

export default router;
