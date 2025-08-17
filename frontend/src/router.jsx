
import FrontLayout from "./Layouts/FrontLayout";
import Home from "./Pages/Home";
import SignUp from "./Pages/Signup";
import SignIn from "./Pages/SignIn";
import { createBrowserRouter } from "react-router";

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
        }
        ,
        {
          path: "/sign-in",
          element: <SignIn />
        }
    ]
  },
]);

export default router;