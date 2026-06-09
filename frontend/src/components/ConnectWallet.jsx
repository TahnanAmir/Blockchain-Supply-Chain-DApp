export default function ConnectWallet({ connectWallet, loading }) {
  const features = [
    { icon: "🏭", title: "Manufacturer", desc: "Register products & assign roles" },
    { icon: "🚛", title: "Distributor",  desc: "Receive & forward shipments" },
    { icon: "🏪", title: "Retailer",     desc: "Stock and sell to customers" },
    { icon: "👤", title: "Customer",     desc: "Final product recipient" },
  ];

  return (
    <div className="connect-page">
      <div className="connect-card">
        <div className="connect-logo">⛓</div>

        <h1 className="connect-title">Supply Chain DApp</h1>
        <p className="connect-subtitle">
          A decentralized supply chain management system built on the Polygon
          network. Track products from manufacturer to consumer with full
          on-chain transparency.
        </p>

        <div className="connect-features">
          {features.map(f => (
            <div className="connect-feature" key={f.title}>
              <span className="connect-feature-icon">{f.icon}</span>
              <div>
                <div className="connect-feature-title">{f.title}</div>
                <div className="connect-feature-text">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={connectWallet}
          disabled={loading}
          style={{ fontSize: "1rem", padding: "0.9rem" }}
        >
          {loading
            ? <><span className="spinner" /> Connecting...</>
            : <>🦊 Connect MetaMask</>}
        </button>

        <p style={{
          marginTop: "1rem",
          fontSize: "0.75rem",
          color: "var(--text3)",
          fontFamily: "var(--mono)"
        }}>
          Ensure MetaMask is connected to Polygon Amoy
        </p>

        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          textAlign: "left"
        }}>
          <div className="card-label" style={{ marginBottom: "0.4rem" }}>Developer</div>
          <div style={{ fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)" }}>
            Muhammad Tahnan Aamir
          </div>
          <div style={{
            fontSize: "0.75rem",
            color: "var(--text3)",
            fontFamily: "var(--mono)",
            marginTop: "0.25rem"
          }}>
            Blockchain Supply Chain · Polygon Network
          </div>
        </div>
      </div>
    </div>
  );
}
