const { StatusCodes } = require('../config');
const Response = require('../models/responses');
const {validatePayload} = require('../utils/validation/requestValidationUtitily');
const Store = require('../models/Store');
const storeUtility = require('../utils/storeUtility');
const {getV4UUID} = require('../helpers/generateUUID');

const getStores = async (req, res) => {
    try {
        const search = req.query.search||'';
        let page_number = parseInt(req.query.page_number || process.env.ORDER_DEFAULT_PAGE_NUMBER);
        let page_size = parseInt(req.query.page_size || process.env.ORDER_DEFAULT_PAGE_SIZE);
        const order_by = req.query.order_by||Store.getDefaultOrderByColumn();
        const sort_by = req.query.sort_by||'DESC';

        //Check order by and sort by validation
        const validateOrderByAndSortBy = await validatePayload({order_by, sort_by, search}, {
            'order_by': `enum:${Store.getOrderByColumns().join(',')}`,
            'sort_by': 'enum:ASC,DESC',
            'search': `sometimes|maxLength:${process.env.MAX_SEARCH_CHARACTER_LENGTH}`
        });
        if(!validateOrderByAndSortBy.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validateOrderByAndSortBy.errors));
        }

        const status = Store.getStatus(req.query?.status);
        if(status === false) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.genericResponse(false, 'Invalid status.'));
        }

        const stores = await storeUtility.all(req.user.id, status, search, order_by, sort_by, page_number, page_size);

        return res.status(stores.status).json(stores.response);
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

const getStore = async (req, res) => {
    try {
        const store_id_or_store_uuid = req.params.store_id_or_store_uuid;

        const search_by = req.query.search_by||'id';
        req.query.search_by = search_by;
        const validateSearchBy = await validatePayload(req.query, {
            search_by: 'sometimes|enum:id,store_uuid',
        });
        if(!validateSearchBy.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validateSearchBy.errors));
        }

        const storeResponse = await storeUtility.find(req.user.id, store_id_or_store_uuid, search_by);

        return res.status(storeResponse.status).json(storeResponse.response);
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

const createStore = async (req, res) => {
    try {
        const payload = req.body;
        const validate = await validatePayload(payload, {
            store_name: 'required',
            phone: 'required|minLength:10',
            address_line1: 'required',
            address_line2: 'required',
            city: 'required',
            state: 'required',
            zip: 'required',
            country: 'required'
        });
        if(!validate.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validate.errors));
        }

        const storeData = Store.fromJson(payload);

        const store_uuid = getV4UUID();

        const storeResponse = await storeUtility.create(req.user.id, store_uuid, 'manual', storeData);

        return res.status(storeResponse.status).json(storeResponse.response);
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

const updateStore = async (req, res) => {
    try {
        const store_id_or_store_uuid = req.params.store_id_or_store_uuid;
        const payload = req.body;
        const validate = await validatePayload(payload, {
            store_name: 'required',
            phone: 'required|minLength:10',
            address_line1: 'required',
            address_line2: 'required',
            city: 'required',
            state: 'required',
            zip: 'required',
            country: 'required'
        });
        if(!validate.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validate.errors));
        }

        const update_by = req.query.update_by||'id';
        req.query.update_by = update_by;
        const validateUpdateBy = await validatePayload(req.query, {
            update_by: 'sometimes|enum:id,store_uuid',
        });
        if(!validateUpdateBy.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validateUpdateBy.errors));
        }

        const storeData = Store.fromJson(payload);

        const storeResponse = await storeUtility.update(req.user.id, store_id_or_store_uuid, storeData, update_by);

        return res.status(storeResponse.status).json(storeResponse.response);
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

const destroyStore = async (req, res) => {
    try {
        const {store_id_or_store_uuid} = req.params;

        const delete_by = req.query.delete_by||'id';
        req.query.delete_by = delete_by;
        const validateDeleteBy = await validatePayload(req.query, {
            delete_by: 'sometimes|enum:id,store_uuid',
        });
        if(!validateDeleteBy.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validateDeleteBy.errors));
        }

        const storeResponse = await storeUtility.destroy(req.user.id, store_id_or_store_uuid, delete_by);

        return res.status(storeResponse.status).json(storeResponse.response);
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

module.exports = {
    getStores,
    getStore,
    createStore,
    updateStore,
    destroyStore
}