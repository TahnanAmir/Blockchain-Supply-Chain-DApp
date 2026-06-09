import { useState } from "react";
import { AMOY_GAS, getContract } from "../utils/ethers";

export default function RegisterProduct({ role, showNotification }) {
  const [name,    setName]    = useState("");
  const [desc,    setDesc]    = useState("");
  const [loading, setLoading] = useState(false);
  const [lastTx,  setLastTx]  = useState(null);

  /* Role guard */
  if (role !== 1) {
    return (
      <div>
        <div className="page-header">
          <div className="page-eyebrow">Restricted</div>
          <h1 className="page-title">Register <span>Product</span></h1>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
          <div style={{ fontWeight: 700, color: "var(--red)" }}>Access Denied</div>
          <div style={{ color: "var(--text3)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Only Manufacturers can register new products.
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!name.trim() || !desc.trim())
      return showNotification("Fill in all fields", "error");
    try {
      setLoading(true);
      // always get a fresh contract instance with the current signer
      const contract = await getContract();
      const tx = await contract.registerProduct(name.trim(), desc.trim(), AMOY_GAS);
      showNotification("Transaction submitted, waiting for confirmation...");
      await tx.wait();
      setLastTx(tx.hash);
      showNotification("Product registered on-chain! ✅");
      setName("");
      setDesc("");
    } catch (e) {
      showNotification(e.reason || e.message || "Transaction failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    "Fill in product name and description",
    "Click Register — MetaMask will prompt for approval",
    "Product receives a unique on-chain ID",
    "Status is set to Manufactured automatically",
    "Transfer the product to a Distributor next",
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Manufacturer</div>
        <h1 className="page-title">Register <span>New Product</span></h1>
        <p className="page-subtitle">Muhammad Tahnan Aamir · Create a new product entry on the blockchain</p>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Form */}
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              className="form-input"
              placeholder="e.g. Premium Laptop Model X"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the product, batch number, specifications..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={4}
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !desc.trim()}
          >
            {loading
              ? <><span className="spinner" /> Processing...</>
              : "⛓ Register on Blockchain"}
          </button>

          {/* TX receipt */}
          {lastTx && (
            <div style={{
              marginTop: "1.25rem",
              padding: "1rem",
              background: "rgba(0,227,150,0.06)",
              border: "1px solid rgba(0,227,150,0.2)",
              borderRadius: "var(--radius)"
            }}>
              <div className="card-label" style={{ color: "var(--green)", marginBottom: "0.4rem" }}>
                ✓ Transaction Confirmed
              </div>
              <div className="hash-text">{lastTx}</div>
              <a
                href={`https://amoy.polygonscan.com/tx/${lastTx}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  fontFamily: "var(--mono)"
                }}
              >
                View on PolygonScan →
              </a>
            </div>
          )}
        </div>

        {/* Info sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div className="card-label">How It Works</div>
            <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {steps.map((text, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.65rem",
                    color: "var(--accent)",
                    background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    borderRadius: "4px",
                    padding: "0.15rem 0.4rem",
                    flexShrink: 0,
                    marginTop: "2px"
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "0.83rem", color: "var(--text2)", lineHeight: 1.5 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-label">Supply Chain Flow</div>
            <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { icon: "🏭", label: "Manufacturer", desc: "Registers product",  active: true },
                { icon: "🚛", label: "Distributor",  desc: "Receives & ships"              },
                { icon: "🏪", label: "Retailer",     desc: "Stocks product"                },
                { icon: "👤", label: "Customer",     desc: "Final delivery"                },
              ].map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    opacity: n.active ? 1 : 0.45
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{n.icon}</span>
                  <div>
                    <div style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: n.active ? "var(--accent)" : "var(--text2)"
                    }}>
                      {n.label}
                    </div>
                    <div style={{
                      fontSize: "0.72rem",
                      color: "var(--text3)",
                      fontFamily: "var(--mono)"
                    }}>
                      {n.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
