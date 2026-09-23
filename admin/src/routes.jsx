import {
  ListBulletIcon,
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, UserList, FishList} from "@/pages/dashboard";
import { SignIn, SignUp, SignOut } from "@/pages/auth";
import { Notifications, Components, ProfileExample, Tables, Sorting } from "@/pages/demo";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    title: "Administravimas",
    layout: "admin",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <ListBulletIcon {...icon} />,
        name: "Fishes",
        path: "/fishes",
        element: <FishList />,
      }
      // ,
      // {
      //   icon: <UserCircleIcon {...icon} />,
      //   name: "Vartotojų sąrašas",
      //   path: "/vartotojai",
      //   element: <UserList />,
      // },
      // {
      //   icon: <UserCircleIcon {...icon} />,
      //   name: "Paskyra",
      //   path: "/paskyra",
      //   element: <Profile />,
      // },
    ]
    // ,
  // },
  // {
  //   title: "Autentifikacija",
  //   layout: "auth",
  //   pages: [
  //     {
  //       icon: <ServerStackIcon {...icon} />,
  //       name: "Prisijungti",
  //       path: "/prisijungti",
  //       element: <SignIn />,
  //     },
  //     {
  //       icon: <RectangleStackIcon {...icon} />,
  //       name: "Registruotis",
  //       path: "/registruotis",
  //       element: <SignUp />,
  //     },
  //     {
  //       icon: <RectangleStackIcon {...icon} />,
  //       name: "Atsijungti",
  //       path: "/atsijungti",
  //       element: <SignOut />,
  //     },
  //   ],
  // },
  // {
  //   title: "deomo puslapiai",
  //   layout: "demo",
  //   pages: [
  //     {
  //       icon: <UserCircleIcon {...icon} />,
  //       name: "profile example",
  //       path: "/profile2",
  //       element: <ProfileExample />,
  //     },
  //     {
  //       icon: <TableCellsIcon {...icon} />,
  //       name: "tables",
  //       path: "/tables",
  //       element: <Tables />,
  //     },
  //     {
  //       icon: <UserCircleIcon {...icon} />,
  //       name: "components",
  //       path: "/components",
  //       element: <Components />,
  //     },
  //     {
  //       icon: <InformationCircleIcon {...icon} />,
  //       name: "notifications",
  //       path: "/notifications",
  //       element: <Notifications />,
  //     },
  //     {
  //       icon: <InformationCircleIcon {...icon} />,
  //       name: "sorting",
  //       path: "/sorting",
  //       element: <Sorting />,
  //     },
  //   ],
  },
];

export default routes;
