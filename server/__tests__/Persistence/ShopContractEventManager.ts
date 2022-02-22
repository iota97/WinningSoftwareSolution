import * as dotenv from "dotenv";

import { ShopContractEventManager } from "../../Persistence/ShopContractEventManager"

import { EventEmitter } from 'events'
import { setTimeout } from 'timers'
import { ShopContract_Interface } from "../../Persistence/ShopContract_Interface";

import { SQL_Interface } from "../../Persistence/SQL_Interface";
import { payment } from "../../Persistence/Types/payment";
import { paymentEntry } from "../../Persistence/Types/paymentEntry";
import { settledPayment } from "../../Persistence/Types/settledPayment";

class SQL_Mock implements SQL_Interface {    
    insertPaymentEntry(entry: paymentEntry) { return new Promise<void>((resolve) => {resolve}) }
    insertSettledPayment(entry: settledPayment) { return new Promise<void>((resolve) => {resolve}) }
    updateSettledPayment(id: bigint, status: number) { return new Promise<void>((resolve) => {resolve}) }
    
    
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
    setLastSyncBlock(block: number) { return new Promise<void>((resolve) => {resolve}) }
    getLastSyncBlock() { 
        return new Promise<number>((resolve) => {
            resolve(0);
        })
    };
}

jest.useFakeTimers()
dotenv.config()

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}


class Web3_Contract_Mock1 implements ShopContract_Interface {
    private e1: EventEmitter;
    private e2: EventEmitter;
    private e3: EventEmitter;
    
    constructor() {
        this.e1 = new EventEmitter;
        this.e2 = new EventEmitter;
        this.e3 = new EventEmitter;
    }
    
    public getBlockTime(block: number) {
        return new Promise<string>((resolve) => {
            resolve("123")
        })
    }    
    
    public addedPaymentEntry(options: any) {
        setTimeout(() => {
            this.e1.emit('data', { returnValues: {paymentEntryId: 10} })
        }, 50)
        setTimeout(() => {
            this.e1.emit('error', "Fake Error")
        }, 150)
        return this.e1
    }
    
    public paymentSettled(options: any) {
        setTimeout(() => {
            this.e2.emit('data', { returnValues: {paymentEntryId: 11} })
        }, 50)
        setTimeout(() => {
            this.e2.emit('error', "Fake Error")
        }, 150)
        return this.e2
    }
    
    public statusChange(options: any) {
        setTimeout(() => {
            this.e3.emit('data', { returnValues: {paymentEntryId: 11} })
        }, 50)
        setTimeout(() => {
            this.e3.emit('error', "Fake Error")
        }, 150)
        return this.e3
    }
    
    
    public getSettledPayment(id: bigint) {
        return new Promise<any>((resolve)  => {
            let obj: any  = {
                client: "asdf",
                status: 10,
                paymentEntryId: 10,
            }
            resolve(obj)
        })  
    }
    
    public getPaymentEntry(id: bigint) {
        return new Promise<any>((resolve)  => {
            let obj: any  = {
                seller: "asdf",
                price: 10,
            }
            resolve(obj)
        })
    }
}

class Web3_Contract_Mock2 implements ShopContract_Interface {
    
    public getBlockTime(block: number) {
        return new Promise<string>((resolve) => {
            resolve("123")
        })
    } 
    
    public addedPaymentEntry(options: any): EventEmitter {
        throw "error"
    }
    
    public paymentSettled(options: any): EventEmitter {
        throw "error"
    }
    
    public statusChange(options: any): EventEmitter {
        throw "error"
    }
    
    public getSettledPayment(id: bigint): Promise<settledPayment> {
        throw "error"
        
    }
    
    public getPaymentEntry(id: bigint): Promise<paymentEntry> {
        throw "error"
    }
}

class Web3_Contract_Mock3 implements ShopContract_Interface {
    private e1: EventEmitter;
    private e2: EventEmitter;
    private e3: EventEmitter;
    
    
    constructor() {
        this.e1 = new EventEmitter;
        this.e2 = new EventEmitter;
        this.e3 = new EventEmitter;
    }
    
    public getBlockTime(block: number) {
        return new Promise<string>((resolve) => {
            resolve("123")
        })
    } 
    
    public addedPaymentEntry(options: any) {
        setTimeout(() => {
            this.e1.emit('data', { returnValues: {paymentEntryId: 10} })
        }, 50)
        setTimeout(() => {
            this.e1.emit('error', "Fake Error")
        }, 150)
        return this.e1
    }
    
    public paymentSettled(options: any) {
        setTimeout(() => {
            this.e2.emit('data', { returnValues: {paymentEntryId: 11} })
        }, 50)
        setTimeout(() => {
            this.e2.emit('error', "Fake Error")
        }, 150)
        return this.e2
    }
    
    public statusChange(options: any) {
        setTimeout(() => {
            this.e3.emit('data', { returnValues: {paymentEntryId: 11} })
        }, 50)
        setTimeout(() => {
            this.e3.emit('error', "Fake Error")
        }, 150)
        return this.e3
    }
    
    public getSettledPayment(id: bigint) {
        return new Promise<any>(()  => {
            let obj: any  = {
                client: "asdf",
                status: 10,
                paymentEntryId: 10,
            }
            throw "error";
        })  
    }
    
    public getPaymentEntry(id: bigint) {
        return new Promise<any>(()  => {
            let obj: any  = {
                seller: "asdf",
                price: 10,
            }
            throw "error";
        })
    }
}

class ErrorCounter {
    static acc = 0;
    static log(msg: string) {
        this.acc++
    }
}

describe('ShopContractEventManager', () => {  
    const original = console.error
    beforeEach(() => {
        console.error = ErrorCounter.log
    })
    
    afterEach(() => {
        console.error = original
    })
    
    it('ShopContractEventManager - Run', async () => {
        new ShopContractEventManager(new SQL_Mock(), new Web3_Contract_Mock1());
        new ShopContractEventManager(new SQL_Mock(), new Web3_Contract_Mock2());
        new ShopContractEventManager(new SQL_Mock(), new Web3_Contract_Mock3());
        await delay(500);
    })
})