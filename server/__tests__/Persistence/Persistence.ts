import * as dotenv from "dotenv";
import { Persistence } from "../../Persistence/Persistence";
dotenv.config()

describe('Persistence', function () {
    
    it('getPaymentByBuyer - Valid', async () => {
        return Persistence.get().getPaymentByBuyer("0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1")
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
        return Persistence.get().getPaymentByBuyer("asdasdasdasdd")
        .then((res: any) => {
            expect(res.length).
            toBe(0)
        })
    })
    
    it('getPaymentBySeller - Valid', async () => {
        return Persistence.get().getPaymentBySeller("0x4645895DE6761C3c221Da5f6D75e4393a868B4a0")
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
        return Persistence.get().getPaymentBySeller("asdasdasdasdd")
        .then((res: any) => {
            expect(res.length).
            toBe(0)
        })
    })
    
    it('getPaymentEntryPrice - Valid', async () => {
        return Persistence.get().getPaymentEntryPrice(BigInt(0))
        .then((res: any) => {
            expect(res).
            toBe(20000000000000000)
        })
    })
    
    it('getPaymentEntryPrice - Invalid', async () => {
        expect.assertions(1);
        
        return Persistence.get().getPaymentEntryPrice(BigInt(12312312))
        .catch((e: any) => {
            expect(e).toMatch('No entry found')   
        })
    })
})