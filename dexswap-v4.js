let provider, signer, selectedChain = 'polygon';

const CHAINS = {
  polygon: { chainId: '0x89', name: 'Polygon', rpc: 'https://polygon-rpc.com', swapApi: 'https://polygon.api.0x.org' },
  bsc: { chainId: '0x38', name: 'Binance Smart Chain', rpc: 'https://bsc-dataseed.binance.org', swapApi: 'https://bsc.api.0x.org' },
  ethereum: { chainId: '0x1', name: 'Ethereum', rpc: 'https://mainnet.infura.io/v3/', swapApi: 'https://api.0x.org' }
};

async function connectWallet() {
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    alert('❌ กรุณาติดตั้งหรือเปิดใช้งาน MetaMask');
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
    alert(`❌ ไม่สามารถเปลี่ยนไปยังเครือข่าย ${chain.name}`);
  }
}

async function estimatePrice() {
  const chain = CHAINS[selectedChain];
  const sellToken = document.getElementById('fromToken').value;
  const buyToken = document.getElementById('toToken').value;
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

window.onload = () => {
  document.getElementById('connectBtn').onclick = connectWallet;
  document.getElementById('chainSelector').onchange = e => switchChain(e.target.value);
  document.getElementById('amount').oninput = estimatePrice;
};
