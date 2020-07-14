const router = require('express').Router();
const ctrl = require('../controllers');

router.get('/', (req,res) => {
    console.log(req.tools)
    res.send('Hola mundo');
})


router.get('/users', ctrl.user.all)
router.get('/users/:id', ctrl.user.findById)
router.post('/users', ctrl.user.nuevo)
router.delete('/users/:id', ctrl.user.delete)
router.put('/users/:id', ctrl.user.update)

router.get('/projects', ctrl.proyectos.all)
router.get('/projects/:id', ctrl.proyectos.findById)
router.post('/projects', ctrl.proyectos.nuevo)
router.delete('/projects/:id', ctrl.proyectos.delete)
router.put('/projects/:id', ctrl.proyectos.update)

router.get('/edifications', ctrl.edificaciones.all)
router.get('/edifications/:id', ctrl.edificaciones.findById)
router.post('/edifications', ctrl.edificaciones.nuevo)
router.delete('/edifications/:id', ctrl.edificaciones.delete)
router.put('/edifications/:id', ctrl.edificaciones.update)

module.exports = router;