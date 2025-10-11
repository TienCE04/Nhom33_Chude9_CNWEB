const debug = require('debug')('api:middleware')
const jwt = require('jwt-simple')
const moment = require('moment')
const _ = require('lodash')
const uuid = require('uuid/v4')

// Logging configuration
const loggingMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const loggingPathIgnore = [
    '/login',
    '/api-logs-aws',
    '/api-logs-database',
    '/api-logs',
    '/api-logs-loki'
]
// Simple Log class for basic logging
class Log {
    constructor(data) {
        this.data = data
    }
    
    createLog() {
        console.log('Request Log:', JSON.stringify(this.data, null, 2))
    }
}


async function authorize(ctx, next) {
    ctx.User = {
        id: 1,
        name: 'Admin'
    }
    return next()
}

async function log(ctx, next) {
    let error = null
    ctx.request.id = uuid().replace(/-/g, '') // because hyphen sucks
    try {
        await next()
    } catch (err) {
        error = err
        // error handler
        if (err.code === 'ECONNREFUSED') {
            ctx.status = 504
            ctx.body = {
                code: err.code,
                message: err.message
            }
        } else if (err.name === 'ThirdPartyError') {
            ctx.status = 502
            ctx.body = {
                code: 502,
                message: err.message
            }
        } else if (err.name === 'AuthenticationError') {
            ctx.status = 401
            ctx.body = {
                code: 401,
                message: err.message
            }
        } else {
            ctx.status = 400
            const body = {
                code: 400,
                message: err.message,
                verbosity: err.verbosity
            }

            ctx.body = body
        }
    }

    const { _matchedRoute: matchedRoute } = ctx

    if (
        loggingMethod.includes(ctx.method) &&
        !loggingPathIgnore.includes(matchedRoute)
    ) {
        const requestLog = new Log({
            path: ctx.path,
            matched_route: matchedRoute,
            method: ctx.method,
            user: ctx.request.headers['x-key'],
            status: ctx.status,
            request: {
                query: ctx.query,
                // params: ctx.params,
                body: ctx.request.body
            },
            response: error || ctx.body
        })

        requestLog.createLog()
    }
}

module.exports = {
    authorize,
    log
}