import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createPostController,
  getPostController,
  createCommentController,
  createLikeController,
  deletePostController,
  getUserPostsController
} from "../controllers/post.controller.js";
import {
  createCommentValidator,
  getPostsValidator,
  createLikeValidator
} from "../middlewares/validator.middleware.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

/**
 * CREATE POST (Protected)
 */
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createPostController
);

/**
 * GET POSTS (PUBLIC ✅)
 * ❌ authMiddleware REMOVED
 */
router.get(
  "/",
  getPostsValidator,
  getPostController
);

/**
 * GET USER POSTS (Protected)
 */
router.get(
  "/user/profile",
  authMiddleware,
  getUserPostsController
);

/**
 * DELETE POST (Protected)
 */
router.delete(
  "/:id",
  authMiddleware,
  deletePostController
);

/**
 * COMMENT ON POST (Protected)
 */
router.post(
  "/comment",
  createCommentValidator,
  authMiddleware,
  createCommentController
);

/**
 * LIKE POST (Protected)
 */
router.post(
  "/like",
  createLikeValidator,
  authMiddleware,
  createLikeController
);

export default router;
