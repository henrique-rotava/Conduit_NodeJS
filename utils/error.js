class APIError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

module.exports.APIError = APIError;
