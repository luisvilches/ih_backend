const router = require('express').Router();
const ctrl = require('../controllers');

router.get('/companys',ctrl.companys.all)
router.get('/regions',ctrl.regions.regions)

router.get('/users', ctrl.user.all)
router.get('/users/:id', ctrl.user.findById)
router.post('/users', ctrl.user.client)
router.delete('/users/:id', ctrl.user.delete)
router.put('/users/:id', ctrl.user.update)
router.get('/activate/user/:id', ctrl.user.activarUsuario)

router.post('/userjob', ctrl.user.trabajador)
router.get('/userjob', ctrl.user.allUserJob)
router.put('/userjob/:id', ctrl.user.updateUserJob)

router.post('/inspector', ctrl.user.inspector)
router.get('/inspector', ctrl.user.allUserinspector)
router.put('/inspector/:id', ctrl.user.updateUserinspector)

router.post("/agendar/:id", ctrl.user.agendar);
router.post("/inspectores/assing", ctrl.user.asignar);
router.get("/inspectores/free/:id", ctrl.user.libres);
router.get("/inspectores/agendadas/:id", ctrl.user.agendadas);
router.get("/libres", ctrl.user.libresAll)
router.post("/librebydate", ctrl.user.libresByDate);

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
router.get('/edification/project/:project',ctrl.edificaciones.findByNameProject)

router.get('/plantas', ctrl.plantas.all)
router.get('/plantas/:id', ctrl.plantas.findById)
router.post('/plantas', ctrl.plantas.nuevo)
router.delete('/plantas/:id', ctrl.plantas.delete)
router.put('/plantas/:id', ctrl.plantas.update)

router.get('/propiedades/:id_user',ctrl.propiedades.byUser)
router.get('/propiedad/:id',ctrl.propiedades.byId)
router.get('/estado/propiedad/:id/:status', ctrl.propiedades.changeStatus)
router.get('/inspector/propiedades/:id', ctrl.propiedades.propiedadesByInspector)

router.post('/inspecciones', ctrl.inspecciones.create)
router.get('/inspecciones', ctrl.inspecciones.all)
router.post('/pdf/inspeccion', ctrl.inspecciones.generatePdf)

router.get('/clients', ctrl.propiedades.byClient)


router.get('/validtoken', (req,res) => {
    console.log('eeee')
    res.json({valid:true})
})


module.exports = router;