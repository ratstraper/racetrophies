/**
 * https://onboard.blocknative.com/docs/modules/core#example
 */
import Onboard, { ThemingMap } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { ethers } from 'ethers';

window.ethers = ethers;
const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: 'ed660915e4bae88bd2f75fa205e44bcd', 
  requiredChains: [0x13882],  //0x89
  /**
   * Chains required to be supported by all wallets connecting to your DApp
   */
  // optionalChains: [1, 8453, 10, 56],
  dappUrl: 'https://racetrophies.online'
});

const customTheme = {
  '--w3o-background-color': '#f0f0f0',
  '--w3o-foreground-color': '#333',
  '--w3o-text-color': '#fff',
  '--w3o-border-color': '#ccc',
  '--w3o-action-color': '#007bff',
  '--w3o-border-radius': '5px'
}

const accountCenter = {
  desktop: {
    enabled: true,
    minimal: false,
    position: 'topRight'
  },
  mobile: {
    enabled: true,
    position: 'topRight'
  }
}

const appMetadata = {
  name: 'Race Trophies',
  icon: '<svg viewBox="0 0 433 433" width="100" height="100" xmlns="http://www.w3.org/2000/svg"><g><path d="m216 217-108 65L0 217l108-63 108 63z" fill="#c30"/><path d="m216 217-65-108L216 1l63 108-63 108z" fill="#09f"/><path d="m432 217-108 65-108-65 108-63 108 63z" fill="#f93"/><path d="m216 433-65-108 65-108 63 108-63 108z" fill="#33c"/></g></svg>',
  logo: '<svg viewBox="0 0 433 433" width="100" height="100" xmlns="http://www.w3.org/2000/svg"><g><path d="m216 217-108 65L0 217l108-63 108 63z" fill="#c30"/><path d="m216 217-65-108L216 1l63 108-63 108z" fill="#09f"/><path d="m432 217-108 65-108-65 108-63 108 63z" fill="#f93"/><path d="m216 433-65-108 65-108 63 108-63 108z" fill="#33c"/></g></svg>',
  description: 'https://racetrophies.online',
  recommendedInjectedWallets: [
    // { name: 'TrustWallet', url: 'https://'},
    { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
    { name: 'MetaMask', url: 'https://metamask.io' }
  ]
}

const onboard = Onboard({
  theme: 'light', //'dark', 'light', 'default', 'system' customTheme
  wallets: [injected, walletConnect],
  chains: [
    // {
    //   id: '0x89',
    //   token: 'POL',
    //   label: 'Polygon Mainnet',
    //   rpcUrl: 'https://polygon-bor-rpc.publicnode.com'
    // },
    {
      id: '0x13882',
      token: 'POL',
      label: 'Amoy',
      rpcUrl: 'https://api.zan.top/polygon-amoy'
    }
  ],
  accountCenter: accountCenter,
  notify: {
    desktop: {
      enabled: true,
      position: 'bottomLeft'
    },
    mobile: {
      enabled: true,
      position: 'topLeft'
    }
  },
  appMetadata: appMetadata,
});

const connectButton = document.getElementById('connectButton');

let provider;
let signer;
let address;

function saveWalletState(wallets) {
  if (wallets.length > 0) {
    const walletState = {
      connectedWallets: wallets.map((wallet) => wallet.label),
    };
    localStorage.setItem('connectedWallets', JSON.stringify(walletState));
  } else {
    localStorage.removeItem('connectedWallets');
  }
}

async function restoreWalletConnection() {
  const savedState = localStorage.getItem('connectedWallets');
  if (savedState) {
    try {
      const { connectedWallets } = JSON.parse(savedState);
      if (connectedWallets && connectedWallets.length > 0) {
        await onboard.connectWallet({
          autoSelect: { label: connectedWallets[0], disableModals: true },
        });
      }
    } catch (error) {
      console.error('Failed to restore wallet connection:', error);
      localStorage.removeItem('connectedWallets');
    }
  }
}

async function connectWallet() {
  try {
    const wallets = await onboard.connectWallet();
    if (wallets && wallets.length > 0) {
      const walletProvider = wallets[0].provider;
      provider = new ethers.BrowserProvider(walletProvider, 'any');
      signer = await provider.getSigner();
      address = await signer.getAddress();
      saveWalletState(wallets);

      addWalletEventListeners(walletProvider);

      addressChanged(address);
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    // alert('Wallet connection error: ' + error.message);
  }
}

function addWalletEventListeners(walletProvider) {
  //accounts: ProviderAccounts
  //export type ProviderAccounts = AccountAddress[];
  //export type AccountAddress = Address;
  walletProvider.on('accountsChanged', async (accounts) => {
    console.log(`event accountsChanged: ${accounts}`)
    if (accounts.length > 0) {
      address = accounts[0];
      signer = await provider.getSigner();
      addressChanged(address);
    } else {
      disconnectWallet();
    }
  });

  // chainId: ChainId
  // export type ChainId = string;
  walletProvider.on('chainChanged', (chainId) => {
    console.log(`event chainChanged: ${chainId}`)
    // if (chainId !== 0x89) {
    //   alert(`Please switch to Polygon Mainnet.`); //
    // }
    if (chainId === 0x13882) {
      alert(`Please switch to Amoy.`);
    }
  });

  // export interface ProviderMessage {
  //   type: string;
  //   data: unknown;
  // }
  walletProvider.on('message', (message) => {
    console.log(`event message: ${message}`)
  });

  // export interface ProviderInfo {
  //   chainId: ChainId;
  // }
  walletProvider.on('connect', (s) => {
    console.log(`event connect: ${s}`)
  });

  //   export interface ProviderRpcError extends Error {
  //     message: string;
  //     code: number;
  //     data?: unknown;
  //   }
  walletProvider.on('disconnect', (code, reason) => {
    console.log(`event disconnect: ${code}, ${reason}`)
    disconnectWallet();
  });
}

function addressChanged(address) {
  console.log('Account changed:', address);
  Window.provider = provider;
  if(!address) {
    resetButton();
  } else {
    connectButton.textContent = `${address.substring(0, 6)}...${address.slice(-4)}`;
  }

  const walletConnectedEvent = new CustomEvent('walletConnected', {
    detail: {
      address: address,
      line: "none"
    },
  });
  window.dispatchEvent(walletConnectedEvent);

  // loadRace(address);
}

function disconnectWallet() {
  const [primaryWallet] = onboard.state.get().wallets;
  if (primaryWallet) {
    onboard.disconnectWallet({ label: primaryWallet.label });
    localStorage.removeItem('connectedWallets');
    resetButton();
  }
}

function resetButton() {
  connectButton.textContent = 'Connect your wallet';
  connectButton.removeEventListener('click', disconnectWallet);
  connectButton.addEventListener('click', connectWallet);
  address = "";
  const walletDisconnectedEvent = new CustomEvent('walletDisconnected');
  window.dispatchEvent(walletDisconnectedEvent);
}

onboard.state.select('wallets').subscribe((wallets) => {
  console.log('Wallets changed:', wallets);
  if (wallets.length === 0) {
    resetButton();
  } else {
    const walletProvider = wallets[0].provider;
    provider = new ethers.BrowserProvider(walletProvider, 'any');
    signer = provider.getSigner();
    address = wallets[0].accounts[0]?.address;
    addressChanged(address);

    addWalletEventListeners(walletProvider);
  }
});

restoreWalletConnection();

connectButton.addEventListener('click', connectWallet);

window.connectWallet = connectWallet;

window.switchToEthereumMainnet = async function() {
  try {
    if (window.ethereum) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }] //[{ chainId: '0x89' }], 
      });
    } else {
      alert('Ethereum wallet is not available. Please install a wallet like MetaMask.');
    }
  } catch (error) {
    if (error.code === 4902) {
      alert('Ethereum Mainnet is not available in your wallet. Please add it manually.');
    } else {
      console.error('Failed to switch to Ethereum Mainnet:', error);
    }
  }
};


