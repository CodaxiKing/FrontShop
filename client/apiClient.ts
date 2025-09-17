import axios from "axios";
import { CONFIGS } from "../constants/Configs";

// Criação da instância Axios
const apiClient = axios.create({
  baseURL: CONFIGS.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Exporta o cliente
export default apiClient;
