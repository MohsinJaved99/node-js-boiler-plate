const userServices = require('../services/userServices');

class Store {
    //Available statuses of stores
    static #statuses = [{'active': 1}, {'inactive': 0}];

    static #columns = `stores.*`;

    static #order_by_columns = ['id','store_name', 'store_type','last_sync_at','created_at','updated_at'];

    static #default_order_by_column = 'created_at';

    static fromJson(json) {
        const store = new Store();
        store.id = json.id;
        store.user_id = json.user_id;
        store.store_uuid = json.store_uuid;
        store.store_name = json.store_name;
        store.store_type = json.store_type;
        store.phone = json.phone;
        store.address_line1 = json.address_line1;
        store.address_line2 = json.address_line2;
        store.city = json.city;
        store.state = json.state;
        store.zip = json.zip;
        store.country = json.country;
        store.connection = json.connection;
        store.validate_address = json.validate_address;
        store.import_conditions = json.import_conditions;
        store.fetch_from_days = json.fetch_from_days;
        store.updated_by = json.updated_by;
        store.status = json.status;
        store.created_at = json.created_at;
        store.updated_at = json.updated_at;
        return store;
    }

    /**
     * Method to return a user object by user_id.
     *
     * This method fetches and returns a user object from the user services by the given user_id.
     *
     * @param {number|string} user_id - The ID of the user to retrieve.
     * @return {Promise<Object>} - A promise that resolves to a user object.
     */
    static async getUserById(user_id) {
        return userServices.getUserByID(user_id);
    }

    /**
     * Method to return status by status key.
     *
     * This method looks up a status key in the private static `#statuses` array.
     * The `#statuses` array contains objects with key-value pairs representing status names and their corresponding values:
     * - `active`: 1
     * - `inactive`: 0
     *
     * @param {string} status - The status key to lookup.
     * @return {number|boolean|null} - Returns the status number if found, false if not found, and null if the status key is undefined.
     */
    static getStatus(status) {
        if(status === undefined) return null;
        const foundStatus = this.#statuses.find(el => el.hasOwnProperty(status));
        // If foundStatus is not undefined, return its value; otherwise, return false
        return foundStatus ? foundStatus[status] : false;
    }

    /**
     * Method to check if a status is valid.
     *
     * This method checks if a given status value exists in the private static `#statuses` array.
     *
     * @param {number} status - The status value to check.
     * @return {boolean} - Returns true if the status is found in the `#statuses` array, otherwise false.
     */
    static isValidStatus(status) {
        return this.#statuses.some(el => Object.values(el).includes(status));
    }

    /**
     * Method to return status by status key.
     *
     * This method looks up a status key in the private static `#statuses` array.
     * The `#statuses` array contains objects with key-value pairs representing status names and their corresponding values:
     *
     * @param {number} orderStatus - The status value to lookup.
     * @return {string|null} - Returns the status number if found and null if not found.
     */
    static getStatusKey(orderStatus) {
        for (let status of Store.#statuses) {
            let key = Object.keys(status)[0];
            if (status[key] === orderStatus) {
                return key;
            }
        }
        return null;
    }

    /**
     * This method return the columns of order table to be retrieved.
     *
     * @return {string} - Returns columns string.
     */
    static getColumns() {
        return this.#columns;
    }

    /**
     * This method return the valid column name for order_by.
     *
     * @return {string[]} - Returns order_by_columns string.
     */
    static getOrderByColumns() {
        return this.#order_by_columns;
    }

    /**
     * This method return default column name for order_by.
     *
     * @return {string} - Returns order_by_columns string.
     */
    static getDefaultOrderByColumn() {
        return this.#default_order_by_column;
    }

    static mapStores(stores) {
        try {
            return stores.map((store) => ({
                id: store.id,
                store_uuid: store.store_uuid,
                store_name: store.store_name,
                store_type: store.store_type,
                store_address: {
                    phone: store.phone,
                    address_line1: store.address_line1,
                    address_line2: store.address_line2,
                    city: store.city,
                    state: store.state,
                    zip: store.zip,
                    country: store.country
                },
                connection: store.connections ? JSON.parse(store.connections) : null,
                validate_address: store.validate_address === 1,
                import_conditions: store.import_conditions ? JSON.parse(store.import_conditions) : null,
                fetch_from_days: store.fetch_from_days,
                last_sync_at: store.last_sync_at,
                status: Store.getStatusKey(store.status),
                updated_by: store.updated_by,
                created_at: store.created_at,
                updated_at: store.updated_at,
            }));
        }
        catch (e) {
            throw e;
        }
    }
}

module.exports = Store;