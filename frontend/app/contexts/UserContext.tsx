"use client"
import React, { createContext, useContext, useEffect, useState } from "react"

interface User {
    name: string | undefined,
    mail: string | undefined,
    id: string,
    binds: number,
    flags: number,
}

const defaultUser: User = {
    name: "John Doe",
    mail: "JohnDoe@doemail.com",
    id: "1337",
    binds: 15,
    flags: 0,
}

interface UserContextProps {
    children: React.ReactNode,
}

const UserContext = createContext<{
    userData: User,
    setUserData: React.Dispatch<React.SetStateAction<User>>,
}>({ userData: defaultUser, setUserData: () => { } });

export function useUserContext() {
    return useContext(UserContext);
}

type UserRespons =
    | { type: "User"; data: User }
    | { type: "LoginRequired" };

export const UserContextProvider: React.FC<UserContextProps> = ({ children }) => {
    const [user, setUser] = useState<User>(defaultUser);
    const [userLoaded, setUserLoaded] = useState<boolean>(false);

    useEffect(() => {
        fetch("/api/get_user").then(r => r.json().then((data: UserRespons) => {
            if (data.type == "LoginRequired") {
                window.location.href = "/api/login";
            }
            else {
                setUser(data.data);
                console.log(data);
                setUserLoaded(true);
            }
        }))
    }, [])

    if (!userLoaded) return null;

    return (
        <>
            <UserContext.Provider value={{ userData: user, setUserData: setUser }}>
                {children}
            </UserContext.Provider>
        </>
    )
}