import request from 'supertest'
import {Express} from 'express-serve-static-core'

import {createWebServer} from '../routes/index'

describe('Server', function () {
  let server : Express
  beforeEach(function () {
    server = createWebServer();
  });

  it('Connect to /', function testSlash(done) {
  request(server)
    .get('/')
    .expect(200, done)
  });
});