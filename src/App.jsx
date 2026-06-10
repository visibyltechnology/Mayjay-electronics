import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import useAuthStore from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import ReturnToTopButton from './components/ReturnToTopButton';
import './index.css';

// Lazy load pages for performance
const Home          = lazy(() => import('./pages/Home'));
const Shop          = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const VerifyOTP     = lazy(() => import('./pages/VerifyOTP'));
const ForgotPassword= lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile       = lazy(() => import('./pages/Profile'));
const Cart          = lazy(() => import('./pages/Cart'));
const Notifications = lazy(() => import('./pages/Notifications'));
const DeliveryPortal= lazy(() => import('./pages/DeliveryPortal'));
const Terms          = lazy(() => import('./pages/Terms'));
const PrivacyPolicy  = lazy(() => import('./pages/PrivacyPolicy'));

const AdminLayout      = lazy(() => import('./pages/Admin/AdminLayout'));
const ProductManager   = lazy(() => import('./pages/Admin/ProductManager'));
const CategoryManager  = lazy(() => import('./pages/Admin/CategoryManager'));
const BrandManager     = lazy(() => import('./pages/Admin/BrandManager'));
const ProductForm      = lazy(() => import('./pages/Admin/ProductForm'));
const AdminOrders      = lazy(() => import('./pages/Admin/AdminOrders'));
const AdminUsers       = lazy(() => import('./pages/Admin/AdminUsers'));
const SiteSettings     = lazy(() => import('./pages/Admin/SiteSettings'));

/* ─── Page-level Suspense mini-loader ─── */
const Loader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <style>{`
      @keyframes mjSpin   { to { transform: rotate(360deg); } }
      @keyframes mjFadeUp { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0); } }
      .mj-ring {
        width: 44px; height: 44px;
        border: 3px solid #a3e63530;
        border-top-color: #a3e635;
        border-radius: 50%;
        animation: mjSpin 0.75s linear infinite;
      }
      .mj-fade { animation: mjFadeUp 0.5s ease forwards; }
    `}</style>
    <div className="mj-ring"></div>
    <div className="mj-fade flex items-center gap-1.5">
      <span className="text-xs font-black tracking-[0.25em] text-slate-800 uppercase">MAYJAY</span>
      <span className="w-1 h-1 rounded-full bg-lime-400 animate-pulse"></span>
      <span className="text-xs font-medium tracking-widest text-slate-500 uppercase">Concepts</span>
    </div>
  </div>
);

