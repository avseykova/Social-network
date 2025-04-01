import express from "express";
import {
  getUserInfo,
  updateUser,
  getFollowers,
  getSubscriptions,
  toggleSubscribe,
  toggleUnsubscribe,
  getAllUsers
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/user-info", getUserInfo);
router.put("/updateuser", updateUser);
router.get("/followers/:userId", getFollowers);
router.get("/subscriptions/:userId", getSubscriptions);
router.put("/subscribe", toggleSubscribe);
router.put("/unsubscribe", toggleUnsubscribe);
router.get("/users", getAllUsers);

export default router;