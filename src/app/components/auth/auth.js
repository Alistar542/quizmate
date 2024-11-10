"use client";
import React, { createContext, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const logout = () => {
    const auth = getAuth();
    auth.signOut();
    setCurrentUser(null)
  };
  const login = (email, password) => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
    return
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};