export default function DashboardPage() {
  const stats = [
    { label: 'Total Products', value: '—', color: '#3b82f6' },
    { label: 'Total Customers', value: '—', color: '#10b981' },
    { label: 'Total Orders', value: '—', color: '#f59e0b' },
    { label: 'Revenue', value: '—', color: '#8b5cf6' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Recent Orders
        </h2>
        <p style={{ color: '#6b7280' }}>No orders yet. Connect to the API to load data.</p>
      </div>
    </div>
  );
}
