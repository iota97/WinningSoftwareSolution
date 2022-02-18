import * as dotenv from "dotenv";
import { Persistence } from "../../Persistence/Persistence";

import { SQL_Interface } from "../../Persistence/SQL";
import { payment } from "../../Persistence/Types/payment";
import { paymentEntry } from "../../Persistence/Types/paymentEntry";
import { settledPayment } from "../../Persistence/Types/settledPayment";

jest.useFakeTimers()
dotenv.config()

class SQL_Mock implements SQL_Interface {    
    insertPaymentEntry(entry: paymentEntry) {}
    insertSettledPayment(entry: settledPayment) {}
    
    getPaymentByBuyer(buyer: string)  { 
        return new Promise<payment[]>(() => {
            let obj: any  ={
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000,
                status: 2
            }
            return [obj]
        })
    };
    getPaymentBySeller(seller: string)  { 
        return new Promise<payment[]>(() => {
            let obj: any  ={
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: 20000000000000000,
                status: 2
            }
            return [obj]
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
        return new Promise<bigint>((resolve) => {
            resolve(BigInt(0));
        })
    };
}

import { ShopContract, Web3_Contract_Interface } from "../../Persistence/ShopContract"

import { EventEmitter } from 'events'
import { setTimeout } from 'timers'

export default class Timer extends EventEmitter {
    constructor() {
        super()
    }
    
    public start(): void {
     
        
        setTimeout(() => {
            this.emit('error', { error: "Error" })
        }, 0)
    }
}


class Web3_Contract_Mock implements Web3_Contract_Interface {
    private e1: EventEmitter;
    private e2: EventEmitter;

    constructor() {
        this.e1 = new EventEmitter;
        this.e2 = new EventEmitter;
    }

    public addedPaymentEntry(options: any) {
        setTimeout(() => {
            this.e1.emit('data', { returnValues: {paymentEntryId: 0} })
        }, 500)
        return this.e1
    }
    
    public paymentSettled(options: any) {
        setTimeout(() => {
            this.e2.emit('data', { returnValues: {paymentEntryId: 0} })
        }, 500)
        return this.e2
    }
    
    public getSettledPayment(id: bigint) {
        return new Promise<any>(() => {
            let obj: any  = {
                client: "asdf",
                status: 10,
                paymentEntryId: 10,
            }
            return obj
        })  
    }
    
    public getPaymentEntry(id: bigint) {
        return new Promise<any>(() => {
            let obj: any  = {
                seller: "asdf",
                price: 10,
            }
            return obj
        })
    }
}


describe('ShopContract', () => {      
    it('getPaymentByBuyer - Valid', async () => {
        let shopContract = new ShopContract(new SQL_Mock(), new Web3_Contract_Mock());
        
    })
})



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
        persistance.getPaymentBySeller("asdasdasdasdd")
        .then((res: any) => {
            expect(res.length).
            toBe(0)
        })
    })
    
    it('getPaymentEntryPrice - Valid', async () => {
        persistance.getPaymentEntryPrice(BigInt(0))
        .then((res: any) => {
            expect(res).
            toBe(BigInt(20))
        })
    })
    
    it('getPaymentEntryPrice - Invalid', async () => {
        expect.assertions(1);
        
        persistance.getPaymentEntryPrice(BigInt(12312312))
        .catch((e: any) => {
            expect(e).toMatch('No entry found')   
        })
    })
})