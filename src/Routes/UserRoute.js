const express = require('express');
const router = express.Router();

const userController = require('../Controller/UserController');
const { userAuth, isLoggedIn } = require('../Middleware/UserAuth');

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
router.get('/razorpay', (req, res) => {
    res.render("razorpay")
})
// router.post("/subscription", userController.subscriptionId);

module.exports = router;