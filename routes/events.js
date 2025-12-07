const router = require('express').Router();
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const verifyToken = require('../auth');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

router.get('/', eventController.getAllEvents);

router.get('/form-data', eventController.getFormData);

router.get('/:id', eventController.getEventById);

router.post('/', verifyToken, eventController.createEvent);
router.put('/:id', verifyToken, eventController.updateEvent);
router.delete('/:id', verifyToken, eventController.deleteEvent);
router.post('/venues', verifyToken, eventController.createVenue);

module.exports = router;