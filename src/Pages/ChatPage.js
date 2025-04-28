import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import 'C:/Users/Dell/Desktop/MERN-CHAT-APP/frontend/src/Pages/ChatPage.css';
import Chatbox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  return (
    <div style={{ width: "100%"}}>
      {user && <SideDrawer />}
      <Box style={{display:"flex",justifyContent:"space-between",width:'100%',height:"auto",minHeight:'100vh',padding:"10px",backgroundColor:'#3B6F91',overflow:'auto'}}>
        {user && <MyChats  fetchAgain={fetchAgain} />}
        {user && <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
      </Box>
    </div>
  );
};

export default Chatpage;