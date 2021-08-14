import fs from "fs";
import util, { log } from "util";
import glob from "glob";
import { hashSync } from 'bcryptjs'
import { BigNumber, utils } from 'ethers'

import { Buckets, UserAuth, Client, KeyInfo, PrivateKey } from "@textile/hub";
// import { TEXTILE_HUB_KEY, TEXTILE_HUB_SECRET } from "./constants";
const TEXTILE_HUB_KEY = "bsrgdt7tard27y2bcstf3j37yla";
const TEXTILE_HUB_SECRET = "bim4ndfwe6eoz75abat54f5zhxmn5jwhh7qzw75a";

const keyInfo = {
  key: TEXTILE_HUB_KEY,
  secret: TEXTILE_HUB_SECRET
}
const keyInfoOptions = {
  debug: false
}
export const getIdentity = async () => {
  try {
    var storedIdent = localStorage.getItem("identity")
    if (storedIdent === null) {
      throw new Error('No identity')
    }
    const restored = PrivateKey.fromString(storedIdent)
    return restored
  }
  catch (e) {
    try {
      const identity = PrivateKey.fromRandom()
      const identityString = identity.toString()
      localStorage.setItem("identity", identityString)
      return identity
    } catch (err) {
      return err.message
    }
  }
}

export const getBucketKey = async () => {
  const keyInfoOptions = {
    debug: false
  }
  const identity = await getIdentity();

  const buckets = await Buckets.withKeyInfo(keyInfo, keyInfoOptions);
  // Authorize the user and your insecure keys with getToken
  await buckets.getToken(identity)

  const buck = await buckets.getOrCreate('io.textile.dropzone')
  if (!buck.root) {
    throw new Error('Failed to open bucket')
  }
  return {buckets: buckets, bucketKey: buck.root.key};
}