/* ─── Full-page splash screen (auth init) ─── */
const SplashScreen = () => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0f172a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}
  >
    <style>{`
      @keyframes splashSpin   { to { transform: rotate(360deg); } }
      @keyframes splashPulse  { 0%,100% { transform:scale(1); opacity:.15; } 50% { transform:scale(1.35); opacity:.05; } }
      @keyframes splashBar    { from { width:0; } to { width:100%; } }
      @keyframes splashFadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      @keyframes splashGlow   { 0%,100% { text-shadow: 0 0 24px #a3e63560; } 50% { text-shadow: 0 0 48px #a3e63599, 0 0 80px #a3e63540; } }
      @keyframes splashDot    { 0%,100%{ transform:scaleY(1); opacity:.7; } 50%{ transform:scaleY(1.8); opacity:1; } }

      .splash-ring-outer {
        position:absolute;
        width: 220px; height: 220px;
        border-radius: 50%;
        border: 1.5px solid #a3e63520;
        animation: splashPulse 3s ease-in-out infinite;
      }
      .splash-ring-mid {
        position:absolute;
        width: 160px; height: 160px;
        border-radius: 50%;
        border: 1.5px solid #a3e63530;
        animation: splashPulse 3s ease-in-out infinite 0.5s;
      }
      .splash-ring-inner {
        position:absolute;
        width: 100px; height: 100px;
        border-radius: 50%;
        border: 2px solid #a3e63550;
        animation: splashPulse 3s ease-in-out infinite 1s;
      }
      .splash-spinner {
        width: 60px; height: 60px;
        border-radius: 50%;
        border: 2.5px solid #1e293b;
        border-top-color: #a3e635;
        border-right-color: #22c55e;
        animation: splashSpin 1s cubic-bezier(0.4,0,0.6,1) infinite;
      }
      .splash-wordmark {
        animation: splashFadeUp 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) both;
      }
      .splash-tagline {
        animation: splashFadeUp 0.8s 0.6s cubic-bezier(0.16,1,0.3,1) both;
      }
      .splash-bar-track {
        width: 180px; height: 3px;
        background: #1e293b;
        border-radius: 99px;
        overflow: hidden;
        animation: splashFadeUp 0.8s 0.9s cubic-bezier(0.16,1,0.3,1) both;
      }
      .splash-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #a3e635);
        border-radius: 99px;
        animation: splashBar 2.2s 1s cubic-bezier(0.4,0,0.2,1) forwards;
        width: 0;
      }
      .splash-mj {
        animation: splashGlow 2.5s ease-in-out infinite;
        background: linear-gradient(135deg, #a3e635 30%, #22c55e 70%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .splash-dot {
        display:inline-block;
        width: 5px; border-radius: 99px;
        background: #a3e635;
      }
      .splash-dot:nth-child(1){ animation: splashDot 1s ease-in-out infinite 0s; }
      .splash-dot:nth-child(2){ animation: splashDot 1s ease-in-out infinite 0.18s; }
      .splash-dot:nth-child(3){ animation: splashDot 1s ease-in-out infinite 0.36s; }
    `}</style>

    {/* Ambient glow blobs */}
    <div style={{ position:'absolute', top:'-10%', right:'-10%', width:320, height:320, borderRadius:'50%', background:'#a3e63508', filter:'blur(60px)', pointerEvents:'none' }} />
    <div style={{ position:'absolute', bottom:'-10%', left:'-10%', width:280, height:280, borderRadius:'50%', background:'#22c55e06', filter:'blur(60px)', pointerEvents:'none' }} />

    {/* Pulse rings */}
    <div className="splash-ring-outer" />
    <div className="splash-ring-mid" />
    <div className="splash-ring-inner" />

    {/* Center content */}
    <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap: '20px' }}>

      {/* Spinner */}
      <div className="splash-spinner" />

      {/* Wordmark */}
      <div className="splash-wordmark" style={{ textAlign:'center', lineHeight:1 }}>
        <div style={{ fontSize:'2.4rem', fontWeight:900, letterSpacing:'0.12em', lineHeight:1 }}>
          <span className="splash-mj">MAYJAY</span>
        </div>
        <div style={{ fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.4em', color:'#64748b', marginTop:6, textTransform:'uppercase' }}>
          Concepts
        </div>
      </div>

      {/* Tagline */}
      <div className="splash-tagline" style={{ fontSize:'0.65rem', color:'#475569', letterSpacing:'0.2em', textTransform:'uppercase', textAlign:'center', maxWidth: 220, lineHeight: 1.8 }}>
        Premium Electronics &amp; Solar Solutions
      </div>

      {/* Animated bar */}
      <div className="splash-bar-track">
        <div className="splash-bar-fill" />
      </div>

      {/* Loading dots */}
      <div style={{ display:'flex', gap:6, alignItems:'center', height:16 }}>
        <div className="splash-dot" style={{ height:8 }} />
        <div className="splash-dot" style={{ height:12 }} />
        <div className="splash-dot" style={{ height:8 }} />
      </div>
    </div>
  </div>
);

function App() {
  const { user, init, loading } = useAuthStore();

  useEffect(() => { init(); }, [init]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <ScrollToTop />
      <ReturnToTopButton />
      <Navbar />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: 'var(--blue)', secondary: 'white' } },
        }}
      />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/products"       element={<Shop />} />
          <Route path="/products/:id"   element={<ProductDetail />} />
          <Route path="/shop"           element={<Shop />} />

          {/* Electronics category routes */}
          <Route path="/phones"         element={<Shop />} />
          <Route path="/laptops"        element={<Shop />} />
          <Route path="/gaming"         element={<Shop />} />
          <Route path="/audio"          element={<Shop />} />
          <Route path="/tvs"            element={<Shop />} />
          <Route path="/accessories"    element={<Shop />} />

          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/verify-otp"     element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/profile"        element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/cart"           element={<Cart />} />
          <Route path="/notifications"  element={user ? <Notifications /> : <Navigate to="/login" />} />
          <Route path="/delivery"       element={<DeliveryPortal />} />
          <Route path="/terms"          element={<Terms />} />
          <Route path="/privacy"        element={<PrivacyPolicy />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index              element={<ProductManager />} />
            <Route path="categories"  element={<CategoryManager />} />
            <Route path="brands"      element={<BrandManager />} />
            <Route path="new"         element={<ProductForm />} />
            <Route path="edit/:id"    element={<ProductForm />} />
            <Route path="orders"      element={<AdminOrders />} />
            <Route path="users"       element={<AdminUsers />} />
            <Route path="settings"    element={<SiteSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
