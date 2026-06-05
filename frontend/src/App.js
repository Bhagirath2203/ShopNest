import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            <div className="page">
              <div className="container fade-in">
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '60vh',
                  gap: '1.5rem',
                  textAlign: 'center',
                }}>
                  <h1 className="page-title" style={{ fontSize: '3rem' }}>
                    🛍️ ShopNest
                  </h1>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-lg)',
                    maxWidth: '500px',
                  }}>
                    Premium e-commerce experience. Building pages soon...
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}>
                    <span className="badge badge-success">✅ React 19</span>
                    <span className="badge badge-info">✅ Router v7</span>
                    <span className="badge badge-primary">✅ Axios Ready</span>
                    <span className="badge badge-warning">✅ Auth Context</span>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
