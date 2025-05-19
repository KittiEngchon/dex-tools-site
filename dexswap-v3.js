// dexswap-v3.js (เวอร์ชันเต็ม พร้อม UI เพิ่ม Token + ตรวจ Balance + Gas info)

let tokens = {
  MATIC: {
    symbol: "MATIC",
    address: "0x0000000000000000000000000000000000001010",
    decimals: 18,
  },
  USDC: {
    symbol: "USDC",
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    decimals: 6,
  },
};

let userAddress = "";
let web3;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    userAddress = accounts[0];
    document.getElementById("walletStatus").innerText = `🟢 Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    await updateBalances();
  } else {
    alert("Please install MetaMask.");
  }
}

function renderDropdownOptions() {
  const selects = [document.getElementById("tokenFrom"), document.getElementById("tokenTo")];
  selects.forEach(select => {
    select.innerHTML = "";
    Object.values(tokens).forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.symbol;
      opt.text = t.symbol;
      select.appendChild(opt);
    });
  });
}

async function addTokenFromAddress() {
  const addr = document.getElementById("tokenAddress").value.trim();
  if (!web3.utils.isAddress(addr)) return alert("Invalid address");

  const erc20 = new web3.eth.Contract([
    { constant: true, name: "symbol", inputs: [], outputs: [{ name: "", type: "string" }], type: "function" },
    { constant: true, name: "decimals", inputs: [], outputs: [{ name: "", type: "uint8" }], type: "function" },
  ], addr);

  try {
    const symbol = await erc20.methods.symbol().call();
    const decimals = await erc20.methods.decimals().call();
    tokens[symbol] = { symbol, address: addr, decimals: Number(decimals) };
    renderDropdownOptions();
    alert(`✅ Token "${symbol}" added`);
  } catch {
    alert("❌ Failed to fetch token metadata");
  }
}

async function updateBalances() {
  const token = tokens[document.getElementById("tokenFrom").value];
  let balance;
  if (token.symbol === "MATIC") {
    balance = await web3.eth.getBalance(userAddress);
  } else {
    const erc20 = new web3.eth.Contract([{ constant: true, name: "balanceOf", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }], type: "function" }], token.address);
    balance = await erc20.methods.balanceOf(userAddress).call();
  }
  const value = Number(balance) / 10 ** token.decimals;
  document.getElementById("balanceInfo").innerText = `💰 Balance: ${value.toFixed(4)} ${token.symbol}`;
}

async function estimateSwap() {
  const sellToken = tokens[document.getElementById("tokenFrom").value];
  const buyToken = tokens[document.getElementById("tokenTo").value];
  const amount = document.getElementById("amountInput").value;
  if (!amount) return;

  const sellAmount = BigInt(Math.floor(amount * 10 ** sellToken.decimals)).toString();
  const url = `https://polygon.api.0x.org/swap/v1/quote?sellToken=${sellToken.address}&buyToken=${buyToken.address}&sellAmount=${sellAmount}&takerAddress=${userAddress}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data || data.buyAmount === undefined) {
    return alert("❌ Failed to estimate");
  }

  const buyAmount = Number(data.buyAmount) / 10 ** buyToken.decimals;
  const gasEth = web3.utils.fromWei((BigInt(data.gas || 0) * BigInt(data.gasPrice || 0)).toString(), 'ether');

  document.getElementById("estimateDiv").innerText = `💱 Estimated: ~${buyAmount.toFixed(4)} ${buyToken.symbol}\n⛽ Gas Fee: ${parseFloat(gasEth).toFixed(5)} MATIC`;
}

async function swapTokens() {
  const sellToken = tokens[document.getElementById("tokenFrom").value];
  const buyToken = tokens[document.getElementById("tokenTo").value];
  const amount = document.getElementById("amountInput").value;
  if (!amount) return alert("Please enter amount");

  const sellAmount = BigInt(Math.floor(amount * 10 ** sellToken.decimals)).toString();
  const url = `https://polygon.api.0x.org/swap/v1/quote?sellToken=${sellToken.address}&buyToken=${buyToken.address}&sellAmount=${sellAmount}&takerAddress=${userAddress}`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data || !data.to || !data.data) return alert("❌ No quote available");

  const tx = {
    from: data.from,
    to: data.to,
    data: data.data,
    value: data.value,
  };

  try {
    const txHash = await ethereum.request({ method: 'eth_sendTransaction', params: [tx] });
    alert("✅ Swap success: " + txHash);
  } catch (e) {
    alert("❌ Swap failed: " + e.message);
  }
}

window.onload = () => {
  const html = `
    <h3>DEX Swap (Polygon)</h3>
    <div id="walletStatus">🔴 Not Connected</div>
    <button onclick="connectWallet()">Connect Wallet</button><br/><br/>

    <label>Import Token: </label>
    <input id="tokenAddress" placeholder="0x..." size="42"/>
    <button onclick="addTokenFromAddress()">Add</button><br/><br/>

    <select id="tokenFrom" onchange="updateBalances()"></select>
    ➡️
    <select id="tokenTo"></select><br/><br/>

    <input id="amountInput" placeholder="Amount" type="number"/><br/>
    <div id="balanceInfo">💰 Balance: -</div><br/>

    <button onclick="estimateSwap()">Estimate</button>
    <div id="estimateDiv" style="margin-top:10px;color:blue;"></div><br/>

    <button onclick="swapTokens()" style="background:green;color:white;padding:10px 20px;border:none;border-radius:8px;">Swap</button>
  `;

  const box = document.createElement("div");
  box.style = "padding:20px;border:1px solid #ccc;max-width:500px;margin:auto;border-radius:12px";
  box.innerHTML = html;
  document.body.appendChild(box);

  renderDropdownOptions();
};
