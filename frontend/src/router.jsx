import { createBrowserRouter } from "react-router";
import FrontLayout from "./Layouts/FrontLayout";
import Home from "./Pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <FrontLayout />,
    children: [
        {
            path: "/",
            element: <Home />
        }
    ]
  },
]);

export default router;