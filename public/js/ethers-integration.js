let provider;
let signer;
let account;

async function connectWallet() {
    
    console.log("connectWallet()")
    if (typeof ethers === 'undefined') {
        console.error('Ethers library is not loaded');
        return;
    }
    if (typeof window.ethereum !== 'undefined') {
        try {
            await setListener()
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            if(account == undefined || account == null) {
                provider = new ethers.BrowserProvider(window.ethereum);
            }
        } catch (error) {
            console.error("User denied account access or an error occurred:", error);
        }
    } else {
        console.log('Please install MetaMask!');
        document.getElementById('accountInfo').textContent = 'Please install MetaMask!';
    }

}

async function setListener() {
    console.log("setListener()")
    if (window.ethereum.removeAllListeners) window.ethereum.removeAllListeners()

    window.ethereum.on('accountsChanged', async function (accounts) {
        console.log("onAccountsChanged, accounts:", accounts)
        await showConnection(accounts)
    })

    window.ethereum.on('chainChanged', function (chainId) {
        console.log('Network changed to:', chainId)
        // Здесь вы можете обновить UI или выполнить другие действия при смене сети
        // Обратите внимание, что при смене сети страница будет перезагружена автоматически
    })
}

async function checkConnect() {
    console.log("checkConnect()")
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);

        const accounts = await provider.listAccounts();
        await showConnection(accounts)
    }
}

async function showConnection(accounts) {
    console.log("showConnection()", accounts.length)
    const oldAddress = account
    if (accounts.length > 0) {
        // account = await accounts[0].getAddress()
        signer = await provider.getSigner()
        account = await signer.getAddress()
        document.getElementById('connectWalletButton').textContent = `${account.slice(0, 6)}...${account.slice(-4)}`
        console.log("showConnection, address:", account)
    } else {
        signer = null
        account = null
        document.getElementById('connectWalletButton').textContent = 'Connect Wallet'
    }
    if(oldAddress != account) {
        reload()
    }
}

async function getAddress() {
    console.log("getAddress()")
    if(signer != undefined || signer != null) {
        console.log("getAddress, signer - ok")
        account = await signer.getAddress()
    } else {
        // await checkConnect()
        // console.log("getAddress, checkConnect - ok")
    }
    return account
}

// Убедимся, что ethers загружен перед добавлением обработчика события
function initializeApp() {
    console.log("initializeApp()")
    if (typeof ethers !== 'undefined') {
        document.getElementById('connectWalletButton').addEventListener('click', connectWallet)
        checkConnect()
    } else {
        console.error('Ethers library is not loaded')
    }
}

window.addEventListener('walletConnected', function(event) {
    const { address, line } = event.detail; // Получаем данные из события
    console.log(`Кошелёк подключен с адресом: ${address}`);
    console.log(`Дополнительная информация: ${line}`);
    
    // Здесь можно добавить любые действия, которые нужно выполнить после подключения кошелька
  });
  
// Используем DOMContentLoaded для инициализации после загрузки DOM
document.addEventListener('DOMContentLoaded', initializeApp)