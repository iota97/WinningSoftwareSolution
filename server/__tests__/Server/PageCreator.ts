import * as dotenv from "dotenv";

import { SQL_Interface } from "../../Persistence/SQL";
import { payment } from "../../Persistence/Types/payment";
import { paymentEntry } from "../../Persistence/Types/paymentEntry";
import { settledPayment } from "../../Persistence/Types/settledPayment";
import { Persistence } from "../../Persistence/Persistence";
import { PageCreator } from "../../Server/PageCreator"

dotenv.config()

class SQL_Mock implements SQL_Interface {    
    insertPaymentEntry(entry: paymentEntry) {}
    insertSettledPayment(entry: settledPayment) {}
    updateSettledPayment(id: bigint, status: number) {}
    
    
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
    setLastSyncBlock(block: bigint) {}
    getLastSyncBlock() { 
        return new Promise<number>((resolve) => {
            resolve(0);
        })
    };
}

describe('PageCreator', () => { 
    const db = new Persistence(new SQL_Mock());
    const page = new PageCreator()
    
    it('Main Page - Ok', async () => {
        const req = {}
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("main")
                
                const obj = {
                    serverURL: process.env.SERVER_URL
                }
                expect(data).
                toMatchObject(obj)
            }
        }
        page.mainPage(req, res);
    })
    
    it('Landing Page - Ok', async () => {
        const req = {
            query: {id: 0}
        }
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("land")
                
                const obj = {
                    serverURL: process.env.SERVER_URL+"/land?id=0",
                    seller: "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0",
                    price: 20000000000000000 / Math.pow(10, 18),
                    id: 0
                }
                expect(data).
                toMatchObject(obj)
            },
            redirect: (path: any) => {
                expect(false).toBe(true)
            }
        }
        page.landPage(req, res, db);
    })

    it('Landing Page - Redirect', async () => {
        const o = db.getPaymentEntryByID;
        db.getPaymentByID = (s: any) => {
            return new Promise<payment>(() => {
                throw "err"
            })
        }

        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)

            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        }
        page.landPage({query: {}}, res, db);
        db.getPaymentEntryByID = o;
    })
})