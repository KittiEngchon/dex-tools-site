
let provider, signer, userAddress, isConnected = false, isRequesting = false;
let selectedSide = null;

// Connect Wallet
async function connectWallet() {
  if (isRequesting) return;
  isRequesting = true;
  try {
    if (!window.ethereum) return alert("กรุณาติดตั้ง MetaMask");

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    isConnected = true;

    document.getElementById("wallet-button").innerText = "Disconnect Wallet";
    document.getElementById("wallet-address").innerText = `🔗 ${userAddress}`;
    document.getElementById("sidebar-wallet-address").innerText = `🔗 ${userAddress}`;
    openSidebar();
    loadBalances();
  } catch (err) {
    console.error("Connect Wallet Error:", err);
    alert("เชื่อมต่อ Wallet ไม่สำเร็จ หรือกำลังดำเนินการอยู่");
  } finally {
    isRequesting = false;
  }
}

function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  isConnected = false;

  document.getElementById("wallet-button").innerText = "Connect Wallet";
  document.getElementById("wallet-address").innerText = "⛔ ยังไม่ได้เชื่อมต่อ";
  document.getElementById("sidebar-wallet-address").innerText = "⏳ รอกำหนดที่อยู่...";
  document.getElementById("balance-list").innerHTML = "";
  closeSidebar();
}

// Toggle Sidebar
document.getElementById("wallet-button").addEventListener("click", () => {
  if (!isConnected) connectWallet();
  else disconnectWallet();
});
document.getElementById("close-sidebar").addEventListener("click", closeSidebar);

function openSidebar() {
  document.getElementById("wallet-sidebar").style.right = "0px";
}
function closeSidebar() {
  document.getElementById("wallet-sidebar").style.right = "-320px";
}

// Switch Tabs
function switchTab(tab) {
  document.querySelectorAll(".tab-content").forEach(div => div.style.display = "none");
  document.querySelector(`#tab-${tab}`).style.display = "block";

  document.querySelectorAll(".nav-menu button").forEach(btn => btn.classList.remove("active"));
  document.querySelector(`.nav-menu button[onclick*="${tab}"]`).classList.add("active");
}

// Token List Modal
function openTokenModal(side) {
  selectedSide = side;
  document.getElementById("tokenSearch").value = "";
  renderTokenList(tokenList); // reset
  document.getElementById("tokenModal").style.display = "flex";
}
function closeTokenModal() {
  document.getElementById("tokenModal").style.display = "none";
}
window.onclick = function(event) {
  if (event.target === document.getElementById("tokenModal")) closeTokenModal();
}

// Render Token List (modal)
function renderTokenList(tokens) {
  const container = document.getElementById("tokenListPopup");
  container.innerHTML = "";
  tokens.forEach(token => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${token.symbol}</strong> - ${token.name}`;
    div.onclick = () => selectToken(token);
    container.appendChild(div);
  });
}

// Filter Token Search
function filterTokens() {
  const search = document.getElementById("tokenSearch").value.toLowerCase();
  const filtered = tokenList.filter(t =>
    t.symbol.toLowerCase().includes(search) ||
    t.name.toLowerCase().includes(search) ||
    t.address.toLowerCase().includes(search)
  );
  renderTokenList(filtered);
}

// Select Token and fill inputs
function selectToken(token) {
  document.getElementById(`${selectedSide}Token`).value = token.address;
  document.getElementById(`${selectedSide}TokenDisplay`).value = token.symbol;
  closeTokenModal();
}

// Load Balance (tokens only)
async function loadBalances() {
  if (!provider || !userAddress || !tokenList) return;
  const container = document.getElementById("balance-list");
  container.innerHTML = "Loading...";
  let html = "";

  for (const token of tokenList) {
    try {
      const contract = new ethers.Contract(token.address, [
        "function balanceOf(address) view returns (uint256)"
      ], provider);
      const raw = await contract.balanceOf(userAddress);
      const formatted = ethers.utils.formatUnits(raw, token.decimals);
      html += `<p><strong>${token.symbol}:</strong> ${formatted}</p>`;
    } catch {
      html += `<p><strong>${token.symbol}:</strong> ⚠️ Error</p>`;
    }
  }
  container.innerHTML = html;
}

// Load tokenList
let tokenList = [];
async function loadTokenList() {
  try {
    const res = await fetch("token-list.json");
    tokenList = await res.json();
  } catch (err) {
    console.error("Load token list failed", err);
    tokenList = [];
  }
}
loadTokenList();
