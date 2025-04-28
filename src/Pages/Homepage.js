import React from 'react'
import './Homepage.css';
import imagelogo from '../assets/Chatting-cuate.png'
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';
import { useEffect } from "react";
import { useHistory } from "react-router";
import { Box } from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
const Homepage = () => {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history.push("/chats");
  }, [history]);


    return (
      <container>
          <div className="illustration">
          <img src={imagelogo} alt="Illustration" />
          </div>
          <h1 class="welcome">Welcome to</h1>
        <h2>Hello Talk</h2>
        <Box>
        <Tabs isFitted variant='enclosed'>
  <TabList mb='1em'style={{fontFamily:'jura',fontWeight:'600'}}>
    <Tab _selected={{ color: '#f5f5f5', bg: '#4682AA', borderRadius:'0' }} style={{fontWeight:'600'}}>Login</Tab>
    <Tab _selected={{ color: '#f5f5f5', bg: '#4682AA',borderRadius:'0' }} style={{fontWeight:'600'}}>Sign Up</Tab>
  </TabList>
  <TabPanels >
    <TabPanel >
      <p><Login/></p>
    </TabPanel>
    <TabPanel>
      <p><Signup/></p>
    </TabPanel>
  </TabPanels>
</Tabs>
        </Box>
      </container>
  )
}

export default Homepage;