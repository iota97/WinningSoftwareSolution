const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost' ? 'http://localhost:8080' : currentUrl;

const connectButton = document.getElementById('connectButton');
const connectPopup = document.getElementById("connect");

const seller = document.getElementById("seller");
const qr = document.getElementById("qr");
const statusTrans = document.getElementById("status");

const unlockFundsButton = document.getElementById("unlockFundsButton");
const settlePaymentButton = document.getElementById("settlePaymentButton");

const serverURL = document.getElementById('serverURL').value;

let chainId;
let accounts;

let web3;

const contractABI = JSON.parse('[ { \"anonymous\": false, \"inputs\": [ { \"indexed\": true, \"internalType\": \"address\", \"name\": \"previousOwner\", \"type\": \"address\" }, { \"indexed\": true, \"internalType\": \"address\", \"name\": \"newOwner\", \"type\": \"address\" } ], \"name\": \"OwnershipTransferred\", \"type\": \"event\" }, { \"anonymous\": false, \"inputs\": [ { \"indexed\": false, \"internalType\": \"uint256\", \"name\": \"paymentEntryId\", \"type\": \"uint256\" } ], \"name\": \"addedPaymentEntry\", \"type\": \"event\" }, { \"anonymous\": false, \"inputs\": [ { \"indexed\": false, \"internalType\": \"uint256\", \"name\": \"settledPaymentId\", \"type\": \"uint256\" } ], \"name\": \"paymentSettled\", \"type\": \"event\" }, { \"anonymous\": false, \"inputs\": [ { \"indexed\": false, \"internalType\": \"uint256\", \"name\": \"settledPaymentId\", \"type\": \"uint256\" } ], \"name\": \"statusChanged\", \"type\": \"event\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"price\", \"type\": \"uint256\" } ], \"name\": \"addPaymentEntry\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"bytes\", \"name\": \"\", \"type\": \"bytes\" } ], \"name\": \"checkUpkeep\", \"outputs\": [ { \"internalType\": \"bool\", \"name\": \"upkeepNeeded\", \"type\": \"bool\" }, { \"internalType\": \"bytes\", \"name\": \"\", \"type\": \"bytes\" } ], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"bytes\", \"name\": \"\", \"type\": \"bytes\" } ], \"name\": \"performUpkeep\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [], \"name\": \"renounceOwnership\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"paymentEntryId\", \"type\": \"uint256\" } ], \"name\": \"settlePayment\", \"outputs\": [], \"stateMutability\": \"payable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"address\", \"name\": \"newOwner\", \"type\": \"address\" } ], \"name\": \"transferOwnership\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"settledPaymentId\", \"type\": \"uint256\" } ], \"name\": \"unlockFunds\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"constructor\" }, { \"inputs\": [], \"name\": \"getLatestPrice\", \"outputs\": [ { \"internalType\": \"uint256\", \"name\": \"p\", \"type\": \"uint256\" } ], \"stateMutability\": \"view\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"paymentEntryId\", \"type\": \"uint256\" } ], \"name\": \"getPaymentEntry\", \"outputs\": [ { \"components\": [ { \"internalType\": \"address\", \"name\": \"seller\", \"type\": \"address\" }, { \"internalType\": \"uint256\", \"name\": \"price\", \"type\": \"uint256\" } ], \"internalType\": \"struct ShopContract.PaymentEntry\", \"name\": \"\", \"type\": \"tuple\" } ], \"stateMutability\": \"view\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"settledPaymentId\", \"type\": \"uint256\" } ], \"name\": \"getSettledPayment\", \"outputs\": [ { \"components\": [ { \"internalType\": \"uint256\", \"name\": \"paymentEntryId\", \"type\": \"uint256\" }, { \"internalType\": \"uint256\", \"name\": \"status\", \"type\": \"uint256\" }, { \"internalType\": \"address\", \"name\": \"client\", \"type\": \"address\" }, { \"internalType\": \"uint256\", \"name\": \"time\", \"type\": \"uint256\" }, { \"internalType\": \"uint256\", \"name\": \"payed\", \"type\": \"uint256\" } ], \"internalType\": \"struct ShopContract.SettledPayment\", \"name\": \"\", \"type\": \"tuple\" } ], \"stateMutability\": \"view\", \"type\": \"function\" }, { \"inputs\": [], \"name\": \"owner\", \"outputs\": [ { \"internalType\": \"address\", \"name\": \"\", \"type\": \"address\" } ], \"stateMutability\": \"view\", \"type\": \"function\" } ]');
const contractAddress = "0x5cDA994Fb402A2848E0eF47EF55aB882D8Bf6503";

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function handleNewChain(id) { 
    chainId = id;
}