// async function reload() {
//   loadRace();
// }

document.addEventListener('DOMContentLoaded', function() {
  console.log("events", "DOMContentLoaded");
  addressChanged(address);
  // reload();
})



/**
 * Register a new athlete
 */
const contractAddress = '0xA77Bbde7ec67fb57A900Db6C35adc474f0126E54';
const ABI = [
  "function registerRacer(uint256, uint32, string calldata, uint32, uint32, string memory) payable",
  "function depositRacer(uint256, uint32, string calldata) payable",
  "function getRace(uint256) public view returns (Races memory)"
]
const contractABI = [
  {
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_raceId",
				"type": "uint256"
			},
			{
				"internalType": "uint32",
				"name": "_bib",
				"type": "uint32"
			},
			{
				"internalType": "string",
				"name": "_word",
				"type": "string"
			}
		],
		"name": "depositRacer",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
  {
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_raceId",
				"type": "uint256"
			},
			{
				"internalType": "uint32",
				"name": "_bib",
				"type": "uint32"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "uint32",
				"name": "_sex",
				"type": "uint32"
			},
			{
				"internalType": "uint32",
				"name": "_birstday",
				"type": "uint32"
			},
			{
				"internalType": "string",
				"name": "_promocode",
				"type": "string"
			}
		],
		"name": "registerRacer",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
  {
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_raceId",
				"type": "uint256"
			}
		],
		"name": "getRace",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "distance",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "uint64",
						"name": "meters",
						"type": "uint64"
					},
					{
						"internalType": "uint64",
						"name": "orgId",
						"type": "uint64"
					},
					{
						"internalType": "uint64",
						"name": "start",
						"type": "uint64"
					},
					{
						"internalType": "uint64",
						"name": "end",
						"type": "uint64"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "uint32",
						"name": "counter",
						"type": "uint32"
					},
					{
						"internalType": "uint32",
						"name": "finishers",
						"type": "uint32"
					},
					{
						"internalType": "uint32",
						"name": "active",
						"type": "uint32"
					},
					{
						"internalType": "uint32",
						"name": "multitrack",
						"type": "uint32"
					},
					{
						"internalType": "uint32",
						"name": "consecutive",
						"type": "uint32"
					},
					{
						"internalType": "uint32",
						"name": "verification",
						"type": "uint32"
					},
					{
						"internalType": "uint64",
						"name": "reserved",
						"type": "uint64"
					}
				],
				"internalType": "struct BaseVariable.Races",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// window.registerNewAthlete = registerNewAthlete;
