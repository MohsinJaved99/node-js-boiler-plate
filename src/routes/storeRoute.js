//Route Prefix: /api/stores
const router = require('express').Router();
const validateUserHandler = require('../middlewares/validateUserHandler');
const storeController = require("../controllers/storeController");

router.get('/', validateUserHandler, storeController.getStores);

router.get('/:store_id_or_store_uuid', validateUserHandler, storeController.getStore);

router.post('/', validateUserHandler, storeController.createStore);

router.put('/:store_id_or_store_uuid', validateUserHandler, storeController.updateStore);

router.delete('/:store_id_or_store_uuid', validateUserHandler, storeController.destroyStore);

module.exports = router;