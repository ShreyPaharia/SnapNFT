import React, { useState, createRef, useEffect } from "react";
import { Menu, Dropdown, Button } from "antd";
import { Icon } from '@iconify/react';
import { DownOutlined } from '@ant-design/icons';
import { log } from "tone/build/esm/core/util/Debug";


function SongsUI({ setSelectedSong= ()=>{}}) {
    const [song, setSong] = useState("Please select a song");
    const [songList, setSongList] = useState([]);

    const getSongs = async() => {
      const sng = await fetch("https://discoveryprovider.audius.co/v1/tracks/trending?app_name=SNAPNFTAPP");
      const sngPayload = await sng.json();
      const songArr = [];
      sngPayload.data.map((item)=> songArr.push({key: item.id, value:item.title}))
      console.log("songArr", songArr);
      setSongList(songArr)
      return songArr;
    };

    useEffect( ()=>{
        setTimeout(() => {
        }, 2000);
        getSongs();
    },[])

    const songsMenus = (
        <Menu onClick={e => {
          const newSelected = songList && songList.find(item => item.key === e.key);
          console.log("newSelected", newSelected && newSelected.key);
          setSong(newSelected && newSelected.value);
          setSelectedSong(newSelected && newSelected.value);
        }}>
          {songList && songList.map(item => (
            <Menu.Item key={item.key}><Icon icon="flat-color-icons:music" /> - {item.value}</Menu.Item>
          ))}
        </Menu>
      );

      return (
            <div align="left" style={{ margin: 8 }}>
              Songs 
            <Dropdown overlay={songsMenus}>
              <Button>
                {song} <DownOutlined />
              </Button>
            </Dropdown>
            </div>)
}

export default SongsUI