window.registerNewAthlete = async function(raceId, bib, name, sex, birthday, promocode) {
  try {
    console.log(`name:${name}, sex:${sex}, bd:${birthday}, race:${raceId}, bib:${bib}, promocode:${promocode}`);
    // const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, provider); // для getRace
    const signerContract = new ethers.Contract(contractAddress, contractABI, signer);     // для registerRacer
    // await contract.getRace(parseInt(raceId))
    //     .then(race => {
    //             price = ethers.toBigInt(from(race.price)).toBeHex() // ethers.utils.hexlify(parseInt(race.price)) //new web3.utils.BN(race.price)
    //         },
    //         (error) => { console.error(error) })
    //     .catch((e) => { console.error(e) })
    // console.log(`price: ${price}`);
    const race = await contract.getRace(parseInt(raceId));
    const price = race.price; 
    console.log(`price: ${price}`);

    const nonce = await provider.getTransactionCount(address);
    const feeData = await provider.getFeeData();
    const gasFee = feeData.gasPrice;
    // await contract.registerRacer(parseInt(raceId), bib, name, parseInt(sex), parseInt(birthday), promocode, { 
    //         gasPrice: gasFee.toHexString(), 
    //         nonce: nonce,
    //         value: price 
    //     })
    //     .then(rawTxn => {
    //         console.log("...Submitting transaction with gas price of:", ethers.formatEther(gasFee, "gwei"), " - & nonce:", nonce)
    //         // console.log(rawTxn); 
    //         depo(rawTxn)
    //     })
    //     .catch(err => console.log(err.reason)); //здесь окно гасим или уведомление об ошибке
    const tx = await signerContract.registerRacer(
      parseInt(raceId),
      bib,
      name,
      parseInt(sex),
      parseInt(birthday),
      promocode,
      {
        gasPrice: gasFee,
        nonce: nonce,
        value: price
      }
    );

    console.log("...Submitting transaction with gas price of:", ethers.formatUnits(gasFee, "gwei"), " - & nonce:", nonce);
    depo(tx);
  } catch (err) {
    console.error(err);
    // Показать уведомление об ошибке пользователю
    if (err.reason) {
      alert(`Registration failed: ${err.reason}`);
      const event = new CustomEvent('registerAthlete');
      window.dispatchEvent(event);
    } else {
      alert(`Unexpected error: ${err.message}`);
      const event = new CustomEvent('registerAthlete');
      window.dispatchEvent(event);
    }
  }
        //////////////////
    // try {
    //   const tx = await contract.registerRacer(parseInt(raceId), bib, name, parseInt(sex), birstday, promocode, {
    //     value: ethers.parseEther(bidAmount),
    //   });
    //   console.log("Transaction registerRacer sent, waiting for confirmation...");
    //   await tx.wait();
    //   console.log("Transaction confirmed!");
    //   const result = receipt.hash;
    //   console.log("Transaction hash:", result);
    //   const event = new CustomEvent('registerAthlete');
    //   window.dispatchEvent(event);
    // } catch (err) {
    //   console.error(err);
    //   setStatus("Error: " + err.message);
    //   const event = new CustomEvent('registerAthlete');
    //   window.dispatchEvent(event);
    // }


    // await signer.sendTransaction({
    //   to: '0x0e1c4d7f3a2b8c5d9f6e4b8f3a2b8c5d9f6e4b8f',
    //   value: ethers.parseEther('0.01'),
    // }).then((tx) => {
    //   console.log('Transaction sent:', tx);
    //   return tx.wait();
    // }).then((receipt) => {
    //   console.log('Transaction confirmed:', receipt);
    // })
}

// contractWithSigner.registerAthlete(name, parseInt(sex), parseInt(birthday))
// .then(res => console.log(res))
// .catch(err => console.log(err)); //здесь окно гасим или уведомление об ошибке

const depo = async (tx) =>{
  try {
    const receipt = await tx.wait();
    console.log(receipt);

    if (receipt) {
      console.log(
        "Transaction is successful!!!\n" +
        "Transaction Hash: " + tx.hash + "\n" +
        "Block Number: " + receipt.blockNumber + "\n" +
        "See it at: https://amoy.polygonscan.com/tx/" + tx.hash
      );
    } else {
      console.log("Error: transaction failed.");
    }

    const event = new CustomEvent('registerAthlete');
    window.dispatchEvent(event);

  } catch (err) {
    console.error("Error waiting for transaction:", err);
  }
}