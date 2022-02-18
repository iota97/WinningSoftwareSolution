import request from 'supertest'
import {paymentEntry} from "../DB/types/paymentEntry";
import {settledPayment} from "../DB/types/settledPayment";
import * as paymentEntryModel from "../DB/paymentEntries";
import * as settledPaymentModel from "../DB/settledPayments";
import {createWebServer} from '../routes/index'
import {initDB} from "../DB/initDB";



initDB();

describe('Server', function () {
  const server = createWebServer();
  
  it('Connect to server', function testSlash(done) {
    request(server)
    .get('/')
    .expect(200, done)
  });
  
  it('QR', function testSlash(done) {
    request(server)
    .get('/qr?id=0')
    .expect(200, done)
  });
  
  it('Transazioni', function testSlash(done) {
    request(server)
    .get('/transazioni')
    .expect(200, done)
  });
  
  it('Transazione', function testSlash(done) {
    request(server)
    .get('/transazione?id=0')
    .expect(200, done)
  });
  
  it('Transazione', function testSlash(done) {
    request(server)
    .get('/items')
    .expect(200, done)
  });
});

describe('DB', function () {
  it('Duplicate key on paymentEntry', function testSlash(done) {
    const pagamento: paymentEntry =  {
      id: "0",
      ecommerce: "asdf",
    }
    paymentEntryModel.create(pagamento, (res: any) => {
      expect(res == "Error: Duplicate entry '0' for key 'PRIMARY'")
      done()
    });
  });
  
  it('Duplicate key on settledPayment', function testSlash(done) {
    const pagamento: settledPayment =  {
      id: "0",
      acquirente: "asdf",
    }
    settledPaymentModel.create(pagamento, (res: any) => {
      expect(res == "Error: Duplicate entry '0' for key 'PRIMARY'")
      done()
    });
  });
});