
import FrontLayout from "./Layouts/FrontLayout";
import Home from "./Pages/Home";
import SignUp from "./Pages/Signup";
import SignIn from "./Pages/SignIn";
import { createBrowserRouter } from "react-router";
import Profile from "./Pages/Profile";

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
    ]
  },
]);

export default router;