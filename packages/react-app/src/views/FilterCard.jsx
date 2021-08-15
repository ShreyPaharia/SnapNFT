import React from 'react'
import { Card, Button, Table } from "antd";
// import { Icon } from '@iconify/react';
// import ethereumIcon from '@iconify-icons/mdi/ethereum';
import '../styles/CardAnt.css';
import { useHistory } from 'react-router-dom'
const { Meta } = Card;
function FilterCard({ nft }) {
    const { contentURI, imageURL, metadataURI } = nft;
    const { name, description } = metadataURI
    const buttonWidth = 70;
    return (
        // <div className='card' onClick={() => {}}>
        //     <img src={imageURL} alt="nft artwork" />
        //     <div className="card__info">
        //         <h2>{name}</h2>
        //         <h4>{description.length >= 100 ? description.substring(0, 100) + '...' : description}</h4>

        //     </div>
        //     <div className='card__infoValueParent'>
        //         <div className="card__infoValue">
        //                 {/* <h4>{auction_type}</h4> */}
        //                 {/* <h3>{web3.utils.fromWei(price)}</h3>
        //                 // <Icon icon={ethereumIcon} className='symbol'/> */}
        //         </div>
        //     </div>
        // </div>
        // <></>
        // <div  style={{ border: "2px solid #cccccc", padding: 16 }}>
        <Card
            hoverable
            style={{ width: 240 }}
            cover={<img alt="" src={imageURL} />}
        >
            <Meta title={name} description={description} />
        </Card>
        // </div>
        )
}

export default FilterCard
