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
// dexswap-v2.js (พร้อม UI, Select Token, Estimate, Swap บน Polygon)

const tokens = {
  USDC: {
    symbol: "USDC",
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    decimals: 6,
  },
  MATIC: {
    symbol: "MATIC",
    address: "0x0000000000000000000000000000000000001010", // Native MATIC
    decimals: 18,
  },
};

let userAddress = "";

async function connectWallet() {
  if (window.ethereum) {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    userAddress = accounts[0];
    walletStatus.innerText = `🟢 Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    await checkPolygon();
  } else {
    alert("Please install MetaMask.");
  }
}

async function checkPolygon() {
  const chainId = await ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0x89') {
    alert('Please switch to the Polygon network (Chain ID: 137)');
  }
}

async function estimatePrice() {
  const sellToken = tokenFrom.value;
  const buyToken = tokenTo.value;
  const sellAmount = amountInput.value;

  if (!sellAmount || !userAddress) return;

  const tokenMeta = tokens[sellToken];
  const amountInWei = BigInt(Math.floor(sellAmount * 10 ** tokenMeta.decimals)).toString();

  const url = `https://polygon.api.0x.org/swap/v1/price?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${amountInWei}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.buyAmount) {
    const buyMeta = tokens[buyToken];
    const buyAmount = Number(data.buyAmount) / 10 ** buyMeta.decimals;
    estimateDiv.innerText = `💱 Estimated Receive: ~${buyAmount.toFixed(4)} ${buyToken}`;
  } else {
    estimateDiv.innerText = `❌ Estimation failed: ${data.reason || "Check tokens"}`;
  }
}

async function doSwap() {
  const sellToken = tokenFrom.value;
  const buyToken = tokenTo.value;
  const sellAmount = amountInput.value;

  const tokenMeta = tokens[sellToken];
  const amountInWei = BigInt(Math.floor(sellAmount * 10 ** tokenMeta.decimals)).toString();

  const url = `https://polygon.api.0x.org/swap/v1/quote?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${amountInWei}&takerAddress=${userAddress}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.to && data.data) {
    const tx = {
      from: data.from,
      to: data.to,
      data: data.data,
      value: data.value,
    };

    try {
      const txHash = await ethereum.request({ method: 'eth_sendTransaction', params: [tx] });
      alert(`✅ Swap Success! TX Hash: ${txHash}`);
    } catch (err) {
      alert("❌ Swap failed: " + err.message);
    }
  } else {
    alert("❌ Failed to get quote.");
  }
}

window.onload = () => {
  const container = document.createElement("div");
  container.style = "font-family:sans-serif;max-width:400px;padding:20px;border:1px solid #ccc;border-radius:12px;margin:auto;text-align:center";

  container.innerHTML = `
    <h3>DEX Swap (Polygon)</h3>
    <div id="walletStatus">🔴 Not Connected</div>
    <button id="connectBtn" style="margin:10px;">Connect Wallet</button><br/>

    <select id="tokenFrom" style="margin:5px;">
      <option value="MATIC">MATIC</option>
      <option value="USDC">USDC</option>
    </select>

    ➡️

    <select id="tokenTo" style="margin:5px;">
      <option value="USDC">USDC</option>
      <option value="MATIC">MATIC</option>
    </select><br/>

    <input id="amountInput" type="number" placeholder="Amount" style="margin:10px;padding:5px;width:150px;"/><br/>
    <button id="estimateBtn">Estimate</button>
    <div id="estimateDiv" style="margin:10px;color:blue;"></div>
    <button id="swapBtn" style="background:green;color:white;padding:10px 20px;border:none;border-radius:8px;">Swap Token</button>
  `;

  document.body.appendChild(container);

  // Hook elements
  connectBtn.onclick = connectWallet;
  estimateBtn.onclick = estimatePrice;
  swapBtn.onclick = doSwap;
};
