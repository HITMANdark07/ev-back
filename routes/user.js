const router = require('express').Router();

const { login, list } = require('../controllers/user');

router.post("/login", login);
router.get("/user/list",list);

module.exports = router;