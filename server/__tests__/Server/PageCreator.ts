import * as dotenv from "dotenv";

import { SQL_Interface } from "../../Persistence/SQL_Interface";
import { payment } from "../../Persistence/Types/payment";
import { paymentEntry } from "../../Persistence/Types/paymentEntry";
import { settledPayment } from "../../Persistence/Types/settledPayment";
import { Persistence } from "../../Persistence/Persistence";
import { PageCreator } from "../../Server/PageCreator"

dotenv.config()

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


function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

class SQL_Mock implements SQL_Interface {    
    insertPaymentEntry(entry: paymentEntry) {return new Promise<void>((resolve) => {resolve})}
    insertSettledPayment(entry: settledPayment) {return new Promise<void>((resolve) => {resolve})}
    updateSettledPayment(id: bigint, status: number) {return new Promise<void>((resolve) => {resolve})}
    
    
    getPaymentByBuyer(buyer: string)  { 
        return new Promise<payment[]>((resolve) => {
            if (buyer == "asdasdasdasdd") return resolve([])
            
            let obj: payment  = {
                id: BigInt(0),
                created: BigInt(123),
                confirmed: null,
                buyer: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: BigInt(20000000000000000),
                status: 1
            }
            resolve([obj])
        })
    };
    getPaymentBySeller(seller: string)  { 
        return new Promise<payment[]>((resolve) => {
            if (seller == "asdasdasdasdd") return resolve([])
            
            let obj: payment  ={
                id: BigInt(0),
                created: BigInt(123),
                confirmed: null,
                buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                price: BigInt(20000000000000000),
                status: 2
            }
            resolve([obj])
        })
    };
    getPaymentByID(id: bigint) { 
        return new Promise<payment>((resolve, reject) => {
            if (id == BigInt(0)) {
                let obj: payment  = {
                    id: BigInt(0),
                    buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                    seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                    price: BigInt(200),
                    status: 3,
                    created: BigInt(123),
                    confirmed: BigInt(223),
                }
                resolve(obj)
            } else if (id == BigInt(1)) {
                let obj: payment  = {
                    id: BigInt(1),
                    buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                    seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                    price: BigInt(200),
                    status: 1,
                    created: BigInt(123),
                    confirmed: null,
                }
                resolve(obj)
            } else if (id == BigInt(11)) {
                let obj: payment  = {
                    id: BigInt(11),
                    buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                    seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                    price: BigInt(200),
                    status: 2,
                    created: BigInt(123),
                    confirmed: BigInt(223),
                }
                resolve(obj)
            } else if (id == BigInt(12)) {
                let obj: payment  = {
                    id: BigInt(11),
                    buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                    seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                    price: BigInt(200),
                    status: 0,
                    created: BigInt(123),
                    confirmed: null,
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
                let obj: paymentEntry = {
                    id: id,
                    seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                    price: BigInt(200)
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

import {Request, Response} from "express"

describe('PageCreator', () => { 
    const db = new Persistence(new SQL_Mock(), new Web3_Contract_Mock1());
    const page = new PageCreator()
    
    it('Main Page - Ok', async () => {
        const req: Request = {} as Request
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
        } as Response
        page.mainPage(req, res);
    })
    
    it('Help Page - Ok', async () => {
        const req: Request = {} as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("help")
                
                const obj = {
                    serverURL: process.env.SERVER_URL + "/help"
                }
                expect(data).
                toMatchObject(obj)
            }
        } as Response
        page.helpPage(req, res);
    })
    
    it('Landing Page - Ok', async () => {
        const req: Request = {
            query: { id: 0 } as any
        } as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("land")
                
                const obj = {
                    serverURL: process.env.SERVER_URL+"/land?id=0",
                    seller: "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0",
                    price: 2,
                    id: 0
                }
                expect(data).
                toMatchObject(obj)
            },
            redirect: (path: any) => {
                expect(false).toBe(true)
            }
        } as Response
        page.landPage(req, res, db);
    })
    
    it('Confirm Page - Ok', async () => {
        const req = { query: { id: 12 } as any} as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("confirm")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.confirmPage(req, res, db);
    }) 
    
    it('Confirm Page - Confirmed', async () => {
        const req = { query: { id: 11 } as any} as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("confirm")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.confirmPage(req, res, db);
    }) 
    
    
    it('Buyer Page - Ok', async () => {
        const req = { query: { id: "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0" } as any } as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("buyer")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.paymentByBuyerPage(req, res, db);
    })
    
    it('Buyer Page - Empty', async () => {
        const req = { query: { id: "asdasdasdasdd" } as any } as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("buyer")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.paymentByBuyerPage(req, res, db);
    })
    
    it('Seller Page - Ok', async () => {
        const req = { query: { id: "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0" } as any } as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("seller")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.paymentBySellerPage(req, res, db);
    })
    
    it('Seller Page - Empty', async () => {
        const req = { query: { id: "asdasdasdasdd" } as any } as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("seller")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.paymentBySellerPage(req, res, db);
    })
    
    it('Detail Page - Expired', async () => {
        const req = { query: { id: 1 } as any } as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("detail")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.detailPage(req, res, db);
    })
    
    it('Detail Page - Cancelled', async () => {
        const req = { query: { id: 11 } as any } as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("detail")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.detailPage(req, res, db);
    })

    it('Detail Page - Confirmed', async () => {
        const req = { query: { id: 12 } as any } as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("detail")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.detailPage(req, res, db);
    })
    
    
    it('Detail Page - Ok', async () => {
        const req = { query: { id: 0 } as any } as Request
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("detail")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        } as Response
        page.detailPage(req, res, db);
    })
    
    it('Landing Page - Redirect', async () => {
        // Redirect only after this
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
        } as Response
        page.landPage({} as Request, res, db);
    })
    
    it('Landing Page - Redirect 2', async () => {
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
                
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        } as Response
        page.landPage({ query: {id: "asd"} as any } as Request, res, db);
    })
    
    it('Landing Page - Redirect 3', async () => {
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
                
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        } as Response
        page.landPage({ query: {id: 123} as any } as Request, res, db);
    })
    
    it('Confirm Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        } as Response
        page.confirmPage({query: {id: 123123} as any} as Request, res, db);
    })
    
    it('Seller Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        } as Response
        page.paymentBySellerPage({query: {}} as Request, res, db);
    })
    
    it('Buyer Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        } as Response
        page.paymentByBuyerPage({query: {}} as Request, res, db);
    })
    
    it('Detail Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        } as Response
        page.detailPage({query: {}} as Request, res, db);
    })
    
    it('Detail Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        } as Response
        page.detailPage({query: {id: 12312} as any} as Request, res, db);
    })
    
    it('Confirm Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        } as Response
        page.confirmPage({query: {}} as Request, res, db);
        await delay(1000)
    })
})