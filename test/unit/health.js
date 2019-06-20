'use strict'

const Test = require('tape')
const Hapi = require('@hapi/hapi')
const HapiOpenAPI = require('hapi-openapi')
const Path = require('path')
const Mockgen = require('../../data/mockgen.js')

/**
 * Test for /health
 */
Test('/health', function (t) {

  /**
     * summary: Get Server
     * description: The HTTP request GET /health is used to return the current status of the API.
     * parameters:
     * produces: application/json
     * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
     */
  t.test('test HealthGet get operation', async function (t) {

    const server = new Hapi.Server()

    await server.register({
      plugin: HapiOpenAPI,
      options: {
        api: Path.resolve(__dirname, '../config/swagger.json'),
        handlers: Path.join(__dirname, '../handlers'),
        outputvalidation: true
      }
    })

    const requests = new Promise((resolve, reject) => {
      Mockgen().requests({
        path: '/health',
        operation: 'get'
      }, function (error, mock) {
        return error ? reject(error) : resolve(mock)
      })
    })

    const mock = await requests

    t.ok(mock)
    t.ok(mock.request)
    //Get the resolved path from mock request
    //Mock request Path templates({}) are resolved using path parameters
    const options = {
      method: 'get',
      url: '' + mock.request.path
    }
    if (mock.request.body) {
      //Send the request body
      options.payload = mock.request.body
    } else if (mock.request.formData) {
      //Send the request form data
      options.payload = mock.request.formData
      //Set the Content-Type as application/x-www-form-urlencoded
      options.headers = options.headers || {}
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
    // If headers are present, set the headers.
    if (mock.request.headers && mock.request.headers.length > 0) {
      options.headers = mock.request.headers
    }

    const response = await server.inject(options)

    t.equal(response.statusCode, 200, 'Ok response status')
    t.end()

  })

})
