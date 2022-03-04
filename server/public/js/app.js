const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost' ? 'http://localhost:8080' : currentUrl;

// Page elements
const connectButton = document.getElementById('connectButton');
const connectPopup = document.getElementById("connect");
const seller = document.getElementById("seller");
const qr = document.getElementById("qr");
const statusTrans = document.getElementById("status");
const unlockFundsButton = document.getElementById("unlockFundsButton");
const settlePaymentButton = document.getElementById("settlePaymentButton");
const cancelPaymentButton = document.getElementById("cancelPaymentButton")
const serverURL = document.getElementById('serverURL');
const chainName = document.getElementById("chainName");
const conn = document.getElementById("con");
const listBuyer = document.getElementById("listBuyer")
const listSeller = document.getElementById("listSeller")
const idWallet = document.getElementById("idWallet")
const wrongChain = document.getElementById("wrongChain")
const idPag = document.getElementById("idPag")
const menu = document.getElementById("header-right");
const relocButton = document.getElementById("relocButton")
const confirmPop = document.getElementById("confirm")
const sendingPop =  document.getElementById("sending")
const successPop = document.getElementById("success")
const errorPop = document.getElementById("error")

// Global gariables
let chainId;
let accounts;
let web3;
let transactionID;
let contractABI;
let contractAddress;
let deployedChainID;

fetch("contract/contract.json")
.then(res => res.json())
.then(res => {
    contractABI = JSON.parse(res.ABI)
    contractAddress = res.ADDRESS
    deployedChainID = res.CHAIN_ID
    chainName.innerText = res.CHAIN_NAME
})

function mobileCheck() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

function toggleMenu() {
    if (menu.style.display == "none") {
        menu.style.display = "block"
    } else {
        menu.style.display = "none"
    }
}

function setGetParameter(paramName, paramValue) {
    var url = window.location.href;
    var hash = location.hash;
    url = url.replace(hash, '');
    if (url.indexOf(paramName + "=") >= 0) {
        var prefix = url.substring(0, url.indexOf(paramName + "="));
        var suffix = url.substring(url.indexOf(paramName + "="));
        suffix = suffix.substring(suffix.indexOf("=") + 1);
        suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
        url = prefix + paramName + "=" + paramValue + suffix;
    } else {
        if (url.indexOf("?") < 0) {
            url += "?" + paramName + "=" + paramValue;
        } else {
            url += "&" + paramName + "=" + paramValue;
        }
    }
    window.location.href = url + hash;
}

function findGetParameter(parameterName) {
    var result = null,
    tmp = [];
    location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
    return result;
}

function handleNewChain(id) {
    chainId = id;
}

function handleNewAccounts(newAccounts) {
    accounts = newAccounts;
}

async function isMetamaskConnected() {
    const accountsList = await ethereum.request({
        method: 'eth_accounts'
    });
    return accountsList > 0;
}

function showSellerButton() {
    if (cancelPaymentButton && accounts[0].toUpperCase() == seller.innerText.toUpperCase()
    && statusTrans.innerText == "Open") {
        qr.style.display = "block"
        cancelPaymentButton.style.display = "block"
    }
}

function showBuyerButton() {
    if (unlockFundsButton && statusTrans.innerText == "Open") {
        unlockFundsButton.style.display = "block";
    }
}

function showContents() {
    connectPopup.style.display = "none"
    conn.style.display = "block"
}

function updateMenuLink() {
    listBuyer.setAttribute("href", "buyer?id=" + accounts[0])
    listSeller.setAttribute("href", "seller?id=" + accounts[0])
}

async function onMetamaskConnected() {
    try {
        handleNewChain(await ethereum.request({
            method: 'eth_chainId'
        }));
        handleNewAccounts(await ethereum.request({
            method: 'eth_accounts'
        }));

        if (idWallet && idWallet.value != accounts[0]) {
            setGetParameter("id", accounts[0])
        }

        web3 = new Web3(window.ethereum);

        showSellerButton()
        showBuyerButton()
        showContents()
        updateMenuLink()

        ethereum.on('chainChanged', handleNewChain);
        ethereum.on('accountsChanged', handleNewAccounts);
    } catch (error) {
        console.log(error);
    }
}

