import express from "express";
import { registerController,loginController, logoutController } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../middlewares/validator.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post('/register',
    registerValidator,
    registerController
)
router.post('/login',
    loginValidator,
    loginController
)
router.post('/logout',
    authMiddleware,
    logoutController
)


export default router;