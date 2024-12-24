import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null); // State to store user data
  const [ready, setReady] = useState(false); // State to indicate readiness

  useEffect(() => {
    // Fetch the user profile only if the user is not already set
    if (!user) {
      axios
        .get("/profile", { withCredentials: true }) // Include credentials (cookies)
        .then((response) => {
          setUser(response.data); // Set user data
          setReady(true); // Indicate readiness
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error.message);
          setReady(true); // Still indicate readiness even if there's an error
        });
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}

// Validate the children prop
UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserContextProvider;
