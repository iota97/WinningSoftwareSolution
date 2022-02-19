import * as dotenv from "dotenv";

import { SQL_Interface } from "../../Persistence/SQL";
import { payment } from "../../Persistence/Types/payment";
import { paymentEntry } from "../../Persistence/Types/paymentEntry";
import { settledPayment } from "../../Persistence/Types/settledPayment";
import { Server } from "../../Server/Server"
import { setTimeout } from 'timers'
import { Persistence } from "../../Persistence/Persistence";
import { resolve } from "path/posix";

dotenv.config()

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

class SQL_Mock implements SQL_Interface {    
    insertPaymentEntry(entry: paymentEntry) {}
    insertSettledPayment(entry: settledPayment) {}
    updateSettledPayment(id: bigint, status: number) {}
    
    getPaymentByBuyer(buyer: string)  { 
        return new Promise<payment[]>((resolve) => {
            let obj: any  ={
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000,
                status: 2
            }
            resolve([obj])
        })
    };
    getPaymentBySeller(seller: string)  { 
        return new Promise<payment[]>((resolve) => {
            let obj: any  ={
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000,
                status: 2
            }
            resolve(obj)
        })
    };
    getPaymentEntryPrice(id: bigint) { 
        return new Promise<bigint>((resolve, reject) => {
            if (id == BigInt(0)) {
                resolve(BigInt(20))
            } else {
                reject("No entry found")
            }
        })
    };
    setLastSyncBlock(block: bigint) {}
    getLastSyncBlock() { 
        return new Promise<number>((resolve) => {
            resolve(0);
        })
    };
}

describe('Server', () => { 
    const original = console.log
    beforeEach(() => {
        console.log = jest.fn
    })
    
    afterEach(() => {
        console.log = original
    })

    const server = new Server(new Persistence(new SQL_Mock()));
    it('Sever - QR', async () => {
        const req = { query: {id: 0} },
        res = { render: jest.fn() }
        server.QRPage(req, res)

        await delay(500)
        expect(res.render.mock.calls[0][0]).toBe("QR")
    })

    it('Sever - paymentByBuyerPage', async () => {
        const req = {},
        res = { render: jest.fn() }
        server.paymentByBuyerPage(req, res, new Persistence(new SQL_Mock()))

        await delay(500)
        expect(res.render.mock.calls[0][0]).toBe("transazioni")
    })
    
    it('Server - Listen', async () => {
        server.listen()  
        await delay(500)      
    })
    
    it('Server - Close', async () => {
        server.close()        
    })
})