import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      display="flex"  // Changed "d" to "display" for correct Chakra syntax
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text>{user.name}</Text>  {/* Dynamically rendering the user’s name */}
        <Text fontSize="xs">
          <b>Email: </b>
          {user.email}  {/* Dynamically rendering the user’s email */}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
