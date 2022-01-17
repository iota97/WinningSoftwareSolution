const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost' ? 'http://localhost:8080' : currentUrl;

const connectButton = document.getElementById('connectButton');
const settlePaymentButton = document.getElementById("settlePaymentButton");

let chainId;
let accounts;

let web3;

const contractABI = JSON.parse('[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"paymentEntryIndex\",\"type\":\"uint256\"}],\"name\":\"addedPaymentEntry\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentIndex\",\"type\":\"uint256\"}],\"name\":\"paymentCancelled\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentIndex\",\"type\":\"uint256\"}],\"name\":\"paymentSettled\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"uint128\",\"name\":\"price\",\"type\":\"uint128\"}],\"name\":\"addPaymentEntry\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"settledPaymentIndex\",\"type\":\"uint256\"}],\"name\":\"cancelSettledPayment\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryIndex\",\"type\":\"uint256\"}],\"name\":\"getPaymentEntry\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"seller\",\"type\":\"address\"},{\"internalType\":\"uint128\",\"name\":\"price\",\"type\":\"uint128\"}],\"internalType\":\"struct ShopContract.paymentEntry\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint128\",\"name\":\"paymentEntryIndex\",\"type\":\"uint128\"}],\"name\":\"settlePayment\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]');

const contractAddress = "0xAebDeeb1Fa736727d2cc24E46AC70C99Bb9Bc11A";

//called when chain is changed
function handleNewChain(id) {

    chainId = id;

    let intId = parseInt(id, 16);
    let networkName;

    switch(intId){

        case 1:
            networkName = "Ethereum Mainnet";
            break;

        case 3:
            networkName = "Ropsten Testnet";
            break;

        case 4:
            networkName = "Rinkeby Testnet";
            break;

        case 5:
            networkName = "Goerli Testnet";
            break;

        case 137:
            networkName = "Polygon Mainnet";
            break;

        case 80001:
            networkName = "Mumbai Testnet";
            break;

        case 56:
            networkName = "BSC Mainnet";
            break;

        case 97:
            networkName = "BSC Testnet";
            break;

        case 42161:
            networkName = "Arbitrum (Mainnet)";
            break;

        case 421611:
            networkName = "Arbitrum (Testnet)";
            break;

        default:
            networkName = "Chain not supported";
            break;

    }

    const networkNameText = document.getElementById('networkNameText');
    networkNameText.innerText = networkName;

}

//called when account is changed
function handleNewAccounts(newAccounts) {

    accounts = newAccounts;
    connectButton.innerText = newAccounts[0]  || 'Unable to get account';

}

const onClickSettlePayment = () => {

    let intId = parseInt(chainId, 16);

    if(intId == 80001){ //the contract is deployed only in mumbai testnet

        const shopContract = new web3.eth.Contract(contractABI, contractAddress);
        const index = document.getElementById("idInput").value;

        shopContract.methods.getPaymentEntry(index).call()
            .then(paymentEntry => {

                alert("Venditore: " + paymentEntry.seller + "\nPrezzo: " + paymentEntry.price);

                shopContract.methods.settlePayment(index).send({from: accounts[0], value: paymentEntry.price * Math.pow(10, 18)}) //18 decimals
                    .on('transactionHash', function(hash){
                        //do smth
                    })
                    .on('confirmation', function(confirmationNumber, receipt){
                        //do smth
                    })
                    .on('receipt', function(receipt){
                        console.log(receipt);
                        alert("ID transazione: " + receipt.events.paymentSettled.returnValues.settledPaymentIndex);
                    })
                    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                        console.log(error);
                    }

                );

            }, reason => {

                console.log("Error: " + reason);

            }
        );

    }

}

const isMetamaskConnected = async () => {

    const accountsList = await ethereum.request({
        method: 'eth_accounts'
    });

    return accountsList > 0;

}

const onMetamaskConnected = async () => {

    try {

        handleNewChain(await ethereum.request({
            method: 'eth_chainId'
        }));
        handleNewAccounts(await ethereum.request({
            method: 'eth_accounts'
        }));

        web3 = new Web3(window.ethereum);

        connectButton.disabled = true;

        settlePaymentButton.onclick = onClickSettlePayment;
        settlePaymentButton.disabled = false;

        ethereum.on('chainChanged', handleNewChain);
        ethereum.on('accountsChanged', handleNewAccounts);

    } catch (error) {

        console.log(error);

    }

}

const onClickInstall = () => {

    const onboarding = new MetaMaskOnboarding({
        forwarderOrigin
    });

    connectButton.innerText = 'Installing Metamask...';

    onboarding.startOnboarding();

};

const onClickConnect = async () => {

    try {

        await ethereum.request({
            method: 'eth_requestAccounts'
        });

        onMetamaskConnected();

    } catch (error) {
        console.error(error);
    }

};

const isMetaMaskInstalled = () => {
    const {
        ethereum
    } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
};

const initialize = async () => {

    if (!isMetaMaskInstalled()) {

        connectButton.innerText = 'Install MetaMask now!';
        connectButton.onclick = onClickInstall;

    } else {

        if (await isMetamaskConnected()) {

            onMetamaskConnected();

        } else {

            connectButton.innerText = 'Connect';
            connectButton.onclick = onClickConnect;

        }

    }

};

window.addEventListener('DOMContentLoaded', initialize);