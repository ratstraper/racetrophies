import { createConfig, http, getAccount, reconnect, connect } from '@wagmi/core'
import { polygon, sepolia } from '@wagmi/core/chains'
import { walletConnect, injected } from '@wagmi/connectors'

let account

const projectId = "ed660915e4bae88bd2f75fa205e44bcd"; 
const chains = [polygon];
const metadata = {
    name: "RT_Auth",
    description: "RT_Auth",
    url: "https://racetrophies.online", // origin must match your domain & subdomain
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const config = createConfig({
    chains: [polygon],
    // ssr: true, 
    // storage: createStorage({ storage: window.localStorage }), 
    // syncConnectedChain: false, 
    // batch: { multicall: true }, 
    // cacheTime: 4_000, 
    connectors: [
      walletConnect({
        // customStoragePrefix: 'wagmi', 
        // disableProviderPing: false,
        projectId: projectId,
        metadata: metadata,
        qrModalOptions: { 
            themeMode: 'dark', 
        }, 
        // relayUrl: 'wss://relay.walletconnect.org',
        // storageOptions: {}, 
        // showQrModal: true, 
      }),
    ],
    transports: { 
        // [mainnet.id]: http('https://rpc.payload.de'), 
        [polygon.id]: http('https://polygon.drpc.org'), 
      },
  })

reconnect(config);

// 3. Create modal
// const modal = new WalletConnectModal (config); 

export async function getAddress() {
    console.log("getAddress()")
    const acc = getAccount(config)
    // const acc = modal.getAddress()
    if(acc != undefined || acc.address != null) {
        console.log("getAddress, signer - ok")
        account = acc.address
    } else {
        // await checkConnect()
        // console.log("getAddress, checkConnect - ok")
    }
    return account
}

async function reload() {
    loadRace();
}
// disconnect(config)
/**
 * MODAL_LOADED
 * MODAL_OPEN
 * SELECT_WALLET
 * CONNECT_SUCCESS
 * CLICK_NETWORKS
 * SWITCH_NETWORK
 * CLICK_TRANSACTIONS
 * MODAL_CLOSE
 * CONNECT_ERROR
 */
// modal.subscribeEvents((newState) => {
//     console.log("events", newState.data.event);
//     const name  = newState.data.event;
//     if(name === "MODAL_CLOSE") {
//         const account = getAccount(config)
//         console.log(account)
//         loadRace(account.address);
//     } else if(name === "CONNECT_SUCCESS") {
//         const account = getAccount(config)
//         console.log(account)              
//         loadRace(account.address);  
//     } else if(name === "MODAL_LOADED") {
//         const account = getAccount(config)
//         console.log(account) 
//         loadRace(account.address);                  
//     }
// });

async function connectWallet() {
    const result = await connect(config, { connector: injected() })
}

document.getElementById('connectButton').addEventListener('click', connectWallet);

document.addEventListener('DOMContentLoaded', function() {
    console.log("events", "DOMContentLoaded");
    reload();
  })