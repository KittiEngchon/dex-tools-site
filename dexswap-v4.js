// DEX Swap v4.js - Clean Version with Wallet Connect, Chain Select, Slippage, and 0x API

// Add your 0x API endpoint here
const ZEROX_API_BASE = 'https://polygon.api.0x.org';

let provider, signer, userAddress, currentChain = 'polygon';

const rpcMap = {
  polygon: "https://polygon-rpc.com",
  bsc: "https://bsc-dataseed.binance.org/",
  ethereum: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
  arbitrum: "https://arb1.arbitrum.io/rpc",
  base: "https://base-mainnet.public.blastapi.io",
  linea: "https://rpc.goerli.linea.build",
  pulsechain: "https://rpc.pulsechain.com",
  chronos: "https://mainnet.chronos.org",
};

window.addEventListener('DOMContentLoaded', () => {
  const walletBtn = document.getElementById('wallet-button');
  const chainSelector = document.getElementById('chainSelector');
  const swapBtn = document.getElementById('swapBtn');
  const amountInput = document.getElementById('amount');
  const slippageInput = document.getElementById('slippage');
  const tokenInSelect = document.getElementById('tokenIn');
  const tokenOutSelect = document.getElementById('tokenOut');
  const estimateEl = document.getElementById('estimate');

  let topButtons = document.querySelector('.top-right-buttons');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    if (currentY > lastScrollY) {
      topButtons.style.opacity = '0';
      topButtons.style.pointerEvents = 'none';
    } else {
      topButtons.style.opacity = '1';
      topButtons.style.pointerEvents = 'auto';
    }
    lastScrollY = currentY;
  });

  chainSelector.addEventListener('change', async (e) => {
    currentChain = e.target.value;
    await setupProvider();
  });

  walletBtn.addEventListener('click', async () => {
    if (!userAddress) {
      await connectWallet();
    } else {
      disconnectWallet();
    }
  });

  amountInput.addEventListener('input', getEstimate);
  tokenInSelect.addEventListener('change', getEstimate);
  tokenOutSelect.addEventListener('change', getEstimate);

  swapBtn.addEventListener('click', async () => {
    await executeSwap();
  });

  async function connectWallet() {
    if (!window.ethereum) return alert("ติดตั้ง MetaMask ก่อน");
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      walletBtn.textContent = `Disconnect Wallet (${shortAddress(userAddress)})`;
      await setupProvider();
    } catch (e) {
      console.error('Wallet connection error:', e);
    }
  }

  function disconnectWallet() {
    userAddress = null;
    walletBtn.textContent = 'Connect Wallet';
  }

  async function setupProvider() {
    const rpcUrl = rpcMap[currentChain];
    if (!rpcUrl) return;
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    if (userAddress && window.ethereum) {
      signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
    }
  }

  async function getEstimate() {
    const amount = amountInput.value;
    const tokenIn = tokenInSelect.value;
    const tokenOut = tokenOutSelect.value;
    if (!amount || !tokenIn || !tokenOut || tokenIn === tokenOut) {
      estimateEl.textContent = '';
      return;
    }

    try {
      const amountWei = ethers.utils.parseUnits(amount, 18);
      const url = `${ZEROX_API_BASE}/swap/v1/quote?buyToken=${tokenOut}&sellToken=${tokenIn}&sellAmount=${amountWei}`;
      const res = await fetch(url);
      const data = await res.json();

      const buyAmount = ethers.utils.formatUnits(data.buyAmount, 18);
      estimateEl.textContent = `Estimated: ${buyAmount} ${tokenOut}`;
    } catch (err) {
      console.error('Estimate error:', err);
      estimateEl.textContent = 'ไม่สามารถประเมินราคาได้';
    }
  }

  async function executeSwap() {
    const amount = amountInput.value;
    const tokenIn = tokenInSelect.value;
    const tokenOut = tokenOutSelect.value;
    const slippage = parseFloat(slippageInput.value || '1');
    if (!userAddress || !amount || !tokenIn || !tokenOut || tokenIn === tokenOut) return;

    try {
      const amountWei = ethers.utils.parseUnits(amount, 18);
      const url = `${ZEROX_API_BASE}/swap/v1/quote?buyToken=${tokenOut}&sellToken=${tokenIn}&sellAmount=${amountWei}&slippagePercentage=${slippage / 100}&takerAddress=${userAddress}`;

      const res = await fetch(url);
      const data = await res.json();

      const tx = await signer.sendTransaction({
        to: data.to,
        data: data.data,
        value: data.value ? ethers.BigNumber.from(data.value) : undefined,
        gasLimit: data.gas || 300000,
      });

      console.log('Swap success:', tx.hash);
      alert('Swap สำเร็จ! Tx: ' + tx.hash);
    } catch (err) {
      console.error('Swap error:', err);
      alert('เกิดข้อผิดพลาดในการ Swap');
    }
  }

  function shortAddress(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }
});





