document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const walletAddressEl = document.getElementById("wallet-address");
  const sidebar = document.getElementById("wallet-sidebar");
  const balanceList = document.getElementById("balance-list");
  const closeSidebarBtn = document.getElementById("close-sidebar");

  let provider;
  let signer;
  let userAddress;
  let isConnected = false;

  async function connectWallet() {
    try {
      if (typeof window.ethereum === "undefined") {
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
      openSidebar();
      loadBalances();
    } catch (error) {
      console.error("Connect Wallet Error:", error);
      alert("เกิดปัญหาในการเชื่อม Wallet");
    }
  }

  function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;
    isConnected = false;

    walletAddressEl.innerText = "⛔ ยังไม่ได้เชื่อมต่อ";
    connectBtn.innerText = "Connect Wallet";
    balanceList.innerHTML = "";
    closeSidebar();
  }

  function openSidebar() {
    sidebar.style.right = "0px";
  }

  function closeSidebar() {
    sidebar.style.right = "-320px";
  }

  async function loadBalances() {
    if (!userAddress) return;

    balanceList.innerHTML = "Loading...";

    try {
      const balanceMatic = await provider.getBalance(userAddress);
      const balanceMaticFormatted = ethers.utils.formatEther(balanceMatic);

      const tokens = [
        { symbol: "MATIC", address: null, decimals: 18 },
        { symbol: "COM", address: "0x83eac303EED75656297868A463603edaabe0DAA2", decimals: 2 },
        { symbol: "PRE", address: "0x057041064e59059a74719c6f590e2ebf45a05f77", decimals: 2 },
        // เพิ่มเติมตามต้องการ
      ];

      let html = `<p><strong>MATIC:</strong> ${balanceMaticFormatted}</p>`;

      for (const token of tokens) {
        if (!token.address) continue;

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
      balanceList.innerHTML = "Error loading balances";
      console.error(err);
    }
  }

  connectBtn.addEventListener("click", () => {
    if (!isConnected) {
      connectWallet();
    } else {
      disconnectWallet();
    }
  });

  closeSidebarBtn.addEventListener("click", closeSidebar);

  // Event listeners for account and chain changes
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        userAddress = accounts[0];
        walletAddressEl.innerText = `🔗 ${userAddress}`;
        loadBalances();
      } else {
        disconnectWallet();
      }
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  }
});







