import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { ConversationRoutes } from "../modules/conversation/conv.routes";
import { MessageRoutes } from "../modules/message/message.route";
import { StatusRoutes } from "../modules/status/status.routes";
import { UserRoutes } from "../modules/user/user.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/message",
    route: MessageRoutes,
  },
  {
    path: "/conversation",
    route: ConversationRoutes,
  },
  {
    path: "/status",
    route: StatusRoutes,
  },
  // {
  //    path: '/order',
  //    route: OrderRoutes,
  // },
  // {
  //    path: '/ssl',
  //    route: SSLRoutes,
  // },
  // {
  //    path: '/payment',
  //    route: PaymentRoutes,
  // },
  // {
  //    path: '/review',
  //    route: ReviewRoutes,
  // },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
