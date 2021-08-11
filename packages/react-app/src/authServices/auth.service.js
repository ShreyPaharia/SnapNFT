import axios from "axios";

const API_URL ='http://localhost:3500/api/'+"auth/";

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "signin", {
        username,
        password
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password, roles) {
    return axios.post(API_URL + "signup", {
      username,
      email,
      password,
      roles
    });
  }

  getAnchorList(username, email, password, roles) {
    return axios.get(API_URL + "anchorlist");
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));;
  }
}

export default new AuthService();
