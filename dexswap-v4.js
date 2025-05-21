document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn") || document.getElementById("wallet-button");
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

  async function swap() {
    const fromTokenAddress = document.getElementById("fromToken").value;
    const toTokenAddress = document.getElementById("toToken").value;
    const amount = document.getElementById("amount").value;
    const slippage = document.getElementById("slippage").value;

    if (!fromTokenAddress || !toTokenAddress || !amount || !userAddress) {
      alert("กรุณาเลือกเหรียญและกรอกจำนวนให้ครบถ้วน");
      return;
    }

    const routerAddress = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
    const routerABI = [
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
    ];

    const tokenABI = [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) public view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];

    const router = new ethers.Contract(routerAddress, routerABI, signer);
    const fromToken = new ethers.Contract(fromTokenAddress, tokenABI, signer);

    const decimals = token.decimals; // ใช้จาก JSON เท่านั้น ไม่เรียกบน chain
    const amountIn = ethers.utils.parseUnits(amount, decimals);

    const allowance = await fromToken.allowance(userAddress, routerAddress);
    if (allowance.lt(amountIn)) {
      const approveTx = await fromToken.approve(routerAddress, ethers.constants.MaxUint256);
      await approveTx.wait();
    }

    const path = [fromTokenAddress, toTokenAddress];
    const amountsOut = await router.getAmountsOut(amountIn, path);
    const amountOutMin = amountsOut[1].mul(100 - slippage).div(100);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const tx = await router.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      userAddress,
      deadline
    );
    await tx.wait();

    alert("Swap สำเร็จ!");
  }

  connectBtn.addEventListener("click", () => {
    if (!isConnected) {
      connectWallet();
    } else {
      disconnectWallet();
    }
  });

  closeSidebarBtn.addEventListener("click", closeSidebar);
  document.getElementById("swapBtn").addEventListener("click", swap);

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








