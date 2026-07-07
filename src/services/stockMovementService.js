import api from "./api";

const StockMovementService = {
  async getAll() {
    const response = await api.get("/stock-movements");
    return response.data.data;
  },

  async create(data) {
    const response = await api.post("/stock-movements", data);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/stock-movements/${id}`);
    return response.data.data;
  },
};

export default StockMovementService;