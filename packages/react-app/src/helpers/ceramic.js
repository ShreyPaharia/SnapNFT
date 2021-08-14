import { DID } from 'dids'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import KeyDidResolver from 'key-did-resolver'
import { ThreeIdConnect, EthereumAuthProvider } from '@3id/connect'

import { IDX } from '@ceramicstudio/idx'


import Ceramic from '@ceramicnetwork/http-client'
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import { TileDocument } from '@ceramicnetwork/stream-tile'

function createIDX(ceramic,aliases) {
  const idx = new IDX({ ceramic,aliases })
  window.idx = idx
  return idx
}

async function createCeramic() {
  const ceramic = new Ceramic('https://ceramic-clay.3boxlabs.com')
  window.ceramic = ceramic
  window.TileDocument = TileDocument
  window.Caip10Link = Caip10Link
  return Promise.resolve(ceramic)
}

async function getProvider(ethProvider){
  const addresses = await ethProvider.enable()
  await threeID.connect(new EthereumAuthProvider(ethProvider, addresses[0]))
  return threeID.getDidProvider()
}

const ceramicPromise = createCeramic()
const threeID = new ThreeIdConnect()
const aliases = {
  notesList:'kjzl6cwe1jw14bbbijxl0fnqr33dc734ipoz3ilue6h17jq13k14pn1v2ee4z55'
}

export async function authenticateCeramic (ethProvider) {
  const [ceramic, provider] = await Promise.all([ceramicPromise, getProvider(ethProvider)])
  const keyDidResolver = KeyDidResolver.getResolver()
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
  const resolver = { ...keyDidResolver, ...threeIdResolver}

  const did = new DID({
    provider: provider,
    resolver: resolver,
  })
  await did.authenticate()
  await ceramic.setDID(did)

  const idx = createIDX(ceramic,aliases)
  window.did = ceramic.did
  return idx
}