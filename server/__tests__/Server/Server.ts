import * as dotenv from "dotenv";

import { SQL_Interface } from "../../Persistence/SQL_Interface";
import { payment } from "../../Persistence/Types/payment";
import { paymentEntry } from "../../Persistence/Types/paymentEntry";
import { settledPayment } from "../../Persistence/Types/settledPayment";
import { Server } from "../../Server/Server"
import { Persistence } from "../../Persistence/Persistence";
import { PageCreator } from "../../Server/PageCreator"

dotenv.config()

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

import { EventEmitter } from 'events'
import { ShopContract_Interface } from "../../Persistence/ShopContract_Interface";
class Web3_Contract_Mock1 implements ShopContract_Interface {
    private e1: EventEmitter;
    
    constructor() {
        this.e1 = new EventEmitter;
    }
    
    public getBlockTime(block: number) {
        return new Promise<bigint>((resolve) => {
            resolve(BigInt(123))
        })
    }    
    
    public addedPaymentEntry(options: any) {
        return this.e1
    }
    
    public paymentSettled(options: any) {
        return this.e1
    }
    
    public statusChange(options: any) {
        return this.e1
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


describe('Server', () => { 
    const original = console.log
    beforeEach(() => {
        console.log = jest.fn
    })
    
    afterEach(() => {
        console.log = original
    })

    const page = new PageCreator();
    page.confirmPage = jest.fn;
    page.paymentByBuyerPage = jest.fn;
    page.paymentBySellerPage = jest.fn;
    page.detailPage = jest.fn;
    page.landPage = jest.fn;

    const server = new Server(new Persistence(new SQL_Mock(), new Web3_Contract_Mock1()), page) as any;
    
    it('Server - confirm', async () => {
        server.confirm();
    })

    it('Server - success', async () => {
        server.successCallback();
    })

    it('Server - buyer', async () => {
        server.buyer();
    })

    it('Server - seller', async () => {
        server.seller();
    })

    it('Server - detail', async () => {
        server.detail();
    })

    it('Server - land', async () => {
        server.land();
    })
    
    it('Server - Close', async () => {
        server.close()        
    })
})