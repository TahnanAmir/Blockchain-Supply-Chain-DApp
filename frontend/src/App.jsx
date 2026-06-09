import { useState, useEffect } from "react";
import { getContract } from "./utils/ethers";
import Dashboard from "./pages/Dashboard";
import RegisterProduct from "./pages/RegisterProduct";
import TransferProduct from "./pages/TransferProduct";
import ProductHistory from "./pages/ProductHistory";
import AssignRole from "./pages/AssignRole";
import AllProducts from "./pages/AllProducts";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ConnectWallet from "./components/ConnectWallet";
import "./styles/globals.css";

export const ROLE_NAMES = ["None", "Manufacturer", "Distributor", "Retailer", "Customer"];

export default function App() {
  const [account, setAccount]     = useState(null);
  const [role, setRole]           = useState(0);
  const [contract, setContract]   = useState(null);
  const [page, setPage]           = useState("dashboard");
  const [loading, setLoading]     = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return showNotification("MetaMask not found!", "error");
    try {
      setLoading(true);
      const _contract = await getContract();
      const signer    = await _contract.runner; // signer attached by getContract
      const addr      = await _contract.runner.getAddress();
      const userRole  = await _contract.getRole(addr);
      setContract(_contract);
      setAccount(addr);
      setRole(Number(userRole));
      showNotification(`Connected as ${ROLE_NAMES[Number(userRole)]}`);
    } catch (e) {
      showNotification(e.message || "Connection failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Re-sync when user switches accounts in MetaMask
  useEffect(() => {
    if (!window.ethereum) return;
    const handleChange = () => {
      setAccount(null);
      setContract(null);
      setRole(0);
      setPage("dashboard");
    };
    window.ethereum.on("accountsChanged", handleChange);
    window.ethereum.on("chainChanged", handleChange);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleChange);
      window.ethereum.removeListener("chainChanged", handleChange);
    };
  }, []);

  const pageProps = { contract, account, role, showNotification, setPage, ROLE_NAMES };

  const renderPage = () => {
    if (!account) return <ConnectWallet connectWallet={connectWallet} loading={loading} />;
    switch (page) {
      case "dashboard": return <Dashboard    {...pageProps} />;
      case "register":  return <RegisterProduct {...pageProps} />;
      case "transfer":  return <TransferProduct {...pageProps} />;
      case "history":   return <ProductHistory  {...pageProps} />;
      case "assign":    return <AssignRole      {...pageProps} />;
      case "products":  return <AllProducts     {...pageProps} />;
      default:          return <Dashboard    {...pageProps} />;
    }
  };

  return (
    <div className="app-root">
      <div className="grid-bg" />

      <Navbar
        account={account}
        role={role}
        ROLE_NAMES={ROLE_NAMES}
        page={page}
        setPage={setPage}
      />

      <main className="main-content">
        {renderPage()}
      </main>

      <Footer />

      {notification && (
        <div className={`toast toast-${notification.type}`}>
          <span className="toast-icon">{notification.type === "success" ? "✓" : "✕"}</span>
          {notification.msg}
        </div>
      )}
    </div>
  );
}
