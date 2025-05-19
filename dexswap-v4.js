// ⚡ DEXSWAP-V4.JS | MULTI-CHAIN | CONNECT WALLET | IMPORT TOKEN | SWAP TOKEN ⚡

let provider, signer, selectedChain = 'polygon';

const CHAINS = {
  polygon: {
    chainId: '0x89',
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    tokenList: [
      { symbol: 'MATIC', address: '0x0000000000000000000000000000000000001010', decimals: 18 },
      { symbol: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 }
    ],
    swapApi: 'https://polygon.api.0x.org'
  },
  bsc: {
    chainId: '0x38',
    name: 'Binance Smart Chain',
    rpc: 'https://bsc-dataseed.binance.org',
    tokenList: [
      { symbol: 'BNB', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18 },
      { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 }
    ],
    swapApi: 'https://bsc.api.0x.org'
  },
  ethereum: {
    chainId: '0x1',
    name: 'Ethereum',
    rpc: 'https://mainnet.infura.io/v3/',
    tokenList: [
      { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18 },
      { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 }
    ],
    swapApi: 'https://api.0x.org'
  },
  arbitrum: {
    chainId: '0xa4b1',
    name: 'Arbitrum One',
    rpc: 'https://arb1.arbitrum.io/rpc',
    tokenList: [
      { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18 },
      { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 }
    ],
    swapApi: 'https://arbitrum.api.0x.org'
  },
  base: {
    chainId: '0x2105',
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    tokenList: [
      { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18 },
      { symbol: 'USDC', address: '0xd9aaEC86B65d86f6aDf01c8350f22C2e4C2c8b1C', decimals: 6 }
    ],
    swapApi: 'https://base.api.0x.org'
  },
  linea: {
    chainId: '0xe708',
    name: 'Linea',
    rpc: 'https://rpc.linea.build',
    tokenList: [],
    swapApi: ''
  },
  pulsechain: {
    chainId: '0x171',
    name: 'PulseChain',
    rpc: 'https://rpc.pulsechain.com',
    tokenList: [],
    swapApi: ''
  },
  chronos: {
    chainId: '0x57e3',
    name: 'Chronos',
    rpc: '',
    tokenList: [],
    swapApi: ''
  }
};

async function connectWallet() {
  if (!window.ethereum) {
    alert('กรุณาติดตั้ง MetaMask');
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  signer = provider.getSigner();
  const address = await signer.getAddress();
  document.getElementById('connectBtn').innerText = '✅ ' + address.slice(0, 6) + '...' + address.slice(-4);
}

async function switchChain(chainKey) {
  const chain = CHAINS[chainKey];
  selectedChain = chainKey;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chain.chainId }]
    });
  } catch (e) {
    alert('ไม่สามารถเปลี่ยน Chain ได้');
  }
  updateTokenDropdowns(chainKey);
}

function updateTokenDropdowns(chainKey) {
  const list = CHAINS[chainKey].tokenList;
  const fromSel = document.getElementById('fromToken');
  const toSel = document.getElementById('toToken');
  fromSel.innerHTML = ''; toSel.innerHTML = '';
  list.forEach(token => {
    const opt1 = new Option(token.symbol, token.address);
    const opt2 = new Option(token.symbol, token.address);
    fromSel.appendChild(opt1); toSel.appendChild(opt2);
  });
}

async function estimatePrice() {
  const chain = CHAINS[selectedChain];
  const sellToken = document.getElementById('fromToken').value || document.getElementById('fromAddress').value;
  const buyToken = document.getElementById('toToken').value || document.getElementById('toAddress').value;
  const amount = document.getElementById('amount').value;
  const slippage = document.getElementById('slippage').value;

  if (!amount || !sellToken || !buyToken) return;

  const api = chain.swapApi;
  const url = `${api}/swap/v1/quote?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${ethers.utils.parseUnits(amount, 18)}&slippagePercentage=${slippage / 100}`;

  try {
    const res = await axios.get(url);
    const price = ethers.utils.formatUnits(res.data.buyAmount, 18);
    document.getElementById('priceEstimate').innerText = `💰 ได้รับโดยประมาณ: ${price}`;
  } catch (e) {
    document.getElementById('priceEstimate').innerText = '⛔ ไม่สามารถประเมินราคา';
  }
}

async function executeSwap() {
  const chain = CHAINS[selectedChain];
  const sellToken = document.getElementById('fromToken').value || document.getElementById('fromAddress').value;
  const buyToken = document.getElementById('toToken').value || document.getElementById('toAddress').value;
  const amount = document.getElementById('amount').value;
  const slippage = document.getElementById('slippage').value;
  const api = chain.swapApi;

  const url = `${api}/swap/v1/quote?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${ethers.utils.parseUnits(amount, 18)}&slippagePercentage=${slippage / 100}&takerAddress=${await signer.getAddress()}`;

  try {
    const res = await axios.get(url);
    const tx = await signer.sendTransaction(res.data);
    alert('⏳ รอการยืนยัน...');
    await tx.wait();
    alert('✅ Swap สำเร็จ!');
  } catch (e) {
    alert('❌ Swap ล้มเหลว: ' + e.message);
  }
}

// EVENTS
document.getElementById('connectBtn').onclick = connectWallet;
document.getElementById('chainSelector').onchange = e => switchChain(e.target.value);
document.getElementById('amount').oninput = estimatePrice;
document.getElementById('fromToken').onchange = estimatePrice;
document.getElementById('toToken').onchange = estimatePrice;
document.getElementById('swapBtn').onclick = executeSwap;