function onClickInstall() {
    const onboarding = new MetaMaskOnboarding({
        forwarderOrigin
    });

    connectButton.innerText = 'Installing Metamask...';
    onboarding.startOnboarding();
}

async function onClickConnect() {
    try {
        await ethereum.request({
            method: 'eth_requestAccounts'
        });

        onMetamaskConnected();
    } catch (error) {
        console.error(error);
    }
}

async function onClickOpenMetaMask() {
    window.location.replace("https://metamask.app.link/dapp/" + serverURL.value);
}

function isMetaMaskInstalled() {
    const {
        ethereum
    } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
}

function askForInstall() {
    connectPopup.style.display = "flex";

    if (mobileCheck()) {
        connectButton.innerText = 'Open in MetaMask!';
        connectButton.onclick = onClickOpenMetaMask;
    } else {
        connectButton.innerText = 'Install MetaMask now!';
        connectButton.onclick = onClickInstall;
    }
}

function askToConnect() {
    connectPopup.style.display = "flex";
}

async function initialize() {
    if (!isMetaMaskInstalled()) {
        askForInstall()
    } else if (await isMetamaskConnected()) {
        onMetamaskConnected()
    } else {
        askToConnect()
    }
}

function closePop(e) {
    e.target.parentElement.parentElement.style.display = "none"
    if (findGetParameter("r")) {
        location.href = "https://"+findGetParameter("r")+"?transaction_id="+transactionID
    }
}

function checkChainID() {
    if(parseInt(chainId, 16) != deployedChainID) {
        wrongChain.style.display = "flex"
        return false;
    }
    return true;
}

function showStatus(id) {
    let arr = [
        confirmPop,
        sendingPop,
        successPop,
        errorPop,
    ]
    arr.forEach(item => item.style.display = "none")
    arr[id].style.display = "flex"
}

async function getLatestPrice(){

    const addr = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
    const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

    const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
    const rec = await priceFeed.methods.latestRoundData().call();

    return (10**24)/rec.answer;

}

async function onClickSettlePayment() {
    if (checkChainID()) {
        settlePaymentButton.disabled = true;
        const shopContract = new web3.eth.Contract(contractABI, contractAddress);

        let conversion = await getLatestPrice();

        shopContract.methods.getPaymentEntry(idPag.value).call()
        .then(paymentEntry => {
            shopContract.methods.settlePayment(idPag.value).send({from: accounts[0], value: paymentEntry.price*conversion + 500})
            .once('sending', function() {
                showStatus(0)
            })
            .once('transactionHash', function() {
                showStatus(1)
            })
            .once('confirmation', function(confirmationNumber, receipt) {
                transactionID = receipt.events.paymentSettled.returnValues.settledPaymentId;
                settlePaymentButton.style.display = "none"
                showStatus(2)
            })
            .once('error', function(error) {
                // This happen on metamask popup close
                if (!error || error.code != 4001) {
                    showStatus(3)
                }
                settlePaymentButton.disabled = false;
            });
        });
    }
}

function onCancelPayment() {
    if(checkChainID()) {
        cancelPaymentButton.disabled = true;
        const shopContract = new web3.eth.Contract(contractABI, contractAddress);

        shopContract.methods.cancelPayment(idPag.value).send({from: accounts[0]})
        .once('sending', function() {
            showStatus(0)
        })
        .once('transactionHash', function() {
            showStatus(1)
        })
        .once('confirmation', function() {
            showStatus(2)
        })
        .once('error', function(error) {
            // This happen on metamask popup close
            if (!error || error.code != 4001) {
                showStatus(3)
            }
            cancelPaymentButton.disabled = false;
        });
    }
}

function onClickUnlockFunds() {
    if(checkChainID()) {
        unlockFundsButton.disabled = true;
        const shopContract = new web3.eth.Contract(contractABI, contractAddress);

        shopContract.methods.unlockFunds(idPag.value).send({from: accounts[0]})
        .once('sending', function() {
            showStatus(0)
        })
        .once('transactionHash', function() {
            showStatus(1)
        })
        .once('confirmation', function() {
            relocButton.onclick = location.reload();
            showStatus(2)
        })
        .once('error', function(error) {
            // This happen on metamask popup close
            if (!error || error.code != 4001) {
                showStatus(3)
            }
            unlockFundsButton.disabled = false;
        });
    }
}

window.addEventListener('DOMContentLoaded', initialize);