from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
import os

abi = [
    {
        "inputs":[

        ],
        "stateMutability":"nonpayable",
        "type":"constructor"
    },
    {
        "anonymous":False,
        "inputs":[
            {
                "indexed":True,
                "internalType":"address",
                "name":"previousOwner",
                "type":"address"
            },
            {
                "indexed":True,
                "internalType":"address",
                "name":"newOwner",
                "type":"address"
            }
        ],
        "name":"OwnershipTransferred",
        "type":"event"
    },
    {
        "anonymous":False,
        "inputs":[
            {
                "indexed":False,
                "internalType":"uint256",
                "name":"paymentEntryId",
                "type":"uint256"
            }
        ],
        "name":"addedPaymentEntry",
        "type":"event"
    },
    {
        "anonymous":False,
        "inputs":[
            {
                "indexed":False,
                "internalType":"uint256",
                "name":"settledPaymentId",
                "type":"uint256"
            }
        ],
        "name":"fundsUnlocked",
        "type":"event"
    },
    {
        "anonymous":False,
        "inputs":[
            {
                "indexed":False,
                "internalType":"uint256",
                "name":"settledPaymentId",
                "type":"uint256"
            }
        ],
        "name":"paymentCancelled",
        "type":"event"
    },
    {
        "anonymous":False,
        "inputs":[
            {
                "indexed":False,
                "internalType":"uint256",
                "name":"settledPaymentId",
                "type":"uint256"
            }
        ],
        "name":"paymentSettled",
        "type":"event"
    },
    {
        "inputs":[
            {
                "internalType":"string",
                "name":"objId",
                "type":"string"
            },
            {
                "internalType":"uint256",
                "name":"price",
                "type":"uint256"
            }
        ],
        "name":"addPaymentEntry",
        "outputs":[

        ],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[
            {
                "internalType":"uint256",
                "name":"settledPaymentId",
                "type":"uint256"
            }
        ],
        "name":"cancelSettledPayment",
        "outputs":[

        ],
        "stateMutability":"payable",
        "type":"function"
    },
    {
        "inputs":[
            {
                "internalType":"uint256",
                "name":"paymentEntryId",
                "type":"uint256"
            }
        ],
        "name":"getPaymentEntry",
        "outputs":[
            {
                "components":[
                    {
                        "internalType":"address",
                        "name":"seller",
                        "type":"address"
                    },
                    {
                        "internalType":"string",
                        "name":"objId",
                        "type":"string"
                    },
                    {
                        "internalType":"uint256",
                        "name":"price",
                        "type":"uint256"
                    }
                ],
                "internalType":"struct ShopContract.PaymentEntry",
                "name":"",
                "type":"tuple"
            }
        ],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[
            {
                "internalType":"uint256",
                "name":"settledPaymentId",
                "type":"uint256"
            }
        ],
        "name":"getSettledPayment",
        "outputs":[
            {
                "components":[
                    {
                        "internalType":"uint256",
                        "name":"paymentEntryId",
                        "type":"uint256"
                    },
                    {
                        "internalType":"uint256",
                        "name":"status",
                        "type":"uint256"
                    },
                    {
                        "internalType":"address",
                        "name":"client",
                        "type":"address"
                    }
                ],
                "internalType":"struct ShopContract.SettledPayment",
                "name":"",
                "type":"tuple"
            }
        ],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[

        ],
        "name":"owner",
        "outputs":[
            {
                "internalType":"address",
                "name":"",
                "type":"address"
            }
        ],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[

        ],
        "name":"renounceOwnership",
        "outputs":[

        ],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[
            {
                "internalType":"uint256",
                "name":"paymentEntryId",
                "type":"uint256"
            }
        ],
        "name":"settlePayment",
        "outputs":[

        ],
        "stateMutability":"payable",
        "type":"function"
    },
    {
        "inputs":[
            {
                "internalType":"address",
                "name":"newOwner",
                "type":"address"
            }
        ],
        "name":"transferOwnership",
        "outputs":[

        ],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[
            {
                "internalType":"uint256",
                "name":"settledPaymentId",
                "type":"uint256"
            }
        ],
        "name":"unlockFunds",
        "outputs":[

        ],
        "stateMutability":"nonpayable",
        "type":"function"
    }
]

contract_address = "0xC3FDE503A89a36529fdDEbbcb1C4a4dE970d2731"

w3 = Web3(Web3.WebsocketProvider('wss://speedy-nodes-nyc.moralis.io/5c29520422f9528344aa64a1/polygon/mumbai/ws'))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

w3.eth.account.enable_unaudited_hdwallet_features()
load_dotenv()
mnemonic = os.getenv('MNEMONIC')
acct = w3.eth.account.from_mnemonic(mnemonic, account_path="m/44'/60'/0'/0/0")

shopContract = w3.eth.contract(address=contract_address, abi=abi)

nonce = w3.eth.getTransactionCount(acct.address)

txn = shopContract.functions.addPaymentEntry('testMessaInVendita', 30000000000000000).buildTransaction({
     'chainId': 80001,
     'gas': 250000,
     'maxFeePerGas': w3.toWei('30', 'gwei'),
     'maxPriorityFeePerGas': w3.toWei('25', 'gwei'),
     'nonce': nonce,
})

signed_txn = w3.eth.account.sign_transaction(txn, private_key=acct.key)
w3.eth.send_raw_transaction(signed_txn.rawTransaction)

tx_receipt = w3.eth.waitForTransactionReceipt(w3.toHex(w3.keccak(signed_txn.rawTransaction)))

print(tx_receipt)