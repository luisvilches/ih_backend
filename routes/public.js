const router = require('express').Router();
const ctrl = require('../controllers');

router.get('/', (req,res) => res.json({message:"Hola Mundo"}))
router.post("/login", ctrl.auth.auth);
router.post('/users', ctrl.user.client);

router.get('/companys',ctrl.companys.all)
router.get('/regions',ctrl.regions.regions)

module.exports = router;