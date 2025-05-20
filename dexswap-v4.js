// dexs...js (v4)
let provider, signer, userAddress;
let isConnected = false;

const connectBtn = document.getElementById("connectBtn");
const walletAddressEl = document.getElementById("wallet-address");
const sidebar = document.getElementById("wallet-sidebar");
const sidebarAddress = document.getElementById("sidebar-address");
const balanceList = document.getElementById("balance-list");
const closeSidebarBtn = document.getElementById("close-sidebar");

connectBtn.onclick = async () => {
  if (!isConnected) {
    await connectWallet();
  } else {
    toggleSidebar();
  }
};

closeSidebarBtn.onclick = closeSidebar;

async function connectWallet() {
  if (!window.ethereum) {
    alert("กรุณาติดตั้ง MetaMask");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();
  isConnected = true;

  walletAddressEl.innerText = `🔗 ${userAddress}`;
  connectBtn.innerText = "✅ Connected";
  sidebarAddress.innerText = userAddress;

  openSidebar();
  loadBalances();

  ethereum.on("accountsChanged", () => window.location.reload());
  ethereum.on("chainChanged", () => window.location.reload());
}

function openSidebar() {
  sidebar.style.right = "0px";
  loadBalances();
}

function closeSidebar() {
  sidebar.style.right = "-320px";
}

function toggleSidebar() {
  if (sidebar.style.right === "0px") {
    closeSidebar();
  } else {
    openSidebar();
  }
}

async function loadBalances() {
  if (!userAddress) return;

  try {
    const balanceMatic = await provider.getBalance(userAddress);
    const balanceFormatted = ethers.utils.formatEther(balanceMatic);
    let html = `<p><strong>MATIC:</strong> ${balanceFormatted}</p>`;
    balanceList.innerHTML = html;
  } catch (err) {
    console.error("Load balance error:", err);
    balanceList.innerHTML = "Error loading balances";
  }
}

