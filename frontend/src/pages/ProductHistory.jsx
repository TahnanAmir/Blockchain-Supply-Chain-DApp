import { useState } from "react";

const ROLE_ICONS = { 0: "❓", 1: "🏭", 2: "🚛", 3: "🏪", 4: "👤" };
const ROLE_NAMES = ["None", "Manufacturer", "Distributor", "Retailer", "Customer"];

const STATUS_BADGE = {
  0: <span className="badge badge-manufactured">🏭 Manufactured</span>,
  1: <span className="badge badge-intransit">🚛 In Transit</span>,
  2: <span className="badge badge-atretailer">🏪 At Retailer</span>,
  3: <span className="badge badge-delivered">✅ Delivered</span>,
};

export default function ProductHistory({ contract }) {
  const [productId,  setProductId]  = useState("");
  const [loading,    setLoading]    = useState(false);
  const [product,    setProduct]    = useState(null);
  const [history,    setHistory]    = useState([]);
  const [roleCache,  setRoleCache]  = useState({});

  const fetchHistory = async () => {
    if (!productId) return;
    setLoading(true);
    setProduct(null);
    setHistory([]);
    setRoleCache({});
    try {
      const [p, hist] = await Promise.all([
        contract.getProduct(Number(productId)),
        contract.getProductHistory(Number(productId)),
      ]);
      if (Number(p.id) === 0) throw new Error("Not found");

      setProduct({
        id:           Number(p.id),
        name:         p.name,
        description:  p.description,
        currentOwner: p.currentOwner,
        status:       Number(p.status),
      });
      setHistory([...hist]);

      // resolve role for each address in history
      const cache = {};
      await Promise.all(hist.map(async addr => {
        try {
          const r = await contract.getRole(addr);
          cache[addr] = Number(r);
        } catch {
          cache[addr] = 0;
        }
      }));
      setRoleCache(cache);
    } catch {
      alert("Product not found or error fetching history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Audit Trail</div>
        <h1 className="page-title">Product <span>History</span></h1>
        <p className="page-subtitle">Muhammad Tahnan Aamir · Full on-chain chain-of-custody transparency</p>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", maxWidth: 480 }}>
        <input
          className="form-input"
          placeholder="Enter Product ID (e.g. 1)"
          type="number"
          min="1"
          value={productId}
          onChange={e => setProductId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchHistory()}
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary"
          onClick={fetchHistory}
          disabled={loading || !productId}
        >
          {loading ? <span className="spinner" /> : "🔍 Search"}
        </button>
      </div>

      {/* Empty prompt */}
      {!product && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">Enter a product ID to view its history</div>
          <div className="empty-sub">Track every ownership transfer on the blockchain</div>
        </div>
      )}

      {/* Results */}
      {product && (
        <div className="grid-2" style={{ alignItems: "start" }}>

          {/* Product details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card card-accent">
              <div className="card-label">Product Details</div>
              <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  { key: "ID",          val: `#${String(product.id).padStart(4, "0")}`, accent: true },
                  { key: "NAME",        val: product.name,        bold: true },
                  { key: "DESCRIPTION", val: product.description },
                ].map(row => (
                  <div key={row.key}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "0.63rem", color: "var(--text3)", marginBottom: "0.15rem" }}>
                      {row.key}
                    </div>
                    <div style={{
                      fontFamily: row.key === "ID" ? "var(--mono)" : undefined,
                      fontWeight: row.bold ? 700 : undefined,
                      fontSize: row.bold ? "1.05rem" : "0.85rem",
                      color: row.accent ? "var(--accent)" : "var(--text)",
                    }}>
                      {row.val}
                    </div>
                  </div>
                ))}

                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.63rem", color: "var(--text3)", marginBottom: "0.25rem" }}>
                    STATUS
                  </div>
                  {STATUS_BADGE[product.status]}
                </div>

                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.63rem", color: "var(--text3)", marginBottom: "0.15rem" }}>
                    CURRENT OWNER
                  </div>
                  <div className="hash-text">{product.currentOwner}</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card">
              <div className="card-label">Summary</div>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "2rem" }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.63rem", color: "var(--text3)" }}>TRANSFERS</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)" }}>
                    {history.length}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.63rem", color: "var(--text3)" }}>FINAL STATUS</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: product.status === 3 ? "var(--green)" : "var(--gold)" }}>
                    {product.status === 3 ? "✅" : "🔄"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-label" style={{ marginBottom: "1.25rem" }}>Chain of Custody</div>
            <div className="timeline">
              {history.map((addr, i) => {
                const r      = roleCache[addr] ?? 0;
                const isLast = i === history.length - 1;
                return (
                  <div className="timeline-item" key={i}>
                    <div className="timeline-spine">
                      <div className={`timeline-dot ${isLast ? "active" : ""}`}>{i + 1}</div>
                      {!isLast && <div className="timeline-line" />}
                    </div>
                    <div className="timeline-content">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "1rem" }}>{ROLE_ICONS[r]}</span>
                        <span className={`badge badge-${ROLE_NAMES[r].toLowerCase()}`} style={{ fontSize: "0.62rem" }}>
                          {ROLE_NAMES[r]}
                        </span>
                        {isLast && (
                          <span style={{ fontSize: "0.62rem", color: "var(--accent)", fontFamily: "var(--mono)" }}>
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="timeline-addr">{addr}</div>
                      <div className="timeline-label">
                        {i === 0
                          ? "Origin — Manufacturer registered this product"
                          : `Transfer #${i} — Received from previous owner`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
