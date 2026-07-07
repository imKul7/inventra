import api from "./api";

const ProductService = {

    async getAll() {

        const response = await api.get("/products");

        return response.data.data;

    },

    async getById(id) {

        const response = await api.get(`/products/${id}`);

        return response.data.data;

    },

    async create(data) {

        const response = await api.post("/products", data);

        return response.data;

    },

    async update(id, data) {

        const response = await api.put(`/products/${id}`, data);

        return response.data;

    },

    async delete(id) {

        const response = await api.delete(`/products/${id}`);

        return response.data;

    }

};

export default ProductService;