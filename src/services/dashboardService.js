import api from "./api";

const DashboardService = {
  async getSummary() {
    const response = await api.get("/dashboard");
    return response.data.data;
  },
};

export default DashboardService;