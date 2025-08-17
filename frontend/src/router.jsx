import { createBrowserRouter } from "react-router";
import FrontLayout from "./Layouts/FrontLayout";
import Home from "./Pages/Home";
import SignUp from "./Pages/Signup";

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
    ]
  },
]);

export default router;