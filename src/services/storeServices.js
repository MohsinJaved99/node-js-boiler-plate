const { executeQuery, executeQueryAndGetFirst } = require('../helpers/executableQueries');
const {InsertPlaceholders, UpdatePlaceholder} = require('../helpers/servicesHelper');
const {convertFormattedDateToTimestamp} = require('../helpers');
const Store = require('../models/Store');

/**
 * Retrieves stores owned by a user optionally filtered by status.
 *
 * @param {number} user_id - The ID of the user whose stores are to be retrieved.
 * @param {number|null} status - Optional. Filters stores by status (active or inactive).
 * @param {string} [search] - Filter data with like query. (optional).
 * @param {string} [order_by] - Return data order by column (optional).
 * @param {string} [sort_by] - Return data order by sort (ASC,DESC) (optional).
 * @param {number|process.env.ORDER_DEFAULT_PAGE_NUMBER} [page_number] - The page number for pagination (default is process.env.ORDER_DEFAULT_PAGE_NUMBER).
 * @param {number|process.env.ORDER_DEFAULT_PAGE_SIZE} [page_size] - The page size for pagination (default is process.env.ORDER_DEFAULT_PAGE_SIZE).
 * @returns {Promise<{total: *, data: Array<Object>}>} - A promise that resolves with an array of stores that match the criteria, otherwise rejects with an error.
 */
const getStores = async (user_id, status, search, order_by, sort_by, page_number, page_size) => {
    try {
        const values = [];
        const columns = Store.getColumns();
        let query = `SELECT ${columns} FROM stores WHERE user_id = ?`;
        let totalCountQuery = `SELECT COUNT(id) as count FROM stores WHERE user_id = ?`;

        values.push(user_id);

        if(Number.isInteger(status)) {
            query += ` AND status = ?`;
            totalCountQuery += ` AND status = ?`;
            values.push(status);
        }

        if(search) {
            // carrier_name
            query += ` AND (store_name LIKE ?`;
            totalCountQuery += ` AND (store_name LIKE ?`;
            values.push(`%${search}%`);

            // search record by timestamps
            if(convertFormattedDateToTimestamp(search)) {
                // created_at
                query += ` OR created_at LIKE ?`;
                totalCountQuery += ` OR created_at LIKE ?`;
                values.push(`%${convertFormattedDateToTimestamp(search)}%`);

                // updated_at
                query += ` OR updated_at LIKE ?`;
                totalCountQuery += ` OR updated_at LIKE ?`;
                values.push(`%${convertFormattedDateToTimestamp(search)}%`);
            }

            // store_uuid
            query += ` OR store_uuid LIKE ?`;
            totalCountQuery += ` OR store_uuid LIKE ?`;
            values.push(`%${search}%`);

            // store_type
            query += ` OR store_type LIKE ?)`;
            totalCountQuery += ` OR store_type LIKE ?)`;
            values.push(`%${search}%`);
        }

        query += ` ORDER BY ${order_by} ${sort_by}`;

        // Add pagination
        if (page_size) {
            query += ` LIMIT ?`;
            values.push(page_size);
        }

        if (page_number) {
            query += ` OFFSET ?`;
            values.push((page_number * page_size) - page_size);
        }

        const resultTotalOrderCount = await executeQueryAndGetFirst(totalCountQuery, values.length > 3 ? values.slice(0, -2): values);
        const result = await executeQuery(query, values);

        return ({data: result, total: resultTotalOrderCount.count});
    }
    catch (e) {
        throw e;
    }
}

/**
 * Retrieves a specific store owned by a user.
 *
 * @param {number|string} store_id_or_store_uuid - The ID or UUID of the store to retrieve.
 * @param {number} user_id - The ID of the user who owns the store.
 * @param {string} search_by - Optional. Indicate if store searches by ID or UUID.
 * @returns {Promise<Object>} - A promise that resolves with the store object if found, otherwise rejects with an error.
 */
const getStore = async (user_id, store_id_or_store_uuid, search_by = 'id') => {
    try {
        const columns = Store.getColumns();
        let query = `SELECT ${columns} FROM stores WHERE user_id = ?`;

        if(search_by === 'id') {
            query += ` AND id = ?`;
        }
        else {
            query += ` AND store_uuid = ?`;
        }

        const values = [user_id, store_id_or_store_uuid];
        return await executeQuery(query, values);
    }
    catch (e) {
        throw e;
    }
}

