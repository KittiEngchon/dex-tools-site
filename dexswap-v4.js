document.addEventListener("DOMContentLoaded", () => {
  const walletButton = document.getElementById('wallet-button');
  const sidebar = document.getElementById('wallet-sidebar');
  const balanceList = document.getElementById('balance-list');
  const closeSidebarBtn = document.getElementById('close-sidebar');
  const walletAddress = document.getElementById('wallet-address');
  const walletAddressSidebar = document.getElementById('wallet-address-sidebar');
  const chainSelector = document.getElementById('chainSelector');
  const swapBtn = document.getElementById('swapBtn');

  let provider = null;
  let signer = null;
  let userAddress = null;
  let currentChain = chainSelector.value;

  // RPC URL สำหรับแต่ละ chain
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

  swapBtn.disabled = true; // ปิดปุ่มก่อนเชื่อมต่อ

  walletButton.onclick = async () => {
    if (!userAddress) {
      await connectWallet();
    } else {
      toggleSidebar();
    }
  };

  closeSidebarBtn.onclick = () => {
    sidebar.style.right = "-320px";
  };

  chainSelector.addEventListener("change", async (e) => {
    currentChain = e.target.value;
    if (userAddress) {
      await setupProvider();
      await loadBalances();
    }
  });

  async function connectWallet() {
    if (!window.ethereum) {
      alert("กรุณาติดตั้ง MetaMask ก่อนใช้งาน");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await setupProvider();

      signer = provider.getSigner();
      userAddress = await signer.getAddress();

      walletAddress.textContent = `🔗 ${userAddress}`;
      walletAddressSidebar.textContent = `🔗 ${userAddress}`;
      walletButton.textContent = "Disconnect Wallet";
      swapBtn.disabled = false;
      sidebar.style.right = "0px";

      await loadBalances();

      // ฟัง event เปลี่ยนบัญชีหรือเชน
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          userAddress = accounts[0];
          walletAddress.textContent = `🔗 ${userAddress}`;
          walletAddressSidebar.textContent = `🔗 ${userAddress}`;
          await loadBalances();
        }
      });

      window.ethereum.on("chainChanged", async (chainIdHex) => {
        const chainId = parseInt(chainIdHex, 16);
        const newChain = getChainNameByChainId(chainId);
        if (newChain && newChain !== currentChain) {
          currentChain = newChain;
          chainSelector.value = newChain;
          await setupProvider();
          await loadBalances();
        }
      });
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อ Wallet ได้");
      console.error(err);
    }
  }

  function disconnectWallet() {
    userAddress = null;
    walletAddress.textContent = "⛔ ยังไม่ได้เชื่อมต่อ";
    walletAddressSidebar.textContent = "";
    walletButton.textContent = "Connect Wallet";
    balanceList.innerHTML = "";
    swapBtn.disabled = true;
    sidebar.style.right = "-320px";
  }

  async function setupProvider() {
    try {
      const metaChainIdHex = await window.ethereum.request({ method: "eth_chainId" });
      const metaChainId = parseInt(metaChainIdHex, 16);
      const selectedChainId = getChainIdByChainName(currentChain);

      if (metaChainId === selectedChainId) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        const rpcUrl = rpcMap[currentChain];
        if (!rpcUrl) throw new Error("RPC URL ไม่ถูกต้องสำหรับ chain นี้");
        provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      }
    } catch (e) {
      // fallback ใช้ provider ของ MetaMask เสมอ
      provider = new ethers.providers.Web3Provider(window.ethereum);
    }
  }

  async function loadBalances() {
    if (!userAddress || !provider) return;

    balanceList.innerHTML = "กำลังโหลดยอดคงเหลือ...";

    try {
      const balance = await provider.getBalance(userAddress);
      let tokenName = "ETH";
      if (["polygon", "bsc", "arbitrum", "base", "linea", "pulsechain", "chronos"].includes(currentChain)) {
        tokenName = currentChain === "bsc" ? "BNB" : (currentChain === "polygon" ? "MATIC" : "ETH");
      }
      const formatted = ethers.utils.formatEther(balance);
      balanceList.innerHTML = `<p><strong>${tokenName}:</strong> ${formatted}</p>`;
    } catch (err) {
      balanceList.innerHTML = "เกิดข้อผิดพลาดในการโหลดยอดคงเหลือ";
      console.error(err);
    }
  }

  function toggleSidebar() {
    sidebar.style.right = sidebar.style.right === "0px" ? "-320px" : "0px";
  }

  function getChainIdByChainName(chainName) {
    const map = {
      ethereum: 1,
      polygon: 137,
      bsc: 56,
      arbitrum: 42161,
      base: 8453,
      linea: 59140,
      pulsechain: 369,
      chronos: 25,
    };
    return map[chainName] || 1;
  }

  function getChainNameByChainId(chainId) {
    const map = {
      1: "ethereum",
      137: "polygon",
      56: "bsc",
      42161: "arbitrum",
      8453: "base",
      59140: "linea",
      369: "pulsechain",
      25: "chronos",
    };
    return map[chainId] || null;
  }
});





