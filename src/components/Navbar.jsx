import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const [search, setSearch] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [tickerText, setTickerText] = useState('Premium Electronics, Smart Home & Solar Solutions.');
    const { user, isAdmin, logout } = useAuthStore();
    const items = useCartStore((s) => s.items);
    const cartCount = items.reduce((t, i) => t + (i.quantity || 1), 0);
    const navigate = useNavigate();
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [location.pathname]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'site_settings');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().tickerMessages) {
                    setTickerText(docSnap.data().tickerMessages.join('     |     '));
                }
            } catch (error) {
                console.error("Error fetching ticker settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/products?search=${encodeURIComponent(search.trim())}`);
            setSearch('');
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        toast.success('Signed out successfully');
        setMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;
    const isActivePrefix = (prefix) => location.pathname.startsWith(prefix);

    const navLinkCls = (active) =>
        `px-4 py-3.5 transition-all text-sm font-semibold tracking-wide flex items-center gap-1 border-b-2 ${
            active
                ? 'text-brandLime border-brandLime'
                : 'text-gray-300 hover:text-white border-transparent hover:border-gray-600'
        }`;

    return (
        <>
            {/* TOP ANNOUNCEMENT BANNER */}
            <div className="bg-brandBlack text-white text-center py-2 px-2 text-[9px] sm:text-xs font-semibold tracking-wider sm:tracking-widest border-b border-gray-800 uppercase overflow-hidden whitespace-nowrap">
                <span className="inline-block animate-[marquee_30s_linear_infinite]">{tickerText}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{tickerText}</span>
            </div>

            {/* PRIMARY NAVBAR */}
            <header className="bg-brandDark text-white sticky top-0 z-50 shadow-xl border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20 gap-2 md:gap-4">
                        
                        {/* Brand Logo */}
                        <Link to="/" className="flex items-center space-x-2 group shrink-0">
                            <div className="relative bg-brandBlack p-2 rounded-full border border-brandLime/50 group-hover:border-brandLime transition-all duration-300">
                                <i className="fa-solid fa-microchip text-brandLime text-xl"></i>
                                <i className="fa-solid fa-bolt text-yellow-400 text-xs absolute -bottom-1 -right-1 animate-bounce"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base sm:text-xl font-black tracking-tight text-white group-hover:text-brandLime transition-colors duration-300">
                                    MAYJAY <span className="text-brandLime">CONCEPTS</span>
                                </span>
                                <span className="text-[9px] uppercase tracking-widest text-gray-400 -mt-1">Electronics & Solar</span>
                            </div>
                        </Link>

                        {/* Global Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-xl relative">
                            <form onSubmit={handleSearch} className="w-full relative">
                                <input 
                                    type="text" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products, solutions, or systems..."
                                    className="w-full bg-brandBlack text-white pl-4 pr-12 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:border-brandLime focus:ring-1 focus:ring-brandLime transition-all duration-300 placeholder-gray-500 text-sm"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brandLime text-brandBlack font-bold px-3 py-1.5 rounded-md hover:bg-white transition-colors duration-300 text-xs">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </form>
                        </div>

                        {/* Right Utility Icons */}
                        <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
                            <Link to={user ? "/profile" : "/login"} className="text-gray-300 hover:text-brandLime p-2 transition-colors duration-200 relative group hidden sm:inline-flex items-center gap-1.5" title={user ? 'My Account' : 'Login'}>
                                <i className="fa-regular fa-user text-lg"></i>
                                {user && <span className="text-[10px] font-bold text-gray-400 max-w-[80px] truncate hidden lg:block">{(user.displayName || user.email || '').split(' ')[0].split('@')[0]}</span>}
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" className="text-gray-300 hover:text-brandLime p-2 transition-colors duration-200 hidden sm:inline-block" title="Admin Dashboard">
                                    <i className="fa-solid fa-cog text-lg"></i>
                                </Link>
                            )}
                            {user && (
                                <button onClick={handleLogout} className="text-gray-300 hover:text-red-400 p-2 transition-colors duration-200 hidden sm:inline-block" title="Logout">
                                    <i className="fa-solid fa-sign-out-alt text-lg"></i>
                                </button>
                            )}
                            {user && <NotificationBell userId={user.uid} isMobile={false} />}
                            <Link to="/cart" className="text-gray-300 hover:text-brandLime p-1.5 sm:p-2 transition-colors duration-200 relative flex items-center space-x-1 bg-brandBlack/50 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-800 hover:border-brandLime">
                                <i className="fa-solid fa-cart-shopping text-brandLime text-xs sm:text-sm"></i>
                                <span className="bg-brandLime text-brandBlack text-[9px] sm:text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {cartCount}
                                </span>
                            </Link>
                            {/* Mobile Menu Button */}
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white hover:text-brandLime focus:outline-none p-1.5 sm:p-2 ml-1">
                                <i className={`fa-solid text-lg sm:text-xl ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* DESKTOP MEGA-NAVIGATION */}
                <nav className="hidden md:block bg-brandBlack border-t border-gray-800 text-sm font-medium">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-0">
                        <Link to="/" className={navLinkCls(isActive('/'))}>HOME</Link>
                        
                        <div
                            className="relative"
                            onMouseEnter={() => setActiveDropdown('solar')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className={navLinkCls(isActivePrefix('/products') && location.search.includes('Solar'))}>
                                <span>SOLAR & POWER</span>
                                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${activeDropdown === 'solar' ? 'rotate-180' : ''}`}></i>
                            </button>
                            {activeDropdown === 'solar' && (
                                <div className="absolute left-0 top-full w-56 bg-white text-gray-800 shadow-2xl rounded-b-xl border border-gray-100 py-2 z-50">
                                    <Link to="/products?cat=Solar" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Solar Panels & Systems</Link>
                                    <Link to="/products?cat=Inverters" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Inverters & Converters</Link>
                                    <Link to="/products?cat=Generators" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Generators</Link>
                                </div>
                            )}
                        </div>

                        <div
                            className="relative"
                            onMouseEnter={() => setActiveDropdown('electronics')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className={navLinkCls(isActivePrefix('/products') && !location.search.includes('Solar'))}>
                                <span>ELECTRONICS</span>
                                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${activeDropdown === 'electronics' ? 'rotate-180' : ''}`}></i>
                            </button>
                            {activeDropdown === 'electronics' && (
                                <div className="absolute left-0 top-full w-56 bg-white text-gray-800 shadow-2xl rounded-b-xl border border-gray-100 py-2 z-50">
                                    <Link to="/products?cat=Televisions" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Televisions</Link>
                                    <Link to="/products?cat=Air+Conditioners" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Air Conditioners</Link>
                                    <Link to="/products?cat=Refrigerators" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Refrigerators</Link>
                                    <Link to="/products?cat=Washing+Machines" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Washing Machines</Link>
                                    <Link to="/products?cat=Phones" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Phones & Gadgets</Link>
                                    <Link to="/products?cat=Laptops" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Laptops & Computers</Link>
                                    <Link to="/products?cat=Audio" className="block px-4 py-2.5 hover:bg-brandLime/10 hover:text-brandDark transition-colors text-sm font-semibold">Audio & Sound</Link>
                                </div>
                            )}
                        </div>

                        <Link to="/products" className={navLinkCls(isActive('/products') && !location.search)}>ALL PRODUCTS</Link>
                        <Link to="/delivery" className={navLinkCls(isActive('/delivery'))}>DELIVERY</Link>
                    </div>
                </nav>

                {/* MOBILE NAVIGATION */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-brandDark border-t border-gray-700 px-4 pt-3 pb-6 space-y-1 overflow-y-auto max-h-[80vh]">
                        <form onSubmit={handleSearch} className="relative my-3">
                            <input 
                                type="text" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..." 
                                className="w-full bg-brandBlack text-white pl-4 pr-10 py-2.5 rounded-lg text-sm border border-gray-700 focus:border-brandLime outline-none"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brandLime">
                                <i className="fa-solid fa-magnifying-glass text-xs"></i>
                            </button>
                        </form>

                        <Link to="/" className={`block px-3 py-2.5 rounded-lg font-semibold text-sm ${isActive('/') ? 'bg-brandBlack text-brandLime' : 'text-gray-300 hover:text-white hover:bg-brandBlack/50'}`}>
                            <i className="fas fa-home mr-2"></i>Home
                        </Link>

                        <div className="border-t border-gray-800 my-2 pt-2">
                            <p className="px-3 py-1 text-[10px] text-gray-500 font-black uppercase tracking-widest">Solar & Power</p>
                            <Link to="/products?cat=Solar" className="block px-5 py-2 text-gray-300 text-sm hover:text-white hover:bg-brandBlack/40 rounded-lg">Solar Panels</Link>
                            <Link to="/products?cat=Inverters" className="block px-5 py-2 text-gray-300 text-sm hover:text-white hover:bg-brandBlack/40 rounded-lg">Inverters</Link>
                            <Link to="/products?cat=Generators" className="block px-5 py-2 text-gray-300 text-sm hover:text-white hover:bg-brandBlack/40 rounded-lg">Generators</Link>
                        </div>

                        <div className="border-t border-gray-800 my-2 pt-2">
                            <p className="px-3 py-1 text-[10px] text-gray-500 font-black uppercase tracking-widest">Electronics</p>
                            <Link to="/products?cat=Televisions" className="block px-5 py-2 text-gray-300 text-sm hover:text-white hover:bg-brandBlack/40 rounded-lg">Televisions</Link>
                            <Link to="/products?cat=Air+Conditioners" className="block px-5 py-2 text-gray-300 text-sm hover:text-white hover:bg-brandBlack/40 rounded-lg">Air Conditioners</Link>
                            <Link to="/products?cat=Phones" className="block px-5 py-2 text-gray-300 text-sm hover:text-white hover:bg-brandBlack/40 rounded-lg">Phones</Link>
                            <Link to="/products?cat=Laptops" className="block px-5 py-2 text-gray-300 text-sm hover:text-white hover:bg-brandBlack/40 rounded-lg">Laptops</Link>
                            <Link to="/products" className="block px-5 py-2 text-brandLime text-sm font-bold hover:bg-brandBlack/40 rounded-lg">View All →</Link>
                        </div>

                        <div className="border-t border-gray-800 my-2 pt-2">
                            {user ? (
                                <>
                                    <Link to="/profile" className="block px-3 py-2.5 text-gray-300 hover:text-white rounded-lg hover:bg-brandBlack/40 text-sm">
                                        <i className="fas fa-user mr-2"></i>My Account
                                    </Link>
                                    <Link to="/cart" className="block px-3 py-2.5 text-gray-300 hover:text-white rounded-lg hover:bg-brandBlack/40 text-sm">
                                        <i className="fas fa-shopping-cart mr-2"></i>Cart ({cartCount})
                                    </Link>
                                    <div className="px-3 py-2">
                                        <NotificationBell userId={user.uid} isMobile={true} />
                                    </div>
                                    {isAdmin && (
                                        <Link to="/admin" className="block px-3 py-2.5 text-brandLime hover:text-white rounded-lg hover:bg-brandBlack/40 text-sm font-bold">
                                            <i className="fas fa-cog mr-2"></i>Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 py-2.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20 text-sm"
                                    >
                                        <i className="fas fa-sign-out-alt mr-2"></i>Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block px-3 py-2.5 text-brandLime font-bold hover:text-white rounded-lg hover:bg-brandBlack/40 text-sm">
                                        <i className="fas fa-sign-in-alt mr-2"></i>Login
                                    </Link>
                                    <Link to="/register" className="block px-3 py-2.5 text-gray-300 hover:text-white rounded-lg hover:bg-brandBlack/40 text-sm">
                                        <i className="fas fa-user-plus mr-2"></i>Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
