import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:3500/api/test/';

class UserService {
  getPublicContent() {
    return axios.get(API_URL + 'all');
  }

  getAnchorBoard() {
    return axios.get(API_URL + 'anchor', { headers: authHeader() });
  }

  getSupplierBoard() {
    return axios.get(API_URL + 'supplier', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
}

export default new UserService();
