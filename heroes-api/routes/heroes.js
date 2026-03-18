// routes/heroes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/heroController');
const incidentCtrl    = require('../controllers/incidentController');

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/',   ctrl.create);
router.patch('/:id', ctrl.update);
router.get('/:id/incidents', incidentCtrl.getHeroHistory);

module.exports = router;