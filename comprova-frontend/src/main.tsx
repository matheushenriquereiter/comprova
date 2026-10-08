import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import { AnonymousRoute } from "./components/routes/AnonymousRoute.tsx";
import { CompanyRoute } from "./components/routes/CompanyRoute.tsx";
import { Login } from "./pages/auth/Login.tsx";
import { CandidateRegister } from "./pages/auth/CandidateRegister.tsx";
import { CompanyRegister } from "./pages/auth/CompanyRegister.tsx";
import { CompanyDashboard } from "./pages/dashboard/CompanyDashboard.tsx";
import { JobPostingCandidates } from "./pages/dashboard/JobPostingCandidates.tsx";
import { AuthLayout } from "./components/ui/AuthLayout.tsx";
import { DashboardLayout } from "./components/ui/DashboardLayout.tsx";
import { CandidateRoute } from "./components/routes/CandidateRoute.tsx";
import { CandidateDashboard } from "./pages/dashboard/CandidateDashboard.tsx";
import { CompanyProfile } from "./pages/dashboard/CompanyProfile.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },
    {
        element: <AuthLayout />,
        children: [
            {
                path: "/login",
                element: (
                    <AnonymousRoute>
                        <Login />
                    </AnonymousRoute>
                ),
            },
            {
                path: "/candidate/register",
                element: (
                    <AnonymousRoute>
                        <CandidateRegister />
                    </AnonymousRoute>
                ),
            },
            {
                path: "/company/register",
                element: (
                    <AnonymousRoute>
                        <CompanyRegister />
                    </AnonymousRoute>
                ),
            },
        ]
    },
    {
        element: <DashboardLayout />,
        children: [
            {
                path: "/company/dashboard",
                element: (
                    <CompanyRoute>
                        <CompanyDashboard />
                    </CompanyRoute>
                ),
            },
            {
                path: "/company/profile",
                element: (
                    <CompanyRoute>
                        <CompanyProfile />
                    </CompanyRoute>
                ),
            },
            {
                path: "/company/dashboard/postings/:id/candidates",
                element: (
                    <CompanyRoute>
                        <JobPostingCandidates />
                    </CompanyRoute>
                ),
            },
            {
                path: "/candidate/dashboard",
                element: (
                    <CandidateRoute>
                        <CandidateDashboard />
                    </CandidateRoute>
                ),
            }
        ]
    }
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
