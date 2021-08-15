import fs from "fs";
import util, { log } from "util";
import glob from "glob";
import { hashSync } from 'bcryptjs'
import { BigNumber, utils } from 'ethers'

import { Buckets, UserAuth, Client, KeyInfo, PrivateKey } from "@textile/hub";
import { TEXTILE_HUB_KEY, TEXTILE_HUB_SECRET } from "./constants";

const keyInfo = {
  key: TEXTILE_HUB_KEY,
  secret: TEXTILE_HUB_SECRET
}
const keyInfoOptions = {
  debug: false
}

async function getKeyInfo() {
  const keyInfo = {
    key: TEXTILE_HUB_KEY,
    secret: TEXTILE_HUB_SECRET,
  };
  return keyInfo;
}

const generateMessageForEntropy = (ethereum_address, application_name, secret) => {
  return (
    '******************************************************************************** \n' +
    'READ THIS MESSAGE CAREFULLY. \n' +
    'DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND WRITE \n' +
    'ACCESS TO THIS APPLICATION. \n' +
    'DO NOT SIGN THIS MESSAGE IF THE FOLLOWING IS NOT TRUE OR YOU DO NOT CONSENT \n' +
    'TO THE CURRENT APPLICATION HAVING ACCESS TO THE FOLLOWING APPLICATION. \n' +
    '******************************************************************************** \n' +
    'The Ethereum address used by this application is: \n' +
    '\n' +
    ethereum_address +
    '\n' +
    '\n' +
    '\n' +
    'By signing this message, you authorize the current application to use the \n' +
    'following app associated with the above address: \n' +
    '\n' +
    application_name +
    '\n' +
    '\n' +
    '\n' +
    'The hash of your non-recoverable, private, non-persisted password or secret \n' +
    'phrase is: \n' +
    '\n' +
    secret +
    '\n' +
    '\n' +
    '\n' +
    '******************************************************************************** \n' +
    'ONLY SIGN THIS MESSAGE IF YOU CONSENT TO THE CURRENT PAGE ACCESSING THE KEYS \n' +
    'ASSOCIATED WITH THE ABOVE ADDRESS AND APPLICATION. \n' +
    'AGAIN, DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND \n' +
    'WRITE ACCESS TO THIS APPLICATION. \n' +
    '******************************************************************************** \n'
  );
};


const generatePrivateKey = async (signer, address) => {
  // avoid sending the raw secret by hashing it first
  const secret = hashSync("secret", 10);
  const message = generateMessageForEntropy(address, 'snapNft', secret)
  const signedText = await signer.signMessage(message);
  const hash = utils.keccak256(signedText);
  if (hash === null) {
    throw new Error('No account is provided. Please provide an account to this application.');
  }
  // The following line converts the hash in hex to an array of 32 integers.
    // @ts-ignore
  const array = hash
    // @ts-ignore
    .replace('0x', '')
    // @ts-ignore
    .match(/.{2}/g)
    .map((hexNoPrefix) => BigNumber.from('0x' + hexNoPrefix).toNumber())
  if (array.length !== 32) {
    throw new Error('Hash of signature is not the correct size! Something went wrong!');
  }
  const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(array))
  console.log(identity.toString())

  // Your app can now use this identity for generating a user Mailbox, Threads, Buckets, etc
  return identity;
};

export const createIdentity = async (signer, address) => {
  try {
    if(address){
      const identity = generatePrivateKey(signer, address);
      const identityString = identity.toString();
      localStorage.setItem("identity", identityString);
      return identity;
    }
  } catch (err) {
    return err.message;
  }
};

export const getIdentity = async (signer, address) => {
  try {
    const storedIdent = localStorage.getItem("identity");
    if (storedIdent === null) {
      throw new Error("No identity");
    }
    const restored = PrivateKey.fromString(storedIdent);
    return restored;
  } catch (e) {
    /**
     * If any error, create a new identity.
     */
    try {
      const textHubId = await createIdentity(signer, address);
      const identity = textHubId;
      if(identity){
        const identityString = identity.toString();
        localStorage.setItem("identity", identityString);
      }
      // const identity = PrivateKey.fromRandom()
      // const identityString = identity.toString()
      // localStorage.setItem("identity", identityString)
      // return identity
    // return identity;
    } catch (err) {
      console.log(" ERROR ", err);
      
      return err.message;
    }
  }
};

const globDir = util.promisify(glob);

