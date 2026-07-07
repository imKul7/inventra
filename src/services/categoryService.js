import api from "./api";

const CategoryService = {
  async getAll() {
    const response = await api.get("/categories");
    return response.data.data;
  },
};

export default CategoryService;