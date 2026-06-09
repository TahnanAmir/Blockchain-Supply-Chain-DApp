export default function Navbar({ account, role, ROLE_NAMES, page, setPage }) {
  const allNavItems = [
    { key: "dashboard", label: "Dashboard",    roles: null },
    { key: "products",  label: "Products",     roles: null },
    { key: "register",  label: "Register",     roles: [1] },
    { key: "transfer",  label: "Transfer",     roles: [1, 2, 3] },
    { key: "history",   label: "Audit Trail",  roles: null },
    { key: "assign",    label: "Assign Roles", roles: [1] },
  ];

  const visibleItems = account
    ? allNavItems.filter(i => !i.roles || i.roles.includes(role))
    : [];

  const shortAddr = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "";

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="nav-brand-title">⛓ SupplyChain DApp</span>
        <span className="nav-brand-sub">Muhammad Tahnan Aamir · Polygon Amoy</span>
      </div>

      {account && (
        <ul className="nav-links">
          {visibleItems.map(item => (
            <li key={item.key}>
              <button
                className={`nav-link ${page === item.key ? "active" : ""}`}
                onClick={() => setPage(item.key)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {account && (
        <div className="nav-wallet">
          <span className={`badge badge-${ROLE_NAMES[role]?.toLowerCase()}`}>
            {ROLE_NAMES[role]}
          </span>
          <div className="wallet-badge">
            <span className="wallet-dot" />
            <span className="wallet-addr">{shortAddr}</span>
          </div>
        </div>
      )}
    </nav>
  );
}