// expects an already setup buckets session using getOrCreate or withThread
export const pushAllFile = async (files, buckets, bucketKey, dir) => {
  // const files = await globDir("<dir glob options>");
  // return 
  // await Promise.all(
    files.forEach(async file => {
      // const reader = new window.FileReader()
      const reader = window.FileReaderSync;
      const fileName = file.name;
      const orgFile = file.originFileObj;
      const filePath = orgFile.webkitRelativePath
      reader.readAsArrayBuffer(orgFile);
      reader.onloadend = async () => {
        const buff = await Buffer(reader.result);
        // const upload = {
        //   path: filePath,
        //   content: buff,
        // };
        // const pushPath = await buckets.pushPath(bucketKey, fileName, upload);
        const pushPath = await buckets.pushPath(bucketKey, filePath, reader.result);
        console.log("pushPath ", pushPath);
      }
      // return await buckets.pushPath(bucketKey, orgFile, orgFile.stream())
      // return await buckets.pushPath(bucketKey, fileName, upload);
    })
    // ,
  // );
};


const insertFile = (buckets, bucketKey, file, path, orgFile) => {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onabort = () => reject('file reading was aborted')
    reader.onerror = () => reject('file reading has failed')
    reader.onload = () => {
      const binaryStr = reader.result
      // Finally, push the full file to the bucket
      buckets.pushPath(bucketKey, path, binaryStr).then((raw) => {
        console.log(" raw ", raw);
        
        resolve(raw);
      })
    }
    reader.readAsArrayBuffer(orgFile);
  })
}

export const pushAllFile2 = async (files, buckets, bucketKey) => {
  for(let i=0; i< files.length; i++) {
    const file = files[i];
    const fileName = file.name;
    const orgFile = file.originFileObj;
    const filePath = orgFile.webkitRelativePath
    await insertFile(buckets, bucketKey, fileName, filePath, orgFile);

  }
    // files.forEach(async file => {
    //   const fileName = file.name;
    //   const orgFile = file.originFileObj;
    //   const filePath = orgFile.webkitRelativePath
    //   await insertFile(buckets, bucketKey, fileName, filePath, orgFile);
    // })
  }

// export const pushAllFile = async (files, buckets, bucketKey, dir) => {
//   // const files = await globDir("<dir glob options>");
//   return await Promise.all(
//     files.map(async file => {
//       const fileName = file.name;
//       const orgFile = file.originFileObj;
//       const filePath = file.webkitRelativePath
//     }),
//   );
// };

// const logoFile = e.fileList[0] && e.fileList[0].originFileObj;
// const logoReader = new window.FileReader()
// logoReader.readAsArrayBuffer(logoFile)
// logoReader.onloadend = async () => {
//   const buff = Buffer(logoReader.result);
//   setBuffer(buff);
//   console.log('buffer', buff);
//   if(STORAGE==="IPFS"){
//     Ipfs.files.add(buff, (error, result) => {
//       if(error) {
//         console.error(error)
//         return
//       }
//       console.log(" ipfs Hash ", result[0] && result[0].hash);
//       setIpfsHash(result[0] && result[0].hash);
//     })

// This method requires that you run "getOrCreate" or have specified "withThread"
export const logLinks = async (buckets, bucketKey) => {
  const links = await buckets.links(bucketKey);
  console.log("links ---->", links);
  return links;
}

export const getFilters = async (buckets) => {
  const roots = await buckets.list();
  return roots;
}

export const pullFile = async (buckets, key, path) => {
  // console.log(await buckets.root(key));
  
  const roots = await buckets.pullPath(key, path);
  console.log(" roots ",roots);
  
  return roots;
}

export const getOrCreateBucket = async (bucketName, signer, address) => {
  // const bucket = await Buckets.withKeyInfo(getKeyInfo(),  {
  //   debug: true
  // });
  const identity = await getIdentity(signer, address);
  // const { root } = await bucket.getOrCreate(bucketName);
  const buckets = await Buckets.withKeyInfo(keyInfo, keyInfoOptions);
  // Authorize the user and your insecure keys with getToken
  await buckets.getToken(identity);

  const buck = await buckets.getOrCreate('io.textile.dropzone')
  const root = buck.root
  if (!root) throw new Error("bucket not created");
  const bucketKey = root.key;
  // return { bucket, bucketKey };
  return {buckets: buckets, bucketKey: buck.root.key};
};

const uploadSlate = async buffer => {
  const url = "https://uploads.slate.host/api/public/df680546-a4dc-45bc-8d0b-5e6f488fd877"; // collection ID

  const data = new FormData();
  const date = new Date();
  data.append("data", buffer, date.toISOString() + ".png");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic SLA0e9b8b3b-2081-430e-a830-740cd8e00efdTE", // API key
    },
    body: data,
  });

  const json = await response.json();
  return json;
};