/**
 * Creates a new store for a user.
 *
 * @param {number} user_id - The ID of the user who owns the store.
 * @param {string} store_uuid - The UUID of the store.
 * @param {string} store_type - The type of the store.
 * @param {Object} storeData - The data object containing store details.
 * @returns {Promise<Object>} - A promise that resolves with the created store object, otherwise rejects with an error.
 */
const createStore = async (user_id, store_uuid, store_type, storeData) => {
    try {
        const store = Store.fromJson(storeData);
        const columns = 'user_id, store_uuid, store_name, store_type, phone, address_line1, address_line2, city, state, zip, country';
        const placeholders = InsertPlaceholders(columns);
        const query = `INSERT INTO stores(${columns}) VALUES (${placeholders})`;
        const values = [
            user_id,
            store_uuid,
            store.store_name,
            store_type,
            store.phone,
            store.address_line1,
            store.address_line2,
            store.city,
            store.state,
            store.zip,
            store.country
        ];

        return await executeQuery(query, values);
    }
    catch (e) {
        throw e;
    }
}

/**
 * Checks if an id or UUID exists in the store table depend on findByUUID.
 *
 * @param {number|string} store_id_or_store_uuid - The id or UUID to check.
 * @param {number} user_id - The id of the user.
 * @param {string} search_by - Optional. Indicate if the store searches by ID or UUID.
 * @param {number|NULL} status - The status to service.
 * @returns {Promise<boolean>} - A promise that resolves with true if the id exists, otherwise false.
 */
const isStoreExist = async (store_id_or_store_uuid, user_id, search_by = 'id', status = null) => {
    try {
        let query = `SELECT count(id) as count FROM stores WHERE user_id = ?`;
        const values = [user_id, store_id_or_store_uuid];

        if(search_by === 'id') {
            query += ` AND id = ?`;
        }
        else {
            query += ` AND store_uuid = ?`;
        }

        if(status !== null) {
            query += ` AND status = ?`;
            values.push(status);
        }

        const result = await executeQueryAndGetFirst(query, values);
        return result.count !== 0;
    }
    catch (e) {
        throw e;
    }
}

/**
 * Updates an existing store owned by a user.
 *
 * @param {number} user_id - The ID of the user who owns the store.
 * @param {number|string} store_id_or_store_uuid - The ID or UUID of the store to update.
 * @param {Object} storeData - The data object containing updated store details.
 * @param {string} update_by - Optional. Indicate if store updates by ID or UUID.
 * @returns {Promise<Object>} - A promise that resolves with the updated store object, otherwise rejects with an error.
 */
const updateStore = async (user_id, store_id_or_store_uuid, storeData, update_by= 'id') => {
    try {
        const store = Store.fromJson(storeData);
        const columns = UpdatePlaceholder('store_name, phone, address_line1, address_line2, city, state, zip, country, updated_by');
        let query = `UPDATE stores SET ${columns} WHERE user_id = ?`;

        if(update_by === 'id') {
            query += ` AND id = ?`;
        }
        else {
            query += ` AND store_uuid = ?`;
        }

        const values = [
            store.store_name,
            store.phone,
            store.address_line1,
            store.address_line2,
            store.city,
            store.state,
            store.zip,
            store.country,
            user_id, // updated by
            user_id,
            store_id_or_store_uuid
        ];

        return await executeQuery(query, values)
    }
    catch (e) {
        throw e;
    }
}

/**
 * Deletes (sets inactive) an existing store owned by a user.
 *
 * @param {number} user_id - The ID of the user who owns the store.
 * @param {number|string} store_id_or_store_uuid - The ID or UUID of the store to delete.
 * @param {string} delete_by - Optional. Indicate if store deletes by ID or UUID.
 * @returns {Promise<Object>} - A promise that resolves with the result of the delete operation, otherwise rejects with an error.
 */
const deleteStore = async (user_id, store_id_or_store_uuid, delete_by = 'id') => {
    try {
        const columns = 'status = ?';
        let query = `UPDATE stores SET ${columns} WHERE user_id = ?`;

        if(delete_by === 'id') {
            query += ` AND id = ?`;
        }
        else {
            query += ` AND store_uuid = ?`;
        }

        const values = [
            Store.getStatus('inactive'), //inactive status
            user_id,
            store_id_or_store_uuid
        ];

        return await executeQuery(query, values);
    }
    catch (e) {
        throw e;
    }
}

module.exports = {
    getStores,
    getStore,
    createStore,
    isStoreExist,
    updateStore,
    deleteStore
}