import { useState, useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { type User } from "../../types/User";
import { AuthService } from "../../services/authService";

type PrivateRouteProps = {
    children: ReactNode;
};

export function CompanyRoute({ children }: PrivateRouteProps) {
    const [authenticatedUser, setAuthenticatedUser] = useState<User>();
    const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('token'));
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            return;
        }

        AuthService.getMe(token)
            .then(user => {
                setAuthenticatedUser(user);
            })
            .catch(() => {
                localStorage.removeItem('token');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin h-8 w-8 border-4 border-[#1a73e8] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!authenticatedUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (authenticatedUser.role !== "ROLE_COMPANY") {
        return <Navigate to="/candidate/dashboard" replace />;
    }

    return children;
}