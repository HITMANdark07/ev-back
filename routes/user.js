const router = require('express').Router();

const { login, list, search } = require('../controllers/user');

router.post("/login", login);
router.get("/user/list",list);
router.get("/user/search/list",search);

module.exports = router;