const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');
const { userAuth, isLoggedIn } = require('../middleware/userAuth');

router.post("/signup", userController.addUser);

router.post("/login", userController.loginUser);
router.post("/verify", userController.verifyOtp);

router.get('/fb/login', userController.fbLoginUser);
router.route('/profile').get(userAuth, userController.profile)
router.get('/fb/callback', userController.fbCallback);
router.get('/', (req, res) => {
    res.render("index")
}) // optional fronted ...

router.post("/order", userController.razorpayWallet);

module.exports = router;