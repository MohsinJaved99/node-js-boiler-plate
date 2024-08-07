const { StatusCodes } = require('../config');
const Response = require('../models/responses');
const storeServices = require('../services/storeServices');
const Store = require('../models/Store');

/**
 * Fetches all stores for a given user and status.
 *
 * @param {number} user_id - The ID of the user.
 * @param {number} status - The status of the stores to fetch.
 * @param {string} [search] - Filter data with like query. (optional).
 * @param {string} [order_by] - Return data order by column (optional).
 * @param {string} [sort_by] - Return data order by sort (ASC,DESC) (optional).
 * @param {number|process.env.ORDER_DEFAULT_PAGE_NUMBER} [page_number] - The page number for pagination (default is process.env.ORDER_DEFAULT_PAGE_NUMBER).
 * @param {number|process.env.ORDER_DEFAULT_PAGE_SIZE} [page_size] - The page size for pagination (default is process.env.ORDER_DEFAULT_PAGE_SIZE).
 * @return {Promise<Object>} - A promise that resolves to an object containing the status and response:
 *   - status {number}: HTTP status code indicating the result of the operation.
 *   - response {Object}: A Response object indicating success or failure and containing the list of services.
 */
const all = (user_id, status, search, order_by, sort_by, page_number, page_size) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!user_id) {
                return resolve({
                    status: StatusCodes.HTTP_403_FORBIDDEN,
                    response: new Response.genericResponse(false, 'Unauthorized.')
                });
            }

            const stores = await storeServices.getStores(user_id, status, search, order_by, sort_by, page_number, page_size);
            const meta_data = {
                page_number: page_number,
                page_size: page_size,
                total_records: stores.total,
                total_pages: Math.ceil(stores.total / page_size)
            }

            return resolve({
                status: StatusCodes.HTTP_200_OK,
                response: new Response.genericResponse(true, 'List of stores', Store.mapStores(stores.data), meta_data)
            });
        }
        catch (err) {
            reject(err)
        }
    });
}

/**
 * Fetches a store by its UUID or ID for a given user.
 *
 * @param {number|string} store_id_or_store_uuid - The ID or UUID of the store, depending on search_by.
 * @param {number} user_id - The ID of the user.
 * @param {string} search_by - Flag to indicate whether to find by ID or UUID.
 * @return {Promise<Object>} - A promise that resolves to an object containing the store details or a not found response.
 */
const find = (user_id, store_id_or_store_uuid, search_by = 'id') => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!user_id) {
                return resolve({
                    status: StatusCodes.HTTP_403_FORBIDDEN,
                    response: new Response.genericResponse(false, 'Unauthorized.')
                });
            }
            const store = await storeServices.getStore(user_id, store_id_or_store_uuid, search_by);
            if(!store) {
                return resolve({
                    status: StatusCodes.HTTP_404_NOT_FOUND,
                    response: new Response.genericResponse(false, `Store do not exist with ${search_by}: ${store_id_or_store_uuid}.`)
                });
            }
            return resolve({
                status: StatusCodes.HTTP_200_OK,
                response: new Response.genericResponse(true, 'Store', Store.mapStores(store)[0])
            });
        }
        catch (err) {
            reject(err)
        }
    });
}

/**
 * Creates a new store for a given user.
 *
 * @param {number} user_id - The ID of the user.
 * @param {string} store_uuid - The UUID of the store.
 * @param {string} store_type - The type of the store.
 * @param {Object} storeData - The data of the store to be created.
 * @return {Promise<Object>} - A promise that resolves to an object containing the creation status and response.
 */
const create = async (user_id, store_uuid, store_type, storeData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!user_id) {
                return resolve({
                    status: StatusCodes.HTTP_403_FORBIDDEN,
                    response: new Response.genericResponse(false, 'Unauthorized.')
                });
            }

            const store = await storeServices.createStore(user_id, store_uuid, store_type, storeData);
            return resolve({
                status: StatusCodes.HTTP_200_OK,
                response: new Response.genericResponse(true, 'Store created successfully.', store)
            });
        }
        catch (err) {
            reject(err)
        }
    });
}

/**
 * Updates a store by its UUID or ID for a given user.
 *
 * @param {number} user_id - The ID of the user.
 * @param {number|string} store_id_or_store_uuid - The ID or UUID of the store, depending of updateByUUID.
 * @param {Object} storeData - The new data for the store.
 * @param {string} updated_by - Flag to indicate whether to update by UUID or ID.
 * @return {Promise<Object>} - A promise that resolves to an object containing the update status and response.
 */
const update = async (user_id, store_id_or_store_uuid, storeData, updated_by) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!user_id) {
                return resolve({
                    status: StatusCodes.HTTP_403_FORBIDDEN,
                    response: new Response.genericResponse(false, 'Unauthorized.')
                });
            }

            const isStoreExist = await storeServices.isStoreExist(store_id_or_store_uuid, user_id, updated_by);
            if (!isStoreExist) {
                return resolve({
                    status: StatusCodes.HTTP_404_NOT_FOUND,
                    response: new Response.genericResponse(false, `Service do not exist with ${updated_by} ${store_id_or_store_uuid}.`)
                });
            }

            const store = await storeServices.updateStore(user_id, store_id_or_store_uuid, storeData, updated_by);
            return resolve({
                status: StatusCodes.HTTP_200_OK,
                response: new Response.genericResponse(true, 'Store updated successfully.', store)
            });
        }
        catch (err) {
            reject(err)
        }
    });
}

/**
 * Deletes a store by its UUID or ID for a given user.
 *
 * @param {number} user_id - The ID of the user.
 * @param {number|string} store_id_or_store_uuid - The ID or UUID of the store, depending of delete_by.
 * @param {string} delete_by - Flag to indicate whether to delete by UUID or ID.
 * @return {Promise<Object>} - A promise that resolves to an object containing the deletion status and response.
 */
const destroy = async (user_id, store_id_or_store_uuid, delete_by) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!user_id) {
                return resolve({
                    status: StatusCodes.HTTP_403_FORBIDDEN,
                    response: new Response.genericResponse(false, 'Unauthorized.')
                });
            }

            const isStoreExist = await storeServices.isStoreExist(store_id_or_store_uuid, user_id, delete_by);
            if (!isStoreExist) {
                return resolve({
                    status: StatusCodes.HTTP_404_NOT_FOUND,
                    response: new Response.genericResponse(false, `Service do not exist with ${delete_by} ${store_id_or_store_uuid}.`)
                });
            }

            const store = await storeServices.deleteStore(user_id, store_id_or_store_uuid, delete_by);
            return resolve({
                status: StatusCodes.HTTP_200_OK,
                response: new Response.genericResponse(true, 'Store deleted successfully.', store)
            });
        }
        catch (err) {
            reject(err)
        }
    });
}

module.exports = {
    all,
    find,
    create,
    update,
    destroy
}