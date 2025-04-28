import { FormControl } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box } from "@chakra-ui/layout";
import MyImage from "../assets/bubble-chat.png";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../components/animations/typing.json";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { FiSend } from "react-icons/fi";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }, [selectedChat, user.token, toast]);

  const sendMessage = async () => {
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          { content: newMessage, chatId: selectedChat._id },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);

    socket.emit("getOnlineUsers");

    socket.on("connected", () => setSocketConnected(true));
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("disconnect");
      socket.off("onlineUsers");
    };
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      selectedChatCompare = selectedChat;
      socket.emit("join chat", selectedChat._id);
    }
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    if (socket && selectedChat) {
      socket.on("message received", (newMessageReceived) => {
        if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
          if (!notification.includes(newMessageReceived)) {
            setNotification([newMessageReceived, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        }
      });

      return () => {
        socket.off("message received");
      };
    }
  }, [messages, selectedChat, notification, fetchAgain, setNotification, setFetchAgain]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            fontSize={{ base: "16px", md: "20px" }}
            marginRight={{ base: "10px", md: "20px" }}
            pb={3}
            px={2}
            w={{ base: "100%", md: "auto" }}
            fontFamily="Inder"
            d="flex"
            justifyContent={{ base: "center", md: "space-between" }}
            alignItems="center"
          >
            <Box display="flex" justifyContent="space-between">
              <IconButton
                d={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
              />
              {messages &&
                (!selectedChat.isGroupChat ? (
                  <div style={{ width: '550px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold' }}>{getSender(user, selectedChat.users)}</span>
                      <span style={{
                        color: onlineUsers[getSenderFull(user, selectedChat.users)._id] ? 'white' : 'red',
                        fontSize: '14px',
                        marginTop: '5px'
                      }}>
                        {onlineUsers[getSenderFull(user, selectedChat.users)._id] ? "Online" : "Offline"}
                      </span>
                    </div>
                    <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                  </div>
                ) : (
                  <div>
                    {selectedChat.chatName.toUpperCase()}
                    <UpdateGroupChatModal
                      fetchAgain={fetchAgain}
                      setFetchAgain={setFetchAgain}
                      fetchMessages={fetchMessages}
                    />
                  </div>
                ))}
            </Box>
          </Box>
          <Box d="flex" flexDir="column" justifyContent="flex-end" p={3} bg="#E8E8E8" h="100%" overflowY="hidden">
            {loading ? (
              <Spinner size="xl" />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl isRequired mt={3}>
              {istyping && <Lottie options={defaultOptions} width={70} style={{ marginBottom: 15, marginLeft: 0 }} />}
              <Box bg="#3B6F91" w="71.6%" position="fixed" bottom="0" h="60px" ml="-24px">
                <InputGroup>
                  <Input
                    bg="#25516E"
                    marginBottom="10px"
                    style={{
                      position: 'fixed',
                      bottom: '0',
                      width: '50%',
                      left: '50%',
                      transform: 'translate(-20%)',
                    }}
  
                    placeholder="Type a message.."
                    value={newMessage}
                    onChange={typingHandler}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    borderRadius="5px"
                    _hover={{
                      bg: "white",
                      borderColor: "#3B6F91",
                      borderWidth: "2px",
                      borderStyle: "solid",
                    }}
                  />
                  
                  <InputRightElement width="30px">
                    <IconButton
                      style={{height:'40px', position:"fixed" ,marginRight:'220px',marginTop:'20px'}}
                      icon={<FiSend />}
                      size="sm"
                      onClick={sendMessage}
                      aria-label="Send Message"
                      colorScheme="blue"
                    />
                    </InputRightElement>
                    
                </InputGroup>
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" marginTop="20%" height="92vh">
          <img src={MyImage} alt="description" style={{ height: '120px', marginBottom: '20px', marginLeft: '45%' }} />
          <h1 style={{ color: 'white', fontWeight: '500', fontFamily: 'khula', textAlign: 'center' }}>Hello Talk for Chatting</h1>
          <h2 style={{ fontFamily: 'khula', fontSize: '24px', color: '#C0C0C0', textAlign: 'center' }}>Send and receive messages with</h2>
          <h3 style={{ fontFamily: 'khula', fontSize: '20px', color: '#C0C0C0', fontWeight: 600, textAlign: 'center' }}>Hello Talk</h3>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
