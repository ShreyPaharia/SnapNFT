// import * as openpgp from 'openpgp';
// const openpgp = require('openpgp');
// const openpgp = require('@/lib/openpgp');
// import openPGP from '@/lib/openpgp'
const openpgp = require('openpgp');


const path = require("path");
const { v4: uuidv4 } = require("uuid");
const url = require('url');
const axios = require('axios');
const baseURL = "https://api-sandbox.circle.com";
const API_Key = "QVBJX0tFWTpjOGQ5ZWI0YmRkNDg1OTYwMTY5MTBhOTU1NWI0OThlMzpiNGE3Y2M2Y2QwYmU0NmRiZDg1MWY2ODRiYzc0MTRlMA";

// const instance = axios.create({baseURL});
const instance = axios

const encryptWithPGP = async (dataToEncrypt, { keyId, publicKey }) => {
  // console.log(dataToEncrypt, keyId, publicKey);
  
  const decodedPublicKey = atob(publicKey)
  const options = {
    message: openpgp.message.fromText(JSON.stringify(dataToEncrypt)),
    publicKeys: (await openpgp.key.readArmored(decodedPublicKey)).keys,
  }
  return openpgp.encrypt(options).then((ciphertext) => {
    return {
      encryptedMessage: btoa(ciphertext.data),
      keyId,
    }
  })
}
const Authorization = `Bearer ${API_Key}`
const  headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
    Authorization,
};
// const message = async ()  => await openpgp.createMessage({ binary: new Uint8Array([0x01, 0x01, 0x01]) });
// const message = await openpgp.createMessage({ text: 'Hello, World!' });


// instance.interceptors.response.use(
//   function (response) {
//     if (get(response, 'data.data')) {
//       return response.data.data
//     }
//     return response
//   },
//   function (error) {
//     let response = get(error, 'response')
//     if (!response) {
//       response = error.toJSON()
//     }
//     return Promise.reject(response)
//   }
// );


    async function  getPCIPublicKey()  {
    const url = baseURL +'/v1/encryption/public'
    console.log(" In getPCIPublicKey  ...", url);
    const { data } = await instance.get(url, {headers});

    return data.data
    }

const callpostPayment = async (url, payload) => {
if (payload.metadata) {
    payload.metadata.phoneNumber = (payload.metadata.phoneNumber) || null;
  }
  return instance.post(baseURL + url, payload, {headers})
}

const createPayment = async (payload) =>{
const url = '/v1/payments'
return callpostPayment(url, payload)
}


const createCard = async (payload) => {
const url = '/v1/cards'
return callpostPayment(url, payload)
}

function createSomeMessage(){
    const arr = [];
    for (let i = 0; i < 30; i++) {
      arr.push(Math.floor(Math.random() * 10174) + 1);
    }
    for (let i = 0; i < 10; i++) {
      arr.push(0x1F600 + Math.floor(Math.random() * (0x1F64F - 0x1F600)) + 1);
    }
    return '  \t' + String.fromCodePoint(...arr).replace(/\r/g, '\n') + '  \t\n한국어/조선말';
  }

const makeChargeCall = async ( {cardId, amount, phoneNumber, email, cvv,
verification = 'cvv', type ='card', sessionId = 'xxx', ipAddress = '172.33.222.1', currency ='USD'}) => {

  const source = {
    id: cardId,
    type,
  }
try {
    const publicKey = await getPCIPublicKey();
    console.log(" publicKey ", publicKey);
    const encryptedDataVal = await encryptWithPGP({ cvv }, publicKey)

    const { encryptedMessage, keyId } = encryptedDataVal

    const payload =  {
        idempotencyKey: uuidv4(),
        amount: { amount, currency},
        verification,
        source,
        metadata: {
          phoneNumber: phoneNumber,
          email: email,
          sessionId,
          ipAddress,
        },
        encryptedData: encryptedMessage,
        keyId,
    }
      return  await createPayment(payload)
  } catch (error) {
    console.log(" ERROR makeChargeCall", error);
  }
}

const makeCreateCardCall = async ({month, year, line1, line2, city, district, postalCode,
    country, nameCC, phoneNumber, email, cardNumber, cvv, sessionId = '1234', ipAddress = '172.33.222.1'}) => {
      console.log(" In makeCreateCardCall");

    try {
      const publicKey = await getPCIPublicKey()
      console.log(" publicKey ", publicKey);
      
      const cardDetails = {
        number: cardNumber.replace(/\s/g, ''),
        cvv,
      }

    const encryptedDataValue = await encryptWithPGP(cardDetails, publicKey)


      const { encryptedMessage, keyId } = encryptedDataValue;
      const payload = {
                  idempotencyKey: uuidv4(),
                  expMonth: parseInt(month),
                  expYear: 2000 + parseInt(year),
                  billingDetails: {
                    line1,
                    line2,
                    city,
                    district,
                    postalCode,
                    country,
                    name:nameCC,
                  },
                  metadata: {
                    phoneNumber,
                    email,
                    sessionId,
                    ipAddress,
                  },
                  encryptedData: encryptedMessage,
                //   encryptedData,
                  keyId,
                };

        console.log("payload *****", payload);
      return await createCard(payload);
    } catch (error) {
        console.log(" ERROR ", error);
    }
  }


const chargeCardAPI = async (ccObj) => {
  console.log(" In chargeCardAPI");
  
    try {
      const {data} = await makeCreateCardCall(ccObj);
      console.log(" chargeCardAPI card", data);

      if (data && data.data && data.data.id) {
        const cardId = data.data.id;
        const res = await makeChargeCall({...ccObj, cardId});
        console.log(" makeChargeCall res ", res);

        return res;
      }
    } catch (error) {
        console.log(" ERROR chargeCard", error);
    }
  }

  const chargeCardAPIWrap = async (ccObj) => {
    // console.log(" transferAPIWrap request", request);
    // const queryObject = url.parse(request.url,true).query;
    // console.log("*****queryObject ->", queryObject, queryObject.cardNumber);
    // const cardId ="1234", amount="234.00", month="10", year="25",  cardNumber="4007 4000 0000 0007", cvv="123", line1="line1", line2="line2", city="city",
    //   district="AB", postalCode="10006",
    //   country="US", nameCC="Mahantesh Surgihalli", phoneNumber="+12025550180", email="customer-0001@circle.com",
    //   verification = 'cvv', type ='card', sessionId = 'xxx', ipAddress = '172.33.222.1', currency ='USD';

      
    try {
      const result = await chargeCardAPI( ccObj);
      console.log(" chargeCardAPIWrap result ->", result);
        //   response.send(result);
        return result
    } catch (error) {
        console.trace(error) ;
        // response.status(500).send(error);
    }
  };



module.exports = {
    chargeCardAPIWrap
};
