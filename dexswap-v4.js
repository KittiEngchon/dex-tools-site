// dexsawp-v4.js

let provider;
let signer;

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();
    document.getElementById("wallet-address").innerText = `✅ ${shortenAddress(address)}`;
  } else {
    alert("กรุณาติดตั้ง MetaMask");
  }
}

function shortenAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function getSelectedChain() {
  const chain = document.getElementById("chainSelector").value;
  return chain;
}

async function swapTokens() {
  const fromToken = document.getElementById("fromToken").value;
  const toToken = document.getElementById("toToken").value;
  const amount = document.getElementById("amount").value;
  const slippage = document.getElementById("slippage").value;
  const chain = getSelectedChain();

  // ตัวอย่าง: เรียก 0x API หรือ Smart Contract
  alert(`Swap ${amount} ${fromToken} ➡️ ${toToken} (slippage ${slippage}%) on ${chain}`);

  // TODO: integrate 0x API or router
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectBtn").onclick = connectWallet;
  document.getElementById("swapBtn").onclick = swapTokens;
});
