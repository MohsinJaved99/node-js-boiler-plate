const {convertAddressByAbbreviation} = require('../../helpers');

/**
 * Validates a payload object against specified validation rules.
 * Generates an array of validation errors or indicates successful validation.
 *
 * @param {Object} payload - The payload object to validate.
 * @param {Object} validations - An object containing validation rules for each payload property.
 * @return {Promise<Object>} - A promise that resolves to an object indicating the success of validation:
 *   - success {boolean}: Indicates whether all validations passed without errors.
 *   - errors {Array|null}: An array of error messages if validation fails, or null if no errors were found.
 * @throws {Error} - Throws a error if the payload is empty.
 *
 * Available validations:
 * - 'required': Ensures the field is present and not empty in the payload.
 * - 'numeric': Ensures the field is a numeric value.
 * - 'minLength:X': Ensures the field's length is at least X characters long.
 * - 'maxLength:X': Ensures the field's length does not exceed X characters.
 * - 'minValue:X': Ensures the field's value is X or greater.
 * - 'maxValue:X': Ensures the field's value is X or less.
 * - 'email': Ensures the field is a valid email address.
 * - 'enum:X,Y,Z': Ensures the field's value is one of the specified enum values (X, Y, Z).
 * - 'isArray': Ensures the field's value must be array.
 * - 'sometimes': Indicates the validation rule should be applied only if the field is present in the payload.
 */
function validatePayload(payload, validations) {
    return new Promise((resolve) => {
        const errors = [];

        if(Object.keys(payload).length === 0) {
            throw new Error("Payload is required")
        }

        for (const key in validations) {
            const rules = validations[key].split('|');
            const isSometimes = rules.includes('sometimes');

            if(payload[key] === undefined) {
                errors.push(`${key} is missing from the payload.`);
                continue;
            }

            for (const rule of rules) {
                const [ruleName, param] = rule.split(':');

                switch (ruleName) {
                    case 'required':
                        if (payload[key] === null || payload[key].toString().trim() === '') {
                            errors.push(`${key} is required.`);
                        }
                        break;
                    case 'numeric':
                        if (isSometimes) {
                            if(payload[key]) {
                                if(isNaN(payload[key])) {
                                    errors.push(`${key} must be numeric.`);
                                }
                            }
                        }
                        else {
                            if(isNaN(payload[key])) {
                                errors.push(`${key} must be numeric.`);
                            }
                        }
                        break;
                    case 'minLength':
                        if (isSometimes) {
                            if(payload[key]) {
                                if (payload[key].length < parseInt(param, 10)) {
                                    errors.push(`${key} must be at least ${param} characters (current length: ${payload[key].length} characters).`);
                                }
                            }
                        }
                        else {
                            if (payload[key] && payload[key].length < parseInt(param, 10)) {
                                errors.push(`${key} must be at least ${param} characters (current length: ${payload[key].length} characters).`);
                            }
                        }
                        break;
                    case 'maxLength':
                        if (isSometimes) {
                            if(payload[key]) {
                                if (payload[key].length > parseInt(param, 10)) {
                                    errors.push(
                                        `${key} must not be more than ${param} characters (current length: ${payload[key].length} characters).${key === 'address_line1' && payload[key] !== convertAddressByAbbreviation(payload[key]) ? ' [Abbreviated Address: ' + convertAddressByAbbreviation(payload[key]) + ']': '' }`
                                    );
                                }
                            }
                        }
                        else {
                            if (payload[key] && payload[key].length > parseInt(param, 10)) {
                                errors.push(`${key} must not be more than ${param} characters (current length: ${payload[key].length} characters).${key === 'address_line1' && payload[key] !== convertAddressByAbbreviation(payload[key]) ? ' [Abbreviated Address: ' + convertAddressByAbbreviation(payload[key]) + ']' : '' }`);
                            }
                        }
                        break;
                    case 'minValue':
                        if (isSometimes) {
                            if(payload[key] && !isNaN(payload[key])) {
                                if (parseFloat(payload[key]) < parseFloat(param)) {
                                    errors.push(`${key} must be ${param} or greater.`);
                                }
                            }
                        }
                        else {
                            if(payload[key] && !isNaN(payload[key])) {
                                if (parseFloat(payload[key]) < parseFloat(param)) {
                                    errors.push(`${key} must be ${param} or greater.`);
                                }
                            }
                        }
                        break;
                    case 'maxValue':
                        if (isSometimes) {
                            if(payload[key]) {
                                if (parseFloat(payload[key]) > parseFloat(param)) {
                                    errors.push(`${key} must be ${param} or less.`);
                                }
                            }
                        }
                        else {
                            if (payload[key] && parseFloat(payload[key]) > parseFloat(param)) {
                                errors.push(`${key} must be ${param} or less.`);
                            }
                        }
                        break;
                    case 'email':
                        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (isSometimes) {
                            if(payload[key]) {
                                if (!emailPattern.test(payload[key])) {
                                    errors.push(`${key} must be a valid email address.`);
                                }
                            }
                        }
                        else {
                            if (payload[key] && !emailPattern.test(payload[key])) {
                                errors.push(`${key} must be a valid email address.`);
                            }
                        }
                        break;
                    case 'enum':
                        if (isSometimes) {
                            if(payload[key]) {
                                if (!param.includes(payload[key])) {
                                    errors.push(`${key} must be one of (${param}).`);
                                }
                            }
                        }
                        else {
                            if (payload[key] && !param.includes(payload[key])) {
                                errors.push(`${key} must be one of (${param}).`);
                            }
                        }
                        break;
                    case 'isArray':
                        if (isSometimes) {
                            if(payload[key]) {
                                if (!Array.isArray(payload[key])) {
                                    errors.push(`${key} must be an array.`);
                                }
                            }
                        }
                        else {
                            if (payload[key] && !Array.isArray(payload[key])) {
                                errors.push(`${key} must be an array.`);
                            }
                        }
                        break;
                    default:
                        // No default action needed
                        break;
                }
            }
        }

        resolve({
            success: errors.length <= 0,
            errors: errors.length > 0 ? errors : null
        })
    });
}

module.exports = {
    validatePayload
}
