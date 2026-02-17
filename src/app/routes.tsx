import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { LoginPage } from "./components/LoginPage";
import { HomePage } from "./components/HomePage";
import { ScriptsPage } from "./components/ScriptsPage";
import { ConfigManagementPage } from "./components/ConfigManagementPage";
import { AutomaticFailoverPage } from "./components/AutomaticFailoverPage";
import { SystemCheckPage } from "./components/SystemCheckPage";
import { RulesManagementPage } from "./components/RulesManagementPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "home", element: <HomePage /> },
      { path: "scripts", element: <ScriptsPage /> },
      { path: "config", element: <ConfigManagementPage /> },
      { path: "failover", element: <AutomaticFailoverPage /> },
      { path: "system-check", element: <SystemCheckPage /> },
      { path: "rules", element: <RulesManagementPage /> },
    ],
  },
]);