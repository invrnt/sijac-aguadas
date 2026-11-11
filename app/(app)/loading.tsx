export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando información…</span>
      <span className="skeleton skeleton-title" />
      <span className="skeleton skeleton-line" />
      <div className="stat-grid" style={{ marginTop: 28 }}>
        {[0, 1, 2, 3].map((item) => (
          <span className="skeleton skeleton-card" key={item} />
        ))}
      </div>
      <span className="skeleton skeleton-panel" />
    </div>
  );
}
