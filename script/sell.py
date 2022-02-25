#!/usr/bin/env python
# -*- coding: utf-8 -*-

from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
import os
import json
import sys
import logging

logging.basicConfig(filename='./sell.log', level=logging.INFO, 
                    format='%(asctime)s %(levelname)s %(name)s %(message)s')
logger=logging.getLogger(__name__)


def sell_item(price):
    try:
        msg = "[Adding] Price: "+sys.argv[1]
        print(msg)
        logger.info(msg)
        contract_json = open("contract.json", "r")
        contract = json.loads(contract_json.read())
        abi = json.loads(contract['ABI'])
        contract_address = contract['ADDRESS']

        load_dotenv()
        w3 = Web3(Web3.WebsocketProvider(os.getenv('PROVIDER')))
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        w3.eth.account.enable_unaudited_hdwallet_features()
        mnemonic = os.getenv('MNEMONIC')
        acct = w3.eth.account.from_mnemonic(mnemonic, account_path="m/44'/60'/0'/0/0")

        shopContract = w3.eth.contract(address=contract_address, abi=abi)

        nonce = w3.eth.getTransactionCount(acct.address)

        txn = shopContract.functions.addPaymentEntry(int(float(price)*100)).buildTransaction({
            'chainId': contract['CHAIN_ID'],
            'gas': 250000,
            'maxFeePerGas': w3.toWei('30', 'gwei'),
            'maxPriorityFeePerGas': w3.toWei('25', 'gwei'),
            'nonce': nonce,
        })

        signed_txn = w3.eth.account.sign_transaction(txn, private_key=acct.key)
        w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        tx_receipt = w3.eth.waitForTransactionReceipt(w3.toHex(w3.keccak(signed_txn.rawTransaction)))

        payment_id = int(tx_receipt['logs'][0]['data'], 16)
        msg = "[Added] Payment entry id: "+str(payment_id)+", price: "+sys.argv[1]
        print(msg)
        logger.info(msg)

        return payment_id
    except Exception as err:
        print(err)
        logger.error(err)

if __name__ == "__main__":
    if (len(sys.argv) != 2):
       print("Usage: "+sys.argv[0]+" [price_in_dollars]")
    else:
        sell_item(sys.argv[1])