function handleNewAccounts(newAccounts) {
    accounts = newAccounts;
    
}

const isMetamaskConnected = async () => {
    const accountsList = await ethereum.request({
        method: 'eth_accounts'
    });
    
    return accountsList > 0;    
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
        if (url.indexOf("?") < 0)
        url += "?" + paramName + "=" + paramValue;
        else
        url += "&" + paramName + "=" + paramValue;
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

const onMetamaskConnected = async () => {
    try { 
        handleNewChain(await ethereum.request({
            method: 'eth_chainId'
        }));
        handleNewAccounts(await ethereum.request({
            method: 'eth_accounts'
        }));
        
        web3 = new Web3(window.ethereum);
        
        if (seller && qr && statusTrans) {
            if (accounts[0].toUpperCase() == seller.innerText.toUpperCase()
                && statusTrans.innerText == "Open") {
                qr.style = "display: block;"
            }
        }
        
        if (settlePaymentButton) {
            settlePaymentButton.onclick = onClickSettlePayment;
            settlePaymentButton.disabled = false;
        }
        
        if (unlockFundsButton) {
            unlockFundsButton.onclick = onClickUnlockFunds;
            unlockFundsButton.disabled = false;
        }   
        
        connectPopup.style = "display: none;"
        
        document.getElementById("con").style = "display: block;"
        
        const wallet = document.getElementById("idWallet")
        if (wallet && accounts[0]) {
            if (wallet.value != accounts[0]) {
                setGetParameter("id", accounts[0])
            }
        }
        
        const listBuyer = document.getElementById("listBuyer")
        if (listBuyer && accounts[0]) {
            listBuyer.classList.remove("rimosso")
            listBuyer.setAttribute("href", "buyer?id=" + accounts[0])
        }
        
        const listSeller = document.getElementById("listSeller")
        if (listSeller && accounts[0]) {
            listSeller.classList.remove("rimosso")
            listSeller.setAttribute("href", "seller?id=" + accounts[0])
        }
        
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

const onClickOpenMetaMask = async () => {
    window.location.replace("https://metamask.app.link/dapp/" + serverURL);
};

const isMetaMaskInstalled = () => {
    const {
        ethereum
    } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
};

const initialize = async () => {
    if (!isMetaMaskInstalled()) {  
        connectPopup.style = "display: flex;"
        
        if (window.mobileCheck()) {
            connectButton.innerText = 'Open in MetaMask!';
            connectButton.onclick = onClickOpenMetaMask;
        } else {
            connectButton.innerText = 'Install MetaMask now!';
            connectButton.onclick = onClickInstall;
        }    
    } else {
        if (await isMetamaskConnected()) {
            onMetamaskConnected();         
        } else {
            connectPopup.style = "display: flex;"
            
            connectButton.innerText = 'Connect with MetaMask';
            connectButton.onclick = onClickConnect;         
        }       
    }    
};

const onClickSettlePayment = () => {
    settlePaymentButton.disabled = true;
    let intId = parseInt(chainId, 16);
    
    if(intId == 80001){ //the contract is deployed only in mumbai testnet        
        const shopContract = new web3.eth.Contract(contractABI, contractAddress);
        const index = document.getElementById("idPag").value;
        
        let conversion;
        shopContract.methods.getLatestPrice().call()
        .then(p => {
            conversion = p;
            return shopContract.methods.getPaymentEntry(index).call()
        })
        .then(paymentEntry => { 
            shopContract.methods.settlePayment(index).send({from: accounts[0], value: paymentEntry.price*conversion + 500})
            .once('sending', function() {
                document.getElementById("confirm").style = "display: flex;"
                document.getElementById("sending").style = "display: none;"
                document.getElementById("success").style = "display: none;"
                document.getElementById("error").style = "display: none;"
            })
            .once('transactionHash', function() {
                document.getElementById("sending").style = "display: flex;"
                document.getElementById("confirm").style = "display: none;"
                document.getElementById("success").style = "display: none;"
                document.getElementById("error").style = "display: none;" 
            })
            .once('confirmation', function(){
                document.getElementById("success").style = "display: flex;"
                document.getElementById("sending").style = "display: none;"
                document.getElementById("confirm").style = "display: none;"
                document.getElementById("error").style = "display: none;"
            })
            .once('error', function(error) {
                // This happen on metamask popup close
                if (!error || error.code != 4001) {
                    document.getElementById("error").style = "display: flex;"
                }
                document.getElementById("sending").style = "display: none;"
                document.getElementById("confirm").style = "display: none;"
                document.getElementById("success").style = "display: none;"
                settlePaymentButton.disabled = false;
                
                console.log(error);
            });    
        }, reason => {    
            console.log("Error: " + reason);
        });  
    } else {
        document.getElementById("wrongChain").style = "display: flex;"
    }
}

function closePop(e) {
    var caller = e.target || e.srcElement;
    caller.parentElement.parentElement.style = "display: none;"
    if (findGetParameter("r")) {
        location.href = "https://"+findGetParameter("r")
    }
}

const onClickUnlockFunds = () => {   
    unlockFundsButton.disabled = true;
    
    let intId = parseInt(chainId, 16);
    
    if (intId == 80001) { //the contract is deployed only in mumbai testnet       
        const shopContract = new web3.eth.Contract(contractABI, contractAddress);
        const idSettledPayment = document.getElementById("idPag").value;
        
        shopContract.methods.getSettledPayment(idSettledPayment).call()
        .then(settledPayment => {            
            shopContract.methods.unlockFunds(idSettledPayment).send({from: accounts[0]})
            .once('sending', function() {
                document.getElementById("confirm").style = "display: flex;"
                document.getElementById("sending").style = "display: none;"
                document.getElementById("success").style = "display: none;"
                document.getElementById("error").style = "display: none;"
            })
            .once('transactionHash', function() {
                document.getElementById("sending").style = "display: flex;"
                document.getElementById("confirm").style = "display: none;"
                document.getElementById("success").style = "display: none;"
                document.getElementById("error").style = "display: none;" 
            })
            .once('confirmation', function(){
                document.getElementById("success").style = "display: flex;"
                document.getElementById("sending").style = "display: none;"
                document.getElementById("confirm").style = "display: none;"
                document.getElementById("error").style = "display: none;"
            })
            .once('error', function(error) {
                // This happen on metamask popup close
                if (!error || error.code != 4001) {
                    document.getElementById("error").style = "display: flex;"
                }
                document.getElementById("sending").style = "display: none;"
                document.getElementById("confirm").style = "display: none;"
                document.getElementById("success").style = "display: none;"
                unlockFundsButton.disabled = false;
                
                console.log(error);
            });    
        }, reason => {        
            console.log("Error: " + reason);
            
        });   
    } else {
        document.getElementById("wrongChain").style = "display: flex;"
    }
}

function toggleMenu() {
    let menu = document.getElementById("header-right");
    if (menu.style.display == "none") {
        menu.style.display = "block"
    } else {
        menu.style.display = "none"
    }
}

window.addEventListener('DOMContentLoaded', initialize);