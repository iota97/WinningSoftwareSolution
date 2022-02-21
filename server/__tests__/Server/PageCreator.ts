import * as dotenv from "dotenv";

import { SQL_Interface } from "../../Persistence/SQL";
import { payment } from "../../Persistence/Types/payment";
import { paymentEntry } from "../../Persistence/Types/paymentEntry";
import { settledPayment } from "../../Persistence/Types/settledPayment";
import { Persistence } from "../../Persistence/Persistence";
import { PageCreator } from "../../Server/PageCreator"

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
            if (buyer == "asdasdasdasdd") return resolve([])
            
            let obj: payment  = {
                id: BigInt(0),
                created: '123',
                confirmed: '',
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
                created: '123',
                confirmed: '',
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
                    created: "123",
                    confirmed: "",
                }
                resolve(obj)
            } else if (id == BigInt(1)) {
                let obj: payment  = {
                    id: BigInt(1),
                    buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                    seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                    price: BigInt(200),
                    status: 1,
                    created: "123",
                    confirmed: "",
                }
                resolve(obj)
            } else if (id == BigInt(11)) {
                let obj: payment  = {
                    id: BigInt(11),
                    buyer: '0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1',
                    seller: '0x4645895DE6761C3c221Da5f6D75e4393a868B4a0',
                    price: BigInt(200),
                    status: 2,
                    created: "123",
                    confirmed: "",
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
    
    it('Help Page - Ok', async () => {
        const req = {}
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
        }
        page.helpPage(req, res);
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
                    price: 2,
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
    
    it('Confirm Page - Ok', async () => {
        const req = { query: { id: 0 } }
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("confirm")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        }
        page.confirmPage(req, res, db);
    }) 

    it('Confirm Page - Confirmed', async () => {
        const req = { query: { id: 11 } }
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("confirm")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        }
        page.confirmPage(req, res, db);
    }) 
    
    
    it('Buyer Page - Ok', async () => {
        const req = { query: { id: "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0" } }
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("buyer")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        }
        page.paymentByBuyerPage(req, res, db);
    })
    
    it('Buyer Page - Empty', async () => {
        const req = { query: { id: "asdasdasdasdd" } }
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("buyer")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        }
        page.paymentByBuyerPage(req, res, db);
    })
    
    it('Seller Page - Ok', async () => {
        const req = { query: { id: "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0" } }
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("seller")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        }
        page.paymentBySellerPage(req, res, db);
    })
    
    it('Seller Page - Empty', async () => {
        const req = { query: { id: "asdasdasdasdd" } }
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("seller")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        }
        page.paymentBySellerPage(req, res, db);
    })
    
    it('Detail Page - Expired', async () => {
        const req = { query: { id: 1 } }
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("detail")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        }
        page.detailPage(req, res, db);
    })
    
    it('Detail Page - Ok', async () => {
        const req = { query: { id: 0 } }
        const res = { 
            render: (view: any, data: any) => {
                expect(view).
                toBe("detail")
            },
            redirect: (view: any, data: any) => {
                expect(false).toBe(true)
            },
        }
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
        }
        page.landPage({query: {}}, res, db);
    })
    
    it('Confirm Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        }
        page.confirmPage({query: {}}, res, db);
    })
    
    it('Seller Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        }
        page.paymentBySellerPage({query: {}}, res, db);
    })
    
    it('Buyer Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        }
        page.paymentByBuyerPage({query: {}}, res, db);
    })
    
    it('Detail Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        }
        page.detailPage({query: {}}, res, db);
    })
    
    it('Confirm Page - Redirect', async () => { 
        const res = { 
            render: (view: any, data: any) => {
                expect(false).toBe(true)
            },
            redirect: (path: any) => {
                expect(path).toBe("/")
            }
        }
        page.confirmPage({query: {}}, res, db);
        await delay(1000)
    })
})