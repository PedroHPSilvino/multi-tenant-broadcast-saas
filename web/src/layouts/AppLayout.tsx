import { useMemo, useState, type ReactNode } from "react";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HubIcon from "@mui/icons-material/Hub";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { ROUTES } from "../constants/routes";
import { auth } from "../lib/firebase";

type AppLayoutProps = {
  children: ReactNode;
};

const drawerWidth = 240;

function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const navigationItems = useMemo(
    () => [
      {
        label: "Dashboard",
        path: ROUTES.dashboard,
        icon: <DashboardIcon />,
      },
      {
        label: "Connections",
        path: ROUTES.connections,
        icon: <HubIcon />,
      },
    ],
    []
  );

  async function handleLogout() {
    await signOut(auth);
    navigate(ROUTES.login, { replace: true });
  }

  function toggleMobileDrawer() {
    setIsMobileDrawerOpen((currentValue) => !currentValue);
  }

  function closeMobileDrawer() {
    setIsMobileDrawerOpen(false);
  }

  const drawerContent = (
    <Box className="flex h-full flex-col">
      <Box className="px-5 py-4">
        <Typography variant="h6" className="font-semibold">
          Broadcast SaaS
        </Typography>
        <Typography variant="body2" className="text-slate-500">
          Messaging platform
        </Typography>
      </Box>

      <Divider />

      <List className="flex-1 px-2 py-3">
        {navigationItems.map((navigationItem) => {
          const isActive =
            navigationItem.path === ROUTES.dashboard
              ? location.pathname === ROUTES.dashboard
              : location.pathname.startsWith(navigationItem.path);

          return (
            <ListItemButton
              key={navigationItem.path}
              component={Link}
              to={navigationItem.path}
              selected={isActive}
              onClick={closeMobileDrawer}
              className="mb-1 rounded-xl"
            >
              <ListItemIcon>{navigationItem.icon}</ListItemIcon>
              <ListItemText primary={navigationItem.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <Box className="p-2">
        <ListItemButton onClick={handleLogout} className="rounded-xl">
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box className="min-h-screen bg-slate-100">
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "white",
        }}
      >
        <Toolbar className="flex justify-between">
          <Box className="flex items-center gap-2">
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" className="font-semibold">
              Broadcast SaaS
            </Typography>
          </Box>

          <Typography variant="body2" className="text-slate-500">
            Multi-tenant messaging
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={isMobileDrawerOpen}
          onClose={closeMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          ml: { sm: `${drawerWidth}px` },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Box className="p-6">{children}</Box>
      </Box>
    </Box>
  );
}

export default AppLayout;