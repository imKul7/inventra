import api from "./api";

const SupplierService = {
  async getAll() {
    const response = await api.get("/suppliers");
    return response.data.data;
  },
};

export default SupplierService;