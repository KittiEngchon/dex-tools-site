document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const walletAddressEl = document.getElementById("wallet-address");

  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      try {
        if (typeof window.ethereum === "undefined") {
          alert("กรุณาติดตั้ง MetaMask");
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        walletAddressEl.innerText = `🔗 ${address}`;
        connectBtn.innerText = "✅ Connected";
      } catch (error) {
        console.error("Connect Wallet Error:", error);
        alert("เกิดปัญหาในการเชื่อม Wallet");
      }
    });
  }
});
let provider;
let signer;
let userAddress;
let isConnected = false;

const walletButton = document.getElementById('wallet-button');
const sidebar = document.getElementById('wallet-sidebar');
const balanceList = document.getElementById('balance-list');
const closeSidebarBtn = document.getElementById('close-sidebar');

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    isConnected = true;
    walletButton.textContent = 'Disconnect Wallet';
    openSidebar();
    loadBalances();
  } catch (err) {
    console.error('Connect Wallet Error:', err);
  }
}

function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  isConnected = false;
  walletButton.textContent = 'Connect Wallet';
  balanceList.innerHTML = '';
  closeSidebar();
}

walletButton.onclick = () => {
  if (!isConnected) {
    connectWallet();
  } else {
    // toggle sidebar
    if (sidebar.style.right === '0px') {
      closeSidebar();
    } else {
      openSidebar();
    }
  }
};

closeSidebarBtn.onclick = closeSidebar;

function openSidebar() {
  sidebar.style.right = '0px';
  if (isConnected) loadBalances();
}

function closeSidebar() {
  sidebar.style.right = '-320px';
}

async function loadBalances() {
  if (!userAddress) return;

  balanceList.innerHTML = 'Loading...';

  try {
    const balanceMatic = await provider.getBalance(userAddress);
    const balanceMaticFormatted = ethers.utils.formatEther(balanceMatic);

    // ตัวอย่าง token list (ปรับตามของคุณ)
    const tokens = [
      { symbol: 'MATIC', address: null, decimals: 18 },
      { symbol: 'COM', address: '0x83eac303EED75656297868A463603edaabe0DAA2', decimals: 2 },
      { symbol: 'PRE', address: '0x057041064e59059a74719c6f590e2ebf45a05f77', decimals: 2 },
      // เพิ่มเติมตามต้องการ
    ];

    let html = `<p><strong>MATIC:</strong> ${balanceMaticFormatted}</p>`;

    for (const token of tokens) {
      if (!token.address) continue; // MATIC ไม่มี contract address

      try {
        const tokenContract = new ethers.Contract(token.address, [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)",
        ], provider);

        const balanceRaw = await tokenContract.balanceOf(userAddress);
        const decimals = token.decimals || await tokenContract.decimals();
        const balanceFormatted = ethers.utils.formatUnits(balanceRaw, decimals);

        html += `<p><strong>${token.symbol}:</strong> ${balanceFormatted}</p>`;
      } catch {
        html += `<p><strong>${token.symbol}:</strong> Error loading balance</p>`;
      }
    }

    balanceList.innerHTML = html;

  } catch (err) {
    balanceList.innerHTML = 'Error loading balances';
    console.error(err);
  }
}
