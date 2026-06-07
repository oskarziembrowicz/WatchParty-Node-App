const express = require('express');
// const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.use(authController.protect);

router.post('/logout', authController.logout);

router
  .route('/me')
  .get(userController.getMyData)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);
router.route('/me/parties').get(userController.getMyParties);
router.route('/me/hosted-parties').get(userController.getMyHostedParties);
router.route('/me/archived-parties').get(userController.getMyArchivedParties);
router.route('/me/movies').put(userController.saveMovie);
router.route('/me/movies/:id').delete(userController.removeMovie);
router.route('/me/friends').put(userController.addFriend);
router.route('/me/friends/:id').delete(userController.removeFriend);

router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(authController.restrictTo('admin'), userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

router.route('/:id/hosted-parties').get(userController.getHostedParties);

router
  .route('/:id/parties')
  .get(authController.restrictTo('admin'), userController.getUserParties);

// router.post("/forgotPassword", authController.forgotPassword);
// router.patch("/resetPassword/:token", authController.resetPassword);

// router.patch(
//   "/updatePassword",
//   authController.protect,
//   authController.updatePassword,
// );

module.exports = router;
