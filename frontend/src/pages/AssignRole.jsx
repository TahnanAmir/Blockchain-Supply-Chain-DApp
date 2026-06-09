import { useState } from "react";
import { getContract, AMOY_GAS } from "../utils/ethers";

const ROLES = [
  { id: 1, name: "Manufacturer", icon: "🏭", desc: "Can register new products and assign roles to others", color: "var(--accent)" },
  { id: 2, name: "Distributor",  icon: "🚛", desc: "Receives products from manufacturer and ships to retailers", color: "var(--gold)" },
  { id: 3, name: "Retailer",     icon: "🏪", desc: "Stocks products and sells directly to customers", color: "var(--green)" },
  { id: 4, name: "Customer",     icon: "👤", desc: "Final recipient of the product in the supply chain", color: "var(--red)" },
];

const ALL_ROLE_NAMES = ["None", "Manufacturer", "Distributor", "Retailer", "Customer"];

export default function AssignRole({ contract, role, showNotification }) {
  const [address,      setAddress]      = useState("");
  const [selectedRole, setSelectedRole] = useState(2);
  const [loading,      setLoading]      = useState(false);
  const [checking,     setChecking]     = useState(false);
  const [currentRole,  setCurrentRole]  = useState(null);
  const [lastTx,       setLastTx]       = useState(null);

  /* Role guard */
  if (role !== 1) {
    return (
      <div>
        <div className="page-header">
          <div className="page-eyebrow">Restricted</div>
          <h1 className="page-title">Assign <span>Roles</span></h1>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
          <div style={{ fontWeight: 700, color: "var(--red)" }}>Access Denied</div>
          <div style={{ color: "var(--text3)", marginTop: "0.5rem" }}>
            Only the Manufacturer (contract deployer) can assign roles.
          </div>
        </div>
      </div>
    );
  }

  /* Check existing role of typed address */
  const checkAddress = async () => {
    if (!address || address.length < 42) return;
    setChecking(true);
    try {
      const r = await contract.getRole(address);
      setCurrentRole(Number(r));
    } catch {
      setCurrentRole(null);
    } finally {
      setChecking(false);
    }
  };

  const handleAssign = async () => {
    if (!address) return showNotification("Enter a wallet address", "error");
    try {
      setLoading(true);
      const c  = await getContract();
      const tx = await c.assignRole(address, selectedRole, AMOY_GAS);
      showNotification("Transaction submitted, waiting...");
      await tx.wait();
      setLastTx(tx.hash);
      setCurrentRole(selectedRole);
      showNotification(`${ALL_ROLE_NAMES[selectedRole]} role assigned! ✅`);
    } catch (e) {
      showNotification(e.reason || e.message || "Transaction failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Admin</div>
        <h1 className="page-title">Assign <span>Roles</span></h1>
        <p className="page-subtitle">Muhammad Tahnan Aamir · Manage participant roles on the supply chain</p>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Form */}
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">Wallet Address</label>
            <input
              className="form-input"
              placeholder="0x..."
              value={address}
              onChange={e => { setAddress(e.target.value); setCurrentRole(null); }}
              onBlur={checkAddress}
            />

            {checking && (
              <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: "var(--text3)", fontFamily: "var(--mono)" }}>
                Checking current role...
              </div>
            )}

            {currentRole !== null && !checking && (
              <div style={{
                marginTop: "0.4rem",
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                color: currentRole === 0 ? "var(--text3)" : "var(--accent)"
              }}>
                Current role: <strong>{ALL_ROLE_NAMES[currentRole]}</strong>
                {currentRole !== 0 ? " — will be overwritten" : ""}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Select Role to Assign</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {ROLES.map(r => (
                <label
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius)",
                    border: `1px solid ${selectedRole === r.id ? r.color : "var(--border)"}`,
                    background: selectedRole === r.id ? `${r.color}12` : "var(--bg3)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.id}
                    checked={selectedRole === r.id}
                    onChange={() => setSelectedRole(r.id)}
                    style={{ accentColor: r.color }}
                  />
                  <span style={{ fontSize: "1.2rem" }}>{r.icon}</span>
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: selectedRole === r.id ? r.color : "var(--text)"
                    }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text3)", fontFamily: "var(--mono)" }}>
                      {r.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleAssign}
            disabled={loading || !address}
          >
            {loading
              ? <><span className="spinner" /> Assigning...</>
              : `⛓ Assign ${ALL_ROLE_NAMES[selectedRole]} Role`}
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
                ✓ Role Assigned
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

        {/* Role info cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {ROLES.map(r => (
            <div
              className="card"
              key={r.id}
              style={{ borderColor: selectedRole === r.id ? `${r.color}40` : "var(--border)" }}
            >
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `${r.color}15`,
                  border: `1px solid ${r.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: r.color, marginBottom: "0.25rem" }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.5 }}>
                    {r.desc}
                  </div>
                  <div style={{ marginTop: "0.4rem", fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--text3)" }}>
                    Role ID: {r.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
