import { createBrowserRouter, redirect } from "react-router";
import { tokenStore } from "../shared/api/tokenStore";
import { refreshAccessToken } from "../features/auth/api/auth";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import MyTasksPage from "../features/dashboard/pages/MyTasksPage";
import SettingsPage from "../pages/SettingsPage";
import MainLayout from "../shared/components/MainLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

async function ensureAuthenticated() {
    const token = tokenStore.get()

    if(token && !tokenStore.isExpired()) return

    try{
        await refreshAccessToken()
        return
    } catch {
        return redirect("/login")
    }
}

export const router = createBrowserRouter([
    { path: "/register", Component: RegisterPage },
    { path: "/login", Component: LoginPage },
    { 
        path: "/", 
        loader: ensureAuthenticated, 
        Component: MainLayout,
        children: [
            {
                index: true, //redirect / to /dashboard
                loader: () => redirect("/dashboard")
            },
            {
                path: "dashboard",
                Component: DashboardPage
            },
            {
                path: "my-tasks",
                Component: MyTasksPage
            },
            {
                path: "settings",
                Component: SettingsPage
            }
        ] 
    }
])