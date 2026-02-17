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
    Component: Root,
    children: [
      { path: "/", Component: LoginPage },
      { path: "/home", Component: HomePage },
      { path: "/scripts", Component: ScriptsPage },
      { path: "/config", Component: ConfigManagementPage },
      { path: "/failover", Component: AutomaticFailoverPage },
      { path: "/system-check", Component: SystemCheckPage },
      { path: "/rules", Component: RulesManagementPage },
    ],
  },
]);