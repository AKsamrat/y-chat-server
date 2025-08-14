import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  // {
  //    path: '/auth',
  //    route: AuthRoutes,
  // },
  // {
  //    path: '/students',
  //    route: StudentRoutes,
  // },
  // {
  //    path: '/tutors',
  //    route: TutorRoutes,
  // },
  // {
  //    path: '/booking',
  //    route: BookingRoutes,
  // },
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
