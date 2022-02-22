import * as dotenv from "dotenv";
import { Persistence } from "../../Persistence/Persistence";

import { SQL_Interface } from "../../Persistence/SQL_Interface";
import { payment } from "../../Persistence/Types/payment";
import { paymentEntry } from "../../Persistence/Types/paymentEntry";
import { settledPayment } from "../../Persistence/Types/settledPayment";

class SQL_Mock implements SQL_Interface {    
    insertPaymentEntry(entry: paymentEntry) {return new Promise<void>((resolve) => {resolve})}
    insertSettledPayment(entry: settledPayment) {return new Promise<void>((resolve) => {resolve})}
    updateSettledPayment(id: bigint, status: number) {return new Promise<void>((resolve) => {resolve})}
    
    
    getPaymentByBuyer(buyer: string)  { 
        return new Promise<payment[]>((resolve) => {
            if (buyer == "asdasdasdasdd") return resolve([])

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
            if (seller == "asdasdasdasdd") return resolve([])

            let obj: any  ={
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000,
                status: 2
            }
            resolve([obj])
        })
    };
    getPaymentByID(id: bigint) { 
        return new Promise<payment>((resolve, reject) => {
            if (id == BigInt(0)) {
                let obj: any  ={
                    buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                    seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                    price: 20000000000000000,
                    status: 2
                }
                resolve(obj)
            } else {
                reject("No entry found")
            }
        })
    };
    getPaymentEntryByID(id: bigint) { 
        return new Promise<paymentEntry>((resolve, reject) => {
            if (id == BigInt(0)) {
                let obj: any = {
                    id: id,
                    seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                    price: 20000000000000000
                }
                resolve(obj)
            } else {
                reject("No entry found")
            }
        })
    };
    setLastSyncBlock(block: number) {return new Promise<void>((resolve) => {resolve})}
    getLastSyncBlock() { 
        return new Promise<number>((resolve) => {
            resolve(0);
        })
    };
}

jest.useFakeTimers()
dotenv.config()

describe('Persistence', () => {    
    let persistance = new Persistence(new SQL_Mock());
    
    it('getPaymentByBuyer - Valid', async () => {
        persistance.getPaymentByBuyer("0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1")
        .then((res: any) => {
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
        persistance.getPaymentByBuyer("asdasdasdasdd")
        .then((res: any) => {
            expect(res.length).
            toBe(0)
        })
    })
    
    it('getPaymentBySeller - Valid', async () => {
        persistance.getPaymentBySeller("0x4645895DE6761C3c221Da5f6D75e4393a868B4a0")
        .then((res: any) => {
            let obj: any = {
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000,
                status: 2
            }
            expect(res[0]).
            toMatchObject(obj)
        })
    })
    
    it('getPaymentBySeller - Empty', async () => {
        persistance.getPaymentBySeller("asdasdasdasdd")
        .then((res: any) => {
            expect(res.length).
            toBe(0)
        })
    })
    
    it('getPaymentEntryByID - Valid', async () => {
        persistance.getPaymentEntryByID(BigInt(0))
        .then((res: any) => {
            let obj: any = {
                id: BigInt(0),
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000
            }
            expect(res).
            toMatchObject(obj)
        })
    })
    
    it('getPaymentEntryByID - Invalid', async () => {
        expect.assertions(1);
        
        persistance.getPaymentEntryByID(BigInt(12312312))
        .catch((e: any) => {
            expect(e).toMatch('No entry found')   
        })
    })
    
    it('getPaymentByID - Valid', async () => {
        persistance.getPaymentByID(BigInt(0))
        .then((res: any) => {
            let obj: any = {
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000,
                status: 2
            }
            expect(res).
            toMatchObject(obj)
        })
    })
    
    it('getPaymentByID - Invalid', async () => {
        expect.assertions(1);
        
        persistance.getPaymentByID(BigInt(12312312))
        .catch((e: any) => {
            expect(e).toMatch('No entry found')   
        })
    })
})