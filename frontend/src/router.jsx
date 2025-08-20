
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

import AdminDashboard from "./Pages/AdminDashboard";
import AdminProducts from "./Pages/AdminProducts";
import AdminCategories from "./Pages/AdminCategories";
import AdminBrands from "./Pages/AdminBrands";
import AdminProductForm from "./Pages/AdminProductForm";
import VendorProducts from "./Pages/VendorProducts";
import VendorProductForm from "./Pages/VendorProductForm";
import AdminOrders from "./Pages/AdminOrders";
import VendorOrders from "./Pages/VendorOrders";
import Cart from "./Pages/Cart";
import ProductDetail from "./Pages/ProductDetail";
import Products from "./Pages/Products";
import Checkout from "./Pages/Checkout";

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
          path: "/products",
          element: <Products />
        },
        {
          path: "/products/:id",
          element: <ProductDetail />
        },
        {
          path: "/cart",
          element: <Cart />
        },
        {
          path: "/checkout",
          element: <Checkout />
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
          path: "/dashboard/vendor/products",
          element: <VendorProducts />
        }
        ,
        {
          path: "/dashboard/vendor/orders",
          element: <VendorOrders />
        }
        ,
        {
          path: "/dashboard/vendor/products/add",
          element: <VendorProductForm />
        }
        ,
        {
          path: "/dashboard/vendor/products/:id/edit",
          element: <VendorProductForm />
        }
        ,
        {
          path: "/dashboard/admin",
          element: <AdminDashboard />
  },
        {
          path: "/admin/products",
          element: <AdminProducts />
        },
        {
          path: "/admin/orders",
          element: <AdminOrders />
        },
        {
          path: "/admin/products/add",
          element: <AdminProductForm />
        },
        {
          path: "/admin/products/:id/edit",
          element: <AdminProductForm />
        },
        {
          path: "/admin/brands",
          element: <AdminBrands />
        },
        {
          path: "/admin/categories",
          element: <AdminCategories />
        },
  {
          path: "/change-password",
          element: <ChangePassword />
        }
    ]
  },
]);

export default router;