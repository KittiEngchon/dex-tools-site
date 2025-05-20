document.addEventListener("DOMContentLoaded", () => {
  const walletButton = document.getElementById('wallet-button');
  const sidebar = document.getElementById('wallet-sidebar');
  const balanceList = document.getElementById('balance-list');
  const closeSidebarBtn = document.getElementById('close-sidebar');
  const walletAddress = document.getElementById('wallet-address');
  const walletAddressSidebar = document.getElementById('wallet-address-sidebar');

  let provider, signer, userAddress, isConnected = false;

  if (!walletButton || !sidebar || !balanceList || !closeSidebarBtn) {
    console.error("❌ บาง element ไม่พบใน DOM");
    return;
  }

  walletButton.onclick = async () => {
    if (!isConnected) {
      await connectWallet();
    } else {
      toggleSidebar();
    }
  };

  closeSidebarBtn.onclick = () => {
    sidebar.style.right = '-320px';
  };

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

      walletButton.textContent = 'Disconnect Wallet';
      walletAddress.textContent = `🔗 ${userAddress}`;
      walletAddressSidebar.textContent = `🔗 ${userAddress}`;
      sidebar.style.right = '0px';
      await loadBalances();
    } catch (err) {
      console.error("Connect Wallet Error:", err);
    }
  }

  function toggleSidebar() {
    sidebar.style.right = (sidebar.style.right === '0px') ? '-320px' : '0px';
  }

  async function loadBalances() {
    if (!userAddress || !provider) return;
    try {
      const balance = await provider.getBalance(userAddress);
      const formatted = ethers.utils.formatEther(balance);
      balanceList.innerHTML = `<p><strong>MATIC:</strong> ${formatted}</p>`;
    } catch (err) {
      balanceList.innerHTML = "Error loading balance";
    }
  }
});


