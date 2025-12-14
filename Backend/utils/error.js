const createErrorClass = require('create-error-class')

const internals = {
    system: [
        EvalError,
        RangeError,
        ReferenceError,
        SyntaxError,
        TypeError,
        URIError
    ]
}

function isSystemError(err) {
    for (let i = 0; i < internals.system.length; i += 1) {
        if (err instanceof internals.system[i]) {
            return true
        }
    }

    return false
}


const InvalidKeyValue = createErrorClass('InvalidKeyValue', function e(k, v) {
    this.message = `${k} [${v}] invalid`
})

/* Invalid parameter was supplied */
const InvalidRequestError = createErrorClass('InvalidRequestError', function e(
    err
) {
    this.code = err.code || 400
    this.message = err.message || 'Missing or invalid params'
    this.verbosity = err.verbosity
})

const InvalidResponseError = createErrorClass(
    'InvalidResponseError',
    function e() {
        this.message = 'Supplier returned response but missing or invalid data'
    }
)

/* An authentication error occured when requesting API */
const AuthenticationError = createErrorClass('AuthenticationError')



module.exports = {
    InvalidKeyValue,
    InvalidRequestError,
    InvalidResponseError,
    AuthenticationError,
    isSystemError
}
