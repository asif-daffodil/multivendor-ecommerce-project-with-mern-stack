import { createBrowserRouter } from "react-router";
import FrontLayout from "./Layouts/FrontLayout";
import Home from "./Pages/Home";
import SignUp from "./Pages/Signup";
import SignIn from "./Pages/SignIn";

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