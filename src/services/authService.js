import api from "./api";

const AuthService = {
  async logout() {
    const response = await api.post("/logout");
    return response.data;
  },

  async me() {
    const response = await api.get("/me");
    return response.data.data;
  },
};

export default AuthService;