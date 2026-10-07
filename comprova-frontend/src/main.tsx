import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import "./index.css";
import {AnonymousRoute} from "./components/routes/AnonymousRoute.tsx";
import {Login} from "./pages/auth/Login.tsx";
import {CandidateRegister} from "./pages/auth/CandidateRegister.tsx";
import {CompanyRegister} from "./pages/auth/CompanyRegister.tsx";
import {CompanyRoute} from "./components/routes/CompanyRoute.tsx";
import {CompanyDashboard} from "./pages/dashboard/CompanyDashboard.tsx";

const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <AnonymousRoute>
                <Login/>
            </AnonymousRoute>
        ),
    },
    {
        path: "/company/register",
        element: (
            <AnonymousRoute>
                <CompanyRegister/>
            </AnonymousRoute>
        ),
    },
    {
        path: "/candidate/register",
        element: (
            <AnonymousRoute>
                <CandidateRegister/>
            </AnonymousRoute>
        ),
    },
    {
        path: "/company/dashboard",
        element: (
            <CompanyRoute>
                <CompanyDashboard/>
            </CompanyRoute>
        ),
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router}></RouterProvider>
    </StrictMode>,
);