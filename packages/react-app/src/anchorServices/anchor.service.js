import axios from "axios";
const API_URL ='http://localhost:3500/api/';


const cardId ="1234", amount="10", month="01", year="25",  cardNumber="4007 4000 0000 0007", cvv="123", line1="line1", line2="line2", city="city",
district="district", postalCode="postalCode",
country="country", name="name", phoneNumber="+12025550180", email="customer-0001@circle.com";
const verification = 'cvv', type ='card', sessionId = 'xxx', ipAddress = '172.33.222.1', currency ='USD';


const API_Circle = "";
class AnchorService {
   async getAnchorList() {
    return await axios.get(API_URL + "anchorlist");
  }
  async getCircleAuth() {
    return await axios.get(API_URL + "anchorlist");
  }

  async createtWalletAPI(description) {
    return await axios.get(API_URL + "createtWalletAPI", {
      params : {
        description
      }
    });
  }

  async transferAPI(srcWallet, destWallet, amount) {
    return await axios.get(API_URL + "transferAPI", {
      params: {
        srcWallet, destWallet, amount
      }
    });
  }

  async chargeCardAPI(cardId, amount, month, year,  cardNumber, cvv, line1, line2, city, district, postalCode,
    country, name, phoneNumber, email, verification,
    type, sessionId, ipAddress, currency) {
    return await axios.get(API_URL + "chargeCardAPI", {
      params: {
        cardId, amount, month, year,  cardNumber, cvv, line1, line2, city, district, postalCode,
          country, name, phoneNumber, email, verification,
          type, sessionId, ipAddress, currency
      }
    });
  }
}

export default new AnchorService();
