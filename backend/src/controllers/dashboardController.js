import { getDashboardStats } from "../services/dashboardService.js";

export async function show(req, res) {
  res.status(200).json({ data: await getDashboardStats(req.user.id) });
}
