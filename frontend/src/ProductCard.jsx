const STATUS_MAP = {
  0: { label: "Manufactured", cls: "badge-manufactured", icon: "🏭" },
  1: { label: "In Transit",   cls: "badge-intransit",    icon: "🚛" },
  2: { label: "Delivered",    cls: "badge-delivered",    icon: "✅" },
};

export default function ProductCard({ product, onClick }) {
  const status     = STATUS_MAP[product.status] ?? STATUS_MAP[0];
  const shortOwner = `${product.currentOwner.slice(0, 8)}...${product.currentOwner.slice(-6)}`;

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-id">PRODUCT #{String(product.id).padStart(4, "0")}</div>
      <div className="product-name">{product.name}</div>
      <div className="product-desc">{product.description}</div>
      <div className="product-meta">
        <span className={`badge ${status.cls}`}>
          {status.icon} {status.label}
        </span>
        <span className="product-owner">Owner: {shortOwner}</span>
      </div>
    </div>
  );
}
