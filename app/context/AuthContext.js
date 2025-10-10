import React, { createContext, useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { useDispatch, useSelector } from "react-redux";

import { setUserDetail } from "../store/dashboard/UserSlice";
import { setUsers } from "../store/dashboard/UsersSlice";
import { useRouter } from "next/navigation";

const defaultProvider = {
  repName: null,
  email: null,
};

const AuthContext = createContext(defaultProvider);

const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const users = useSelector((state) => state.users);

  const [repName, setRepName] = useState(defaultProvider.repName);
  const [email, setEmail] = useState(defaultProvider.email);

  const dispatch = useDispatch();

  const router = useRouter();

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: !!session && users.length == 0,
    staleTime: 15 * 60 * 1000,
    onSuccess: (data) => {
      dispatch(setUsers(data));
    },
  });

  const usersList = users.length > 0 ? users : usersData || [];
  const loggedInEmail = session?.user?.email || "";

  const match = usersList.find(
    (r) =>
      r?.email?.toLowerCase().trim() ===
      loggedInEmail.toLocaleLowerCase().trim()
  );

  const { data: userInfo, isLoading: isUserDetailLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch(
        `/api/user?rep=${encodeURIComponent(match.rep)}`
      );
      if (!response.ok) throw new Error("Failed to fetch user details");
      return response.json();
    },
    enabled: !!session && !!match,
    staleTime: 15 * 60 * 1000,
    onSuccess: (data) => {
      setRepName(data[0]?.rep || "");
      dispatch(setUserDetail(data[0]));
    },
  });

  useEffect(() => {
    const initAuth = () => {
      if (session && session.user) {
        const { email } = session.user;
        if (!email || !match) {
          logoutHandler();
        } else {
          setEmail(email);
        }
      } else {
        logoutHandler();
      }
    };

    initAuth();
  }, []);

  const logoutHandler = () => {
    localStorage.clear();
    setRepName(defaultProvider.repName);
    setEmail(defaultProvider.email);

    router.push("/");
  };

  const values = {
    isUserDetailLoading,
    isLoading,
    repName,
    email,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
