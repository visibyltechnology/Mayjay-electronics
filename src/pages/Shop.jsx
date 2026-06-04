import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';

const CATEGORIES = [
    'All', 'Solar', 'Electronics', 'Automation', 'Air Conditioners', 'Televisions', 'Refrigerators', 'Generators', 'Washing Machines', 'Phones', 'Laptops', 'Audio', 'Gaming'
];

function pathToCategory(pathname) {
    if (pathname.includes('phones')) return 'Phones';
    if (pathname.includes('laptops')) return 'Laptops';
    if (pathname.includes('gaming')) return 'Gaming';
    return null;
}

export default function Shop() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const urlCat = searchParams.get('cat') || searchParams.get('search') ? null : pathToCategory(location.pathname);
    const initial = CATEGORIES.find(c => c.toLowerCase() === (urlCat || '').toLowerCase()) || 'All';

    const [active, setActive] = useState(initial);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const snap = await getDocs(collection(db, 'products'));
                let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                
                if (items.length === 0) {
                    items = [
                        { id: '1', name: '65-Inch 4K UHD Smart Display', price: 450000, category: 'Televisions', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80' },
                        { id: '2', name: 'Premium Solar Inverter 5kVA', price: 599000, category: 'Solar', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80' },
                        { id: '3', name: 'Pro Series Gaming Laptop', price: 850000, category: 'Laptops', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80' },
                        { id: '4', name: 'Smart Inverter Air Conditioner', price: 320000, category: 'Air Conditioners', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1628107094038-16e7884dcc64?w=500&q=80' }
                    ];
                }
                setProducts(items);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const cat = searchParams.get('cat') || pathToCategory(location.pathname);
        if (cat) {
            const match = CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase());
            setActive(match || 'All');
            setSearch('');
        }
        
        const searchQ = searchParams.get('search');
        if (searchQ) {
            setSearch(searchQ);
            setActive('All');
        }
    }, [location.search, location.pathname, searchParams]);

    const filtered = products.filter(p => {
        const matchCat = active === 'All' || p.category === active;
        const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="bg-gray-50 flex-grow min-h-screen flex flex-col">
            {/* Page Header */}
            <div className="bg-brandBlack border-b border-gray-800 shadow-xl py-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1000&q=80')] mix-blend-overlay bg-cover bg-center"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="w-full md:w-auto">
                            <div className="inline-flex items-center space-x-2 bg-brandLime/10 border border-brandLime/30 text-brandLime px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3">
                                <i className="fa-solid fa-bolt"></i> <span>Premium Catalog</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
                                {search ? `Search: ${search}` : active === 'All' ? 'ALL PRODUCTS' : active}
                            </h1>
                            <p className="text-sm text-gray-400 mt-2 flex items-center font-medium">
                                <i className="fas fa-check-circle text-brandLime mr-1.5"></i> 100% Genuine Brands • Manufacturer Warranty
                            </p>
                        </div>
                        <div className="w-full md:w-96 relative group">
                            <input
                                type="text"
                                placeholder="Filter within catalog..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-brandDark text-white border border-gray-700 focus:border-brandLime focus:ring-1 focus:ring-brandLime rounded-lg py-3 pl-12 pr-4 outline-none transition-all font-medium text-sm placeholder-gray-500"
                            />
                            <i className="fas fa-search absolute left-4 top-4 text-gray-400 text-sm group-focus-within:text-brandLime transition-colors"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 flex-grow">
                {/* Sidebar Filters */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white border border-gray-100 overflow-hidden sticky top-28 shadow-xl rounded-2xl group mb-6">
                        <div className="bg-brandBlack text-brandLime px-5 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-between border-b border-gray-800">
                            <span>Categories</span>
                            <i className="fas fa-layer-group text-gray-400 text-sm group-hover:text-brandLime transition-colors"></i>
                        </div>
                        <div className="p-5 space-y-4 bg-gray-50/30">
                            {CATEGORIES.map(cat => {
                                const isActive = active === cat;
                                return (
                                    <label key={cat} className="flex items-center cursor-pointer group" onClick={(e) => { e.preventDefault(); setActive(cat); setSearch(''); }}>
                                        <div className="relative flex items-center justify-center">
                                            <div className={`w-5 h-5 border-2 rounded transition-colors duration-200 flex items-center justify-center ${isActive ? 'border-brandLime bg-brandLime' : 'border-gray-300 group-hover:border-brandLime'}`}>
                                                <svg className={`w-3 h-3 text-brandBlack pointer-events-none ${isActive ? 'block' : 'hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <span className={`ml-3 text-sm font-medium transition-colors ${isActive ? 'text-brandDark font-bold' : 'text-gray-600 group-hover:text-brandDark'}`}>
                                            {cat}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Product Grid */}
                <div className="flex-1 w-full lg:w-3/4">
                    {/* Sleek Toolbar */}
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <p className="text-sm text-gray-500 font-medium px-2">
                            Showing <span className="font-black text-brandDark">1–{filtered.length}</span> of <span className="font-black text-brandDark">{filtered.length}</span> assets
                        </p>
                        <div className="flex items-center space-x-3">
                            <div className="relative bg-gray-50 rounded-xl p-1 border border-gray-100 flex items-center w-full sm:w-auto">
                                <span className="pl-3 pr-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Sort:</span>
                                <select className="appearance-none bg-transparent text-brandDark py-1.5 pl-2 pr-8 text-sm font-bold focus:outline-none cursor-pointer w-full sm:w-auto">
                                    <option>Popularity</option>
                                    <option>Newest Arrivals</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                                <i className="fa-solid fa-angle-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 h-96 animate-pulse flex flex-col justify-between">
                                    <div className="w-full h-56 bg-gray-100 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-100 w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-100 w-1/2 mb-auto"></div>
                                    <div className="h-10 bg-gray-100 w-full mt-3 rounded-xl"></div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-white p-16 rounded-2xl shadow-xl border border-gray-100 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                                <i className="fas fa-search text-3xl text-gray-300"></i>
                            </div>
                            <h3 className="text-2xl font-black text-brandDark mb-2 uppercase tracking-tight">No products found</h3>
                            <p className="text-gray-500 mb-8 font-medium text-sm max-w-sm mx-auto">We couldn't find any items matching your criteria. Try adjusting your filters or search terms.</p>
                            <button 
                                onClick={() => { setSearch(''); setActive('All'); }}
                                className="bg-brandDark hover:bg-brandBlack text-brandLime font-black py-3 px-8 rounded-xl uppercase tracking-widest text-xs transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                            {filtered.map((p, idx) => (
                                <div key={p.id} onClick={() => navigate(`/products/${p.id}`)} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 flex flex-col group relative overflow-hidden cursor-pointer animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <div className="absolute top-4 left-4 z-30 flex gap-2">
                                        <span className="bg-slate-900/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                                            {p.category ? p.category.split(' ')[0] : 'SOLAR'}
                                        </span>
                                    </div>
                                    {[ { label: 'New', cls: 'bg-lime-400 text-slate-900' }, { label: 'Sale', cls: 'bg-yellow-400 text-slate-900' }, null, null ][idx % 4] && (
                                        <div className="absolute top-12 left-4 z-30">
                                            <span className={`${{ 0:'bg-lime-400 text-slate-900', 1:'bg-yellow-400 text-slate-900' }[idx % 4]} text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm`}>
                                                {[{ label: 'New' }, { label: 'Sale' }][idx % 4]?.label}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                                        <button onClick={e => e.stopPropagation()} className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all"><i className="fa-regular fa-heart"></i></button>
                                        <button onClick={e => e.stopPropagation()} className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all"><i className="fa-solid fa-code-compare"></i></button>
                                    </div>
                                    <div className="relative h-56 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6 group-hover:bg-gray-50 transition-colors duration-500">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brandLime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <img src={p.img || p.images?.[0] || 'https://via.placeholder.com/150'} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-sm" />
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow bg-white relative z-20">
                                        <h3 className="text-base font-black text-brandDark mb-3 leading-tight group-hover:text-brandLime transition-colors duration-300 line-clamp-2 min-h-[44px]">{p.name}</h3>
                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <div className="flex items-end space-x-2 mb-1">
                                                <span className="text-2xl font-black text-brandDark tracking-tight">₦{Number(p.price).toLocaleString()}</span>
                                            </div>
                                            <button type="button" onClick={e => e.stopPropagation()} className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 hover:border-brandLime hover:bg-brandLime/5 hover:text-brandDark px-3 py-2.5 rounded-xl transition-all duration-300 mb-4 group/inst active:scale-[0.98]">
                                                <i className="fa-solid fa-layer-group text-brandGreen group-hover/inst:text-brandDark transition-colors"></i>
                                                <span>Install payment</span>
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); navigate(`/products/${p.id}`); }} className="w-full bg-brandDark text-white hover:bg-brandLime hover:text-brandBlack font-bold text-sm py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-brandLime/20 overflow-hidden relative group/btn">
                                                <span className="relative z-10 flex items-center space-x-2">
                                                    <i className="fa-solid fa-cart-shopping transition-transform group-hover/btn:-translate-y-1"></i>
                                                    <span>Add to Cart</span>
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
