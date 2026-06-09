import { useState } from "react";
import { AMOY_GAS, getContract } from "../utils/ethers";

const STATUS_BADGE = {
  0: <span className="badge badge-manufactured">🏭 Manufactured</span>,
  1: <span className="badge badge-intransit">🚛 In Transit</span>,
  2: <span className="badge badge-atretailer">🏪 At Retailer</span>,
  3: <span className="badge badge-delivered">✅ Delivered</span>,
};

const ROLE_NAMES = ["None", "Manufacturer", "Distributor", "Retailer", "Customer"];

export default function TransferProduct({ contract, account, role, showNotification }) {
  const [productId,    setProductId]    = useState("");
  const [toAddress,    setToAddress]    = useState("");
  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(false);
  const [product,      setProduct]      = useState(null);
  const [receiverRole, setReceiverRole] = useState(null);
  const [lastTx,       setLastTx]       = useState(null);

  /* Role guard */
  if (![1, 2, 3].includes(role)) {
    return (
      <div>
        <div className="page-header">
          <div className="page-eyebrow">Restricted</div>
          <h1 className="page-title">Transfer <span>Product</span></h1>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
          <div style={{ fontWeight: 700, color: "var(--red)" }}>Access Denied</div>
          <div style={{ color: "var(--text3)", marginTop: "0.5rem" }}>
            Only Manufacturer, Distributor, or Retailer can transfer products.
          </div>
        </div>
      </div>
    );
  }

  /* Fetch product details */
  const fetchProduct = async () => {
    if (!productId) return;
    setFetching(true);
    setProduct(null);
    setReceiverRole(null);
    try {
      const p = await contract.getProduct(Number(productId));
      if (Number(p.id) === 0) return showNotification("Product not found", "error");
      setProduct({
        id: Number(p.id),
        name: p.name,
        description: p.description,
        currentOwner: p.currentOwner,
        status: Number(p.status),
      });
    } catch {
      showNotification("Product not found", "error");
    } finally {
      setFetching(false);
    }
  };

  /* Look up receiver role on blur */
  const checkReceiver = async () => {
    if (!toAddress || toAddress.length < 42) return;
    try {
      const r = await contract.getRole(toAddress);
      setReceiverRole(Number(r));
    } catch {
      setReceiverRole(null);
    }
  };

  /* Transfer */
  const handleTransfer = async () => {
    if (!product || !toAddress)
      return showNotification("Fill in all fields", "error");
    try {
      setLoading(true);
      const c  = await getContract();
      const tx = await c.transferProduct(product.id, toAddress, AMOY_GAS);
      showNotification("Transaction submitted, waiting...");
      await tx.wait();
      setLastTx(tx.hash);
      showNotification("Product transferred successfully! ✅");
      setProduct(null);
      setProductId("");
      setToAddress("");
      setReceiverRole(null);
    } catch (e) {
      showNotification(e.reason || e.message || "Transfer failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = product &&
    product.currentOwner.toLowerCase() === account.toLowerCase();

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Transfer</div>
        <h1 className="page-title">Transfer <span>Product</span></h1>
        <p className="page-subtitle">Muhammad Tahnan Aamir · Move product to the next supply chain participant</p>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="form-card">

          {/* ── Step 1: find product ── */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{
              fontFamily: "var(--mono)",
              fontSize: "0.65rem",
              color: "var(--accent)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.75rem"
            }}>
              Step 1 · Find Product
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                className="form-input"
                placeholder="Product ID (e.g. 1)"
                type="number"
                min="1"
                value={productId}
                onChange={e => setProductId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchProduct()}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-secondary"
                onClick={fetchProduct}
                disabled={fetching || !productId}
              >
                {fetching ? <span className="spinner" /> : "Fetch"}
              </button>
            </div>
          </div>

          {/* Product preview */}
          {product && (
            <div style={{
              padding: "1rem",
              background: "var(--bg3)",
              border: `1px solid ${isOwner ? "var(--border2)" : "rgba(255,69,96,0.3)"}`,
              borderRadius: "var(--radius)",
              marginBottom: "1.5rem"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "0.5rem"
              }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--accent)" }}>
                  #{String(product.id).padStart(4, "0")}
                </span>
                {STATUS_BADGE[product.status]}
              </div>
              <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{product.name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text3)", marginBottom: "0.6rem" }}>
                {product.description}
              </div>
              <div style={{
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                color: isOwner ? "var(--green)" : "var(--red)"
              }}>
                {isOwner ? "✓ You are the current owner" : "✕ You do not own this product"}
              </div>
            </div>
          )}

          {/* ── Step 2: recipient ── */}
          {product && isOwner && product.status !== 3 && (
            <div>
              <div style={{
                fontFamily: "var(--mono)",
                fontSize: "0.65rem",
                color: "var(--accent)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "0.75rem"
              }}>
                Step 2 · Enter Recipient
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Wallet Address</label>
                <input
                  className="form-input"
                  placeholder="0x..."
                  value={toAddress}
                  onChange={e => { setToAddress(e.target.value); setReceiverRole(null); }}
                  onBlur={checkReceiver}
                />
                {receiverRole !== null && (
                  <div style={{
                    marginTop: "0.4rem",
                    fontSize: "0.75rem",
                    fontFamily: "var(--mono)",
                    color: receiverRole === 0 ? "var(--red)" : "var(--green)"
                  }}>
                    {receiverRole === 0
                      ? "✕ This address has no role assigned"
                      : `✓ Receiver role: ${ROLE_NAMES[receiverRole]}`}
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary btn-full"
                onClick={handleTransfer}
                disabled={loading || !toAddress || receiverRole === 0}
              >
                {loading
                  ? <><span className="spinner" /> Transferring...</>
                  : "⛓ Transfer Product"}
              </button>
            </div>
          )}

          {/* Already delivered */}
          {product && product.status === 3 && (
            <div style={{
              padding: "1rem",
              background: "rgba(0,227,150,0.06)",
              border: "1px solid rgba(0,227,150,0.2)",
              borderRadius: "var(--radius)",
              textAlign: "center",
              color: "var(--green)",
              fontSize: "0.88rem"
            }}>
              ✅ This product has been delivered and cannot be transferred further.
            </div>
          )}

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
                ✓ Transfer Confirmed
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

        {/* Rules sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div className="card-label">Transfer Rules</div>
            <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { from: "🏭 Manufacturer", to: "🚛 Distributor", note: "Status → In Transit" },
                { from: "🚛 Distributor",  to: "🏪 Retailer",    note: "Status → At Retailer"  },
                { from: "🏪 Retailer",     to: "👤 Customer",    note: "Status → Delivered"  },
              ].map((r, i) => (
                <div key={i} style={{
                  padding: "0.75rem",
                  background: "var(--bg3)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--text)" }}>
                    {r.from} → {r.to}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text3)", fontFamily: "var(--mono)", marginTop: "0.2rem" }}>
                    {r.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: "0.85rem 1rem",
            background: "rgba(245,200,66,0.06)",
            border: "1px solid rgba(245,200,66,0.2)",
            borderRadius: "var(--radius)",
            fontSize: "0.78rem",
            color: "var(--gold)",
            fontFamily: "var(--mono)",
            lineHeight: 1.6
          }}>
            ⚠ You can only transfer products you own, and only to the correct next role in the supply chain.
          </div>
        </div>
      </div>
    </div>
  );
}
