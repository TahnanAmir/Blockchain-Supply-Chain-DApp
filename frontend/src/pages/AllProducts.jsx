import { useState, useEffect } from "react";

const STATUS_BADGE = {
  0: <span className="badge badge-manufactured">🏭 Manufactured</span>,
  1: <span className="badge badge-intransit">🚛 In Transit</span>,
  2: <span className="badge badge-atretailer">🏪 At Retailer</span>,
  3: <span className="badge badge-delivered">✅ Delivered</span>,
};

export default function AllProducts({ contract, account, setPage }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");

  useEffect(() => { if (contract) loadProducts(); }, [contract]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const count = Number(await contract.productCounter());
      const list  = [];
      for (let i = 1; i <= count; i++) {
        const p = await contract.getProduct(i);
        list.push({
          id:           Number(p.id),
          name:         p.name,
          description:  p.description,
          currentOwner: p.currentOwner,
          status:       Number(p.status),
        });
      }
      setProducts(list);
    } catch (e) {
      console.error("AllProducts load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => {
    const matchFilter = filter === "all" || p.status === Number(filter);
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Inventory</div>
        <h1 className="page-title">All <span>Products</span></h1>
        <p className="page-subtitle">Muhammad Tahnan Aamir · Browse all registered products on-chain</p>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="form-input"
          placeholder="Search by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        {[
          { key: "all", label: "All" },
          { key: "0",   label: "🏭 Manufactured" },
          { key: "1",   label: "🚛 In Transit"   },
          { key: "2",   label: "🏪 At Retailer"   },
          { key: "3",   label: "✅ Delivered"    },
        ].map(f => (
          <button
            key={f.key}
            className={`btn ${filter === f.key ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem" }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <button
          className="btn btn-secondary"
          onClick={loadProducts}
          style={{ padding: "0.4rem 0.75rem", fontSize: "0.78rem", marginLeft: "auto" }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{
            margin: "0 auto 1rem",
            width: 28, height: 28,
            borderColor: "var(--border2)",
            borderTopColor: "var(--accent)"
          }} />
          <div style={{ color: "var(--text3)", fontFamily: "var(--mono)", fontSize: "0.8rem" }}>
            Fetching from blockchain...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-title">No products found</div>
          <div className="empty-sub">Try a different filter or register a new product</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Current Owner</th>
                <th>Mine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isOwner = p.currentOwner.toLowerCase() === account.toLowerCase();
                return (
                  <tr key={p.id}>
                    <td>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                        #{String(p.id).padStart(4, "0")}
                      </span>
                    </td>
                    <td style={{ color: "var(--text)", fontWeight: 600 }}>{p.name}</td>
                    <td style={{
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--text3)"
                    }}>
                      {p.description}
                    </td>
                    <td>{STATUS_BADGE[p.status]}</td>
                    <td>
                      <span style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.72rem",
                        color: isOwner ? "var(--green)" : "var(--text2)"
                      }}>
                        {p.currentOwner.slice(0, 8)}...{p.currentOwner.slice(-6)}
                      </span>
                    </td>
                    <td>
                      {isOwner
                        ? <span style={{ color: "var(--green)", fontSize: "0.75rem", fontFamily: "var(--mono)" }}>✓</span>
                        : <span style={{ color: "var(--text3)", fontSize: "0.75rem", fontFamily: "var(--mono)" }}>—</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "0.25rem 0.65rem", fontSize: "0.72rem" }}
                          onClick={() => setPage("history")}
                        >
                          History
                        </button>
                        {isOwner && p.status !== 3 && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: "0.25rem 0.65rem", fontSize: "0.72rem" }}
                            onClick={() => setPage("transfer")}
                          >
                            Transfer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        marginTop: "1rem",
        fontFamily: "var(--mono)",
        fontSize: "0.7rem",
        color: "var(--text3)"
      }}>
        Showing {filtered.length} of {products.length} total products
      </div>
    </div>
  );
}
