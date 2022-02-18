import * as dotenv from "dotenv";

import { SQL } from "../../Persistence/SQL"
import mysql from "mysql2";

import { setTimeout } from 'timers'

dotenv.config()


process.env.DB_NAME = "OnlineStoreTest"

let db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
})

db.query(`
    DELETE FROM PaymentEntries WHERE id=12312319;`
)
db.query(`
    DELETE FROM SettledPayments WHERE id=12312321;`
)

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
describe('SQL', function () {
    const original = console.log
    beforeEach(() => {
        console.log = jest.fn
    })
    
    afterEach(() => {
        console.log = original
    })
    
    let sql = new SQL()
    
    it('getPaymentByBuyer - Valid', async () => {
        return sql.getPaymentByBuyer("0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1")
        .then(async (res: any) => {
            let obj: any  ={
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000,
                status: 2
            }
            expect(res[0]).
            toMatchObject(obj)
        })
    })
    
    it('getPaymentByBuyer - Empty', async () => {
        return sql.getPaymentByBuyer("asdasdasdasdd")
        .then(async (res: any) => {
            expect(res.length).
            toBe(0)
        })
    })
    
    it('getPaymentBySeller - Valid', async () => {
        return sql.getPaymentBySeller("0x4645895DE6761C3c221Da5f6D75e4393a868B4a0")
        .then(async (res: any) => {
            let obj: any = {
                buyer: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000,
                status: 1
            }
            expect(res[0]).
            toMatchObject(obj)
        })
    })
    
    it('getPaymentBySeller - Empty', async () => {
        return sql.getPaymentBySeller("asdasdasdasdd")
        .then(async (res: any) => {
            expect(res.length).
            toBe(0)
        })
    })
    
    it('getPaymentEntryPrice - Valid', async () => {
        return sql.getPaymentEntryPrice(BigInt(0))
        .then(async (res: any) => {
            expect(res).
            toBe(20000000000000000)
        })
    })
    
    it('getPaymentEntryPrice - Invalid', async () => {
        expect.assertions(1);
        
        return sql.getPaymentEntryPrice(BigInt(12312312))
        .catch(async (e: any) => {
            expect(e).toMatch('No entry found') 
        })
    })
    
    it('setLastSyncBlock - Less', async () => {
        return sql.setLastSyncBlock(BigInt(0))
        .then()
    })
    
    it('getLastSyncBlock - get last', async () => {
        return sql.getLastSyncBlock()
        .then(async (res: any) => {
            expect(res >= 24990800)
        })
    })
    
    it('insertPaymentEntry - Dummy', async () => {
        return sql.insertPaymentEntry({
            id: BigInt(12312319),
            ecommerce: "asdf",
            price: BigInt(9123123123) // Dollar cents
        }) 
    })
    
    it('insertSettledPayment - Dummy', async () => {
        return sql.insertSettledPayment({
            id: BigInt(12312321),
            item_id: BigInt(12312321),
            buyer: "asdf",
            status: 0
        })
    })
    
    it('closeConnection - Close', async () => {
        db.end()
        sql.closeConnection()
        await delay(500)
    })    
    
    it('setLastSyncBlock - Closed', async () => {
        return sql.setLastSyncBlock(BigInt(0))
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
    
    it('getLastSyncBlock - Closed', async () => {
        return sql.getLastSyncBlock()
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
    
    it('getPaymentEntryPrice - Closed', async () => {
        return sql.getPaymentEntryPrice(BigInt(9))
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
    
    it('getPaymentBySeller - Closed', async () => {
        return sql.getPaymentBySeller("asd")
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
    
    it('getPaymentByBuyer - Closed', async () => {
        return sql.getPaymentByBuyer("asd")
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
    
    it('insertPaymentEntry - Closed', async () => {
        return sql.insertPaymentEntry({
            id: BigInt(12312319),
            ecommerce: "asdf",
            price: BigInt(9123123123) // Dollar cents
        })
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
    
    it('insertSettledPayment - Closed', async () => {
        return sql.insertSettledPayment({
            id: BigInt(12312321),
            item_id: BigInt(12312321),
            buyer: "asdf",
            status: 0
        })
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
}) 