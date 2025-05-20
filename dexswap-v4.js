document.addEventListener("DOMContentLoaded", () => {
  const walletButton = document.getElementById("wallet-button");
  const walletAddressEl = document.getElementById("wallet-address");
  const sidebar = document.getElementById("wallet-sidebar");
  const balanceList = document.getElementById("balance-list");
  const closeSidebarBtn = document.getElementById("close-sidebar");

  let provider;
  let signer;
  let userAddress = null;
  let isConnected = false;

  // เชื่อมต่อ wallet
  async function connectWallet() {
    if (!window.ethereum) {
      alert("กรุณาติดตั้ง MetaMask");
      return;
    }
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      isConnected = true;

      walletAddressEl.innerText = `🔗 ${userAddress}`;
      walletButton.textContent = "Disconnect Wallet";

      openSidebar();
      await loadBalances();
    } catch (error) {
      console.error("Connect Wallet Error:", error);
      alert("เกิดปัญหาในการเชื่อม Wallet");
    }
  }

  // ตัดการเชื่อมต่อ wallet
  function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;
    isConnected = false;
    walletAddressEl.innerText = "⛔ ยังไม่ได้เชื่อมต่อ";
    walletButton.textContent = "Connect Wallet";
    balanceList.innerHTML = "";
    closeSidebar();
  }

  // เปิด sidebar
  function openSidebar() {
    sidebar.style.right = "0px";
    if (isConnected) loadBalances();
  }

  // ปิด sidebar
  function closeSidebar() {
    sidebar.style.right = "-320px";
  }

  // โหลดยอด balance ของ wallet
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
        // เพิ่ม token ที่ต้องการได้ที่นี่
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
      balanceList.innerHTML = "Error loading balances";
      console.error(err);
    }
  }

  // Event: กดปุ่ม connect/disconnect
  walletButton.onclick = () => {
    if (!isConnected) {
      connectWallet();
    } else {
      // disconnect wallet
      disconnectWallet();
    }
  };

  closeSidebarBtn.onclick = closeSidebar;

  // ฟัง event เมื่อเปลี่ยนบัญชีใน MetaMask
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        userAddress = accounts[0];
        walletAddressEl.innerText = `🔗 ${userAddress}`;
        loadBalances();
      }
    });

    // ฟัง event เมื่อเปลี่ยน network (chain)
    window.ethereum.on("chainChanged", () => {
      // โหลดซ้ำหน้า เพื่อรีเซ็ตสถานะตาม chain ใหม่
      window.location.reload();
    });
  }
});
