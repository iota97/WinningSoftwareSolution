import request from 'supertest'
import {Express} from 'express-serve-static-core'

import {createServer} from '../routes/index'

describe('Server', function () {
  let server : Express
  beforeEach(function () {
    server = createServer();
  });

  it('Connect to /', function testSlash(done) {
  request(server)
    .get('/')
    .expect(200, done)
  });
});