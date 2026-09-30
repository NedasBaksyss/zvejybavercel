import { Link } from "react-router-dom";
import {
  Button,
  IconButton,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  ArrowsPointingOutIcon,
  ArrowLeftCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import {
  AuthContext,
} from "@/context";
import { useContext } from "react";


export function UserInfo() {
  const { user, token } = useContext(AuthContext);
  // console.log("Navbar user:", user, "token:", token);


  return (
    (user && token) ? (
      <>
      <Link key={1} to="/dashboard/paskyra">
        <Button
          variant="text"
          color="blue-gray"
          className="hidden items-center gap-1 px-4 xl:flex normal-case"
        >
          <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
          {user.email ?? "Profilis"} ({user.role})
        </Button>
        <IconButton
          variant="text"
          color="blue-gray"
          className="grid xl:hidden"
        >
          <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
        </IconButton>
      </Link>
      <Link to="/auth/atsijungti">
        <Button
          variant="text"
          color="blue-gray"
          className="hidden items-center gap-1 px-4 xl:flex normal-case"
        >
          <ArrowLeftCircleIcon className="h-5 w-5 text-blue-gray-500" />
          Atsijungti
        </Button>
        <IconButton
          variant="text"
          color="blue-gray"
          className="grid xl:hidden"
        >
          <ArrowLeftCircleIcon className="h-5 w-5 text-blue-gray-500" />
        </IconButton>
      </Link>
      </>
    ) : (
      <>
      <Link key={2} to="/auth/registruotis">
        <Button
          variant="text"
          color="blue-gray"
          className="hidden items-center gap-1 px-4 xl:flex normal-case"
        >
          <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
          Užsiregistruoti
        </Button>
        <IconButton
          variant="text"
          color="blue-gray"
          className="grid xl:hidden"
        >
          <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
        </IconButton>
      </Link>
      <Link key={1} to="/auth/prisijungti">
        <Button
          variant="text"
          color="blue-gray"
          className="hidden items-center gap-1 px-4 xl:flex normal-case"
        >
          <ArrowRightCircleIcon className="h-5 w-5 text-blue-gray-500" />
          Prisijungti
        </Button>
        <IconButton
          variant="text"
          color="blue-gray"
          className="grid xl:hidden"
        >
          <ArrowRightCircleIcon className="h-5 w-5 text-blue-gray-500" />
        </IconButton>
      </Link>
      </>
    )
  );
}

UserInfo.displayName = "/src/widgets/layout/user-info.jsx";

export default UserInfo;
