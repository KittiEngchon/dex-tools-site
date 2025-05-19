// dexswap-v2.js

async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      alert("Connected Wallet: " + walletAddress);
    } catch (error) {
      console.error("User rejected connection:", error);
    }
  } else {
    alert("MetaMask not found. Please install MetaMask.");
  }
}

window.onload = function () {
  const btn = document.createElement("button");
  btn.innerText = "Connect Wallet";
  btn.onclick = connectWallet;
  btn.style = "padding: 10px 20px; font-size: 16px; border-radius: 8px; cursor: pointer;";
  document.body.appendChild(btn);

  // Optional: Input for amount
  const input = document.createElement("input");
  input.type = "number";
  input.placeholder = "Enter amount to swap";
  input.style = "margin-top: 10px; padding: 8px;";
  document.body.appendChild(input);
};
