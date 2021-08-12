import { NFTStorage, File } from 'nft.storage'
import {NFT_STORAGE_KEY} from '../constants'
const client = new NFTStorage({ token: NFT_STORAGE_KEY })

export async function uploadNFTStorage (json) {
    // const metadata = await client.store({
    // name: 'Pinpie',
    // description: 'Pin is not delicious beef!',
    // image: new File(
    //     [
    //     /* data */
    //     ],
    //     'pinpie.jpg',
    //     { type: 'image/jpg' }
    // ),
    // })
    const metadata = await client.store(json)
    return metadata;
}

