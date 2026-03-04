// routes/incidents.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/incidentController');

router.get('/',             ctrl.getAll);
router.post('/',            ctrl.create);
router.post('/:id/assign',  ctrl.assign);
router.patch('/:id/resolve', ctrl.resolve);

module.exports = router;