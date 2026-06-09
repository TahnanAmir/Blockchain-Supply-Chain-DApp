import { useState, useEffect } from "react";

const ROLE_ICONS  = ["❓", "🏭", "🚛", "🏪", "👤"];

const STATUS_BADGE = {
  0: <span className="badge badge-manufactured">🏭 Manufactured</span>,
  1: <span className="badge badge-intransit">🚛 In Transit</span>,
  2: <span className="badge badge-atretailer">🏪 At Retailer</span>,
  3: <span className="badge badge-delivered">✅ Delivered</span>,
};

export default function Dashboard({ contract, account, role, ROLE_NAMES, setPage }) {
  const [stats,   setStats]   = useState({ total: 0, manufactured: 0, inTransit: 0, atRetailer: 0, delivered: 0 });
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (contract) loadStats(); }, [contract]);

  const loadStats = async () => {
    try {
      const count = Number(await contract.productCounter());
      let manufactured = 0, inTransit = 0, atRetailer = 0, delivered = 0;
      const all = [];

      for (let i = 1; i <= count; i++) {
        const p = await contract.getProduct(i);
        const s = Number(p.status);
        if (s === 0) manufactured++;
        else if (s === 1) inTransit++;
        else if (s === 2) atRetailer++;
        else delivered++;
        all.push({
          id: Number(p.id),
          name: p.name,
          status: s,
          currentOwner: p.currentOwner,
        });
      }

      setStats({ total: count, manufactured, inTransit, atRetailer, delivered });
      // show last 5
      setRecent(all.slice(-5).reverse());
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: "Total Products", value: stats.total,        cls: "accent" },
    { label: "Manufactured",   value: stats.manufactured, cls: ""       },
    { label: "In Transit",     value: stats.inTransit,    cls: "gold"   },
    { label: "At Retailer",    value: stats.atRetailer,   cls: ""   },
    { label: "Delivered",      value: stats.delivered,    cls: "green"  },
  ];

  const chainNodes = [
    { icon: "🏭", label: "Manufacturer", roleId: 1 },
    null,
    { icon: "🚛", label: "Distributor",  roleId: 2 },
    null,
    { icon: "🏪", label: "Retailer",     roleId: 3 },
    null,
    { icon: "👤", label: "Customer",     roleId: 4 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-eyebrow">Overview</div>
        <h1 className="page-title">Supply Chain <span>Dashboard</span></h1>
        <p className="page-subtitle">Muhammad Tahnan Aamir · Polygon Amoy</p>
      </div>

      {/* Chain flow */}
      <div className="chain-flow">
        {chainNodes.map((node, i) =>
          node ? (
            <div className={`chain-node ${role === node.roleId ? "active" : ""}`} key={i}>
              <div className="chain-node-icon">{node.icon}</div>
              <div className="chain-node-label">{node.label}</div>
              {role === node.roleId && (
                <span style={{ fontSize: "0.6rem", color: "var(--accent)", fontFamily: "var(--mono)" }}>
                  YOU
                </span>
              )}
            </div>
          ) : (
            <div className="chain-arrow" key={i} />
          )
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statsCards.map(s => (
          <div className="card card-accent" key={s.label}>
            <div className="card-label">{s.label}</div>
            <div className={`card-value ${s.cls}`}>{loading ? "—" : s.value}</div>
          </div>
        ))}
      </div>

      {/* Account + Role */}
      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        <div className="card">
          <div className="card-label">Connected Account</div>
          <div style={{
            fontFamily: "var(--mono)",
            fontSize: "0.82rem",
            color: "var(--text)",
            wordBreak: "break-all",
            marginTop: "0.5rem"
          }}>
            {account}
          </div>
        </div>

        <div className="card">
          <div className="card-label">Your Role</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "2rem" }}>{ROLE_ICONS[role]}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
                {ROLE_NAMES[role]}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text3)", fontFamily: "var(--mono)" }}>
                Role ID: {role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent products */}
      <div className="section-title">Recent Products</div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{
            margin: "0 auto",
            width: 24, height: 24,
            borderColor: "var(--border2)",
            borderTopColor: "var(--accent)"
          }} />
        </div>
      ) : recent.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-title">No products yet</div>
          <div className="empty-sub">Register the first product to get started</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Current Owner</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id}>
                  <td>
                    <span style={{ color: "var(--accent)" }}>
                      #{String(p.id).padStart(4, "0")}
                    </span>
                  </td>
                  <td style={{ color: "var(--text)", fontWeight: 600 }}>{p.name}</td>
                  <td>{STATUS_BADGE[p.status]}</td>
                  <td className="hash-short">
                    {p.currentOwner.slice(0, 10)}...{p.currentOwner.slice(-6)}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                      onClick={() => setPage("history")}
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
