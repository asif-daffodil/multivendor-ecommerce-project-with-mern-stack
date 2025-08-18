
import FrontLayout from "./Layouts/FrontLayout";
import Home from "./Pages/Home";
import SignUp from "./Pages/Signup";
import SignIn from "./Pages/SignIn";
import { createBrowserRouter } from "react-router";
import Profile from "./Pages/Profile";
import UpdateProfile from "./Pages/UpdateProfile";
import ChangePassword from "./Pages/ChangePassword";
import ProfilePicture from "./Pages/ProfilePicture";
import DashboardRedirect from "./Pages/DashboardRedirect";
import UserDashboard from "./Pages/UserDashboard";
import VendorDashboard from "./Pages/VendorDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <FrontLayout />,
    children: [
        {
            path: "/",
            element: <Home />
        },
        {
          path: "/sign-up",
          element: <SignUp />
        },
        {
          path: "/sign-in",
          element: <SignIn />
        },
        {
          path: "/profile",
          element: <Profile />
        }
        ,
        {
          path: "/profile/edit",
          element: <UpdateProfile />
        }
        ,
        {
          path: "/profile-picture",
          element: <ProfilePicture />
        }
        ,
        {
          path: "/dashboard",
          element: <DashboardRedirect />
        }
        ,
        {
          path: "/dashboard/user",
          element: <UserDashboard />
        }
        ,
        {
          path: "/dashboard/vendor",
          element: <VendorDashboard />
        }
        ,
        {
          path: "/change-password",
          element: <ChangePassword />
        }
    ]
  },
]);

export default router;