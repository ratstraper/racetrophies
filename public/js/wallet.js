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
  requiredChains: [0x89],
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
    { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
    { name: 'MetaMask', url: 'https://metamask.io' }
  ]
}

const onboard = Onboard({
  theme: 'light', //'dark', 'light', 'default', 'system' customTheme
  wallets: [injected, walletConnect],
  chains: [
    {
      id: '0x89',
      token: 'POL',
      label: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-bor-rpc.publicnode.com'
    },
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
    alert('Wallet connection error: ' + error.message);
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
    if (chainId !== 0x89) {
      alert(`Please switch to Polygon Mainnet.`); //
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
  address == undefined 
    ? resetButton() 
    : connectButton.textContent = `${address.substring(0, 6)}...${address.slice(-4)}`;

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
  addressChanged(address);
}

onboard.state.select('wallets').subscribe((wallets) => {
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
        params: [{ chainId: '0x89' }],
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