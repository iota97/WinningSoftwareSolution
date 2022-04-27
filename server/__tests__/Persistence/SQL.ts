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
    DELETE FROM PaymentEntries WHERE id=13;`
)
db.query(`
    DELETE FROM SettledPayments WHERE id=12;`
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
    
    it('getPaymentByBuyer - Empty', async () => {
        return sql.getPaymentByBuyer("asdasdasdasdd")
        .then(async (res: any) => {
            expect(res.length).
            toBe(0)
        })
    })
     
    it('getPaymentBySeller - Empty', async () => {
        return sql.getPaymentBySeller("asdasdasdasdd")
        .then(async (res: any) => {
            expect(res.length).
            toBe(0)
        })
    })
    
    it('setLastSyncBlock - Less', async () => {
        return sql.setLastSyncBlock(0)
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
            id: BigInt(13),
            seller: "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0",
            price: BigInt(20000000000000000) // Dollar cents
        }) 
    })
    
    it('insertSettledPayment - Dummy', async () => {
        return sql.insertSettledPayment({
            id: BigInt(12),
            paymentEntryId: BigInt(13),
            client: "0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1",
            status: 1,
            time: BigInt(123),
            finalizedTime: BigInt(0),
        })
    })

    it('getPaymentBySeller - Valid', async () => {
        return sql.getPaymentBySeller("0x4645895DE6761C3c221Da5f6D75e4393a868B4a0")
        .then(async (res: any) => {
            let obj: any  ={
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: BigInt(20000000000000000),
                status: 1
            }
            expect(res[0]).
            toMatchObject(obj)
        })
    })

    it('getPaymentByID - Valid', async () => {
        return sql.getPaymentByID(BigInt(12))
        .then(async (res: any) => {
            let obj: any = {
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: BigInt(20000000000000000),
                status: 1
            }
            expect(res).
            toMatchObject(obj)
        })
    })

    it('getPaymentEntryByID - Valid', async () => {
        return sql.getPaymentEntryByID(BigInt(13))
        .then(async (res: any) => {
            let obj: any = {
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: BigInt(20000000000000000),
            }
            expect(res).
            toMatchObject(obj)
        })
    })

    it('getPaymentEntryByID - Empty', async () => {
        return sql.getPaymentEntryByID(BigInt(6662321))
        .catch((e: any) => {
            expect(e).toMatch('No entry found')   
        })
    })


    it('getPaymentByID - Empty', async () => {
        return sql.getPaymentByID(BigInt(6662321))
        .catch((e: any) => {
            expect(e).toMatch('No entry found')   
        })
    })

    it('getPaymentByBuyer - Valid', async () => {
        return sql.getPaymentByBuyer("0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1")
        .then(async (res: any) => {
            let obj: any  ={
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: BigInt(20000000000000000),
                status: 1
            }
            expect(res[0]).
            toMatchObject(obj)
        })
    })

    it('updateSettledPayment - Dummy', async () => {
        return sql.updateSettledPayment(BigInt(12312321), 0, BigInt(12345))
    })
    
    it('closeConnection - Close', async () => {
        db.end()
        sql.closeConnection()
        await delay(500)
    })    
    
    it('setLastSyncBlock - Closed', async () => {
        return sql.setLastSyncBlock(0)
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

    it('getPaymentByID - Closed', async () => {
        return sql.getPaymentByID(BigInt(1))
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })

    it('getPaymentEntryByID - Closed', async () => {
        return sql.getPaymentEntryByID(BigInt(1))
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
    
    it('insertPaymentEntry - Closed', async () => {
        return sql.insertPaymentEntry({
            id: BigInt(12312319),
            seller: "asdf",
            price: BigInt(9123123123) // Dollar cents
        })
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })

    it('updateSettledPayment - Closed', async () => {
        return sql.updateSettledPayment(BigInt(12312321), 0, BigInt(1234))
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
    
    it('insertSettledPayment - Closed', async () => {
        return sql.insertSettledPayment({
            id: BigInt(12312321),
            paymentEntryId: BigInt(12312321),
            client: "asdf",
            status: 0,
            time: BigInt(123),
            finalizedTime: BigInt(12),
        })
        .catch(async (e: any) => {
            expect(e[0] == "E") 
        })    
    })
}) 