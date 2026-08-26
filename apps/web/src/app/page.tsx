export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111' }}>
          Commerce Platform
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#555', maxWidth: '600px' }}>
          A multi-tenant SaaS platform for managing products, customers, orders, and commerce
          operations.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          maxWidth: '900px',
          width: '100%',
          padding: '0 1rem',
        }}
      >
        {[
          { title: 'Products', description: 'Manage your product catalog', href: '/products' },
          { title: 'Customers', description: 'View and manage customers', href: '/customers' },
          { title: 'Orders', description: 'Track and fulfill orders', href: '/orders' },
          { title: 'Analytics', description: 'Business insights & reports', href: '/analytics' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: 'block',
              padding: '1.5rem',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'box-shadow 0.2s',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {item.title}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>{item.description}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
