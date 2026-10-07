import { useState, useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { type User } from "../../types/User";

type PrivateRouteProps = {
    children: ReactNode;
};

export function PrivateRoute({ children }: PrivateRouteProps) {
    const [authenticatedUser, setAuthenticatedUser] = useState<User>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const requestAuthenticatedUser = () => {
        fetch("/api/auth/me", {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            credentials: "include",
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                return response.json();
            })
            .then(user => {
                setAuthenticatedUser(user);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(requestAuthenticatedUser, []);

    if (isLoading) {
        return <div className="bg-black w-screen h-screen">Loading...</div>;
    }

    return authenticatedUser ? children : <Navigate to={"/log-in"} />;
}