import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import { isProductInStock, getStockDisplayText } from '../utils/inventoryService';
import { listenToCategories, DEFAULT_CATEGORIES } from '../utils/categoryService';
import { listenToBrands, DEFAULT_BRANDS } from '../utils/brandService';

function pathToCategory(pathname) {
    if (pathname.includes('phones')) return 'Phones';
    if (pathname.includes('laptops')) return 'Laptops';
    if (pathname.includes('gaming')) return 'Gaming';
    return null;
}

// Helper to clean up messy brand names from the database
function normalizeBrand(brand) {
    if (!brand) return '';
    let b = brand.trim().toLowerCase();
    
    if (b.includes('hisense')) return 'Hisense';
    if (b.includes('tcl')) return 'TCL';
    if (b.includes('lg')) return 'LG';
    if (b.includes('samsung')) return 'Samsung';
    if (b.includes('royal')) return 'Royal';
    if (b.includes('thermocool') || b.includes('haier')) return 'Thermocool';
    if (b.includes('panasonic')) return 'Panasonic';
    if (b.includes('apple') || b.includes('iphone')) return 'Apple';
    if (b.includes('sony')) return 'Sony';
    if (b.includes('hp')) return 'HP';
    
    // Default fallback: Title Case
    return b.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Custom Checkbox UI component
const CustomCheckbox = ({ checked }) => (
    <div className={`w-5 h-5 border-2 rounded transition-colors duration-200 flex items-center justify-center flex-shrink-0 ${checked ? 'border-brandLime bg-brandLime' : 'border-gray-300 group-hover:border-brandLime'}`}>
        <svg className={`w-3 h-3 text-brandBlack pointer-events-none ${checked ? 'block' : 'hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
        </svg>
    </div>
);

// Star Rating display component
const StarRating = ({ rating = 0, count }) => {
    const stars = [];
    const r = Math.min(5, Math.max(0, rating));
    for (let i = 1; i <= 5; i++) {
        if (r >= i) {
            stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
        } else if (r >= i - 0.5) {
            stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
        } else {
            stars.push(<i key={i} className="far fa-star text-gray-300"></i>);
        }
    }
    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 text-[10px]">{stars}</div>
            {count > 0 && <span className="text-[10px] text-gray-400 font-bold">({count})</span>}
        </div>
    );
};

export default function Shop() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [brands, setBrands] = useState(DEFAULT_BRANDS);

    const urlCat = searchParams.get('cat') || (searchParams.get('search') ? null : pathToCategory(location.pathname));

    const [activeCategories, setActiveCategories] = useState([]);
    const [activeBrands, setActiveBrands] = useState([]);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Popularity');

    // Subscribe to real-time categories
    useEffect(() => {
        const unsubscribe = listenToCategories((cats) => {
            setCategories(cats.length > 0 ? cats : DEFAULT_CATEGORIES);
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to real-time brands
    useEffect(() => {
        const unsubscribe = listenToBrands((brandList) => {
            setBrands(brandList.length > 0 ? brandList : DEFAULT_BRANDS);
        });
        return () => unsubscribe();
    }, []);

    // Ensure product has inventory fields
    const ensureInventoryFields = (product) => ({
        ...product,
        inventory_status: product.inventory_status || 'in_stock',
        items_left: product.items_left !== undefined ? product.items_left : 5,
        unlimited_stock: product.unlimited_stock || false,
        is_hidden: product.is_hidden || false
    });

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onSnapshot(collection(db, 'products'), (snap) => {
            let items = snap.docs.map(d => ensureInventoryFields({ id: d.id, ...d.data() })).filter(p => !p.is_hidden);
            
            if (items.length === 0) {
                items = [
                    { id: '1', name: '65-Inch 4K UHD Smart Display', price: 450000, category: 'Televisions', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80', inventory_status: 'in_stock', items_left: 5, unlimited_stock: false, is_hidden: false },
                    { id: '2', name: 'Premium Solar Inverter 5kVA', price: 599000, category: 'Solar', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80', inventory_status: 'out_of_stock', items_left: 0, unlimited_stock: false, is_hidden: false },
                    { id: '3', name: 'Pro Series Gaming Laptop', price: 850000, category: 'Laptops', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80', inventory_status: 'in_stock', items_left: 2, unlimited_stock: false, is_hidden: false },
                    { id: '4', name: 'Smart Inverter Air Conditioner', price: 320000, category: 'Air Conditioners', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1628107094038-16e7884dcc64?w=500&q=80', inventory_status: 'in_stock', items_left: 0, unlimited_stock: true, is_hidden: false }
                ];
            } else {
                items = items.map(ensureInventoryFields);
            }
            setProducts(items);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching products:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const cat = searchParams.get('cat') || pathToCategory(location.pathname);
        if (cat) {
            const match = categories.find(c => c.name.toLowerCase() === cat.toLowerCase())?.name;
            if (match) {
            setActiveCategories([match]);
            }
            setSearch('');
            setActiveBrands([]);
        }
        
        const searchQ = searchParams.get('search');
        if (searchQ) {
            setSearch(searchQ);
            setActiveCategories([]);
            setActiveBrands([]);
        }
    }, [location.search, location.pathname, searchParams, categories]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, activeCategories, activeBrands]);

    const filtered = products.filter(p => {
        const matchCat = activeCategories.length === 0 || activeCategories.includes(p.category);
        const normalizedBrand = normalizeBrand(p.brand);
        const matchBrand = activeBrands.length === 0 || activeBrands.includes(normalizedBrand);
        
        const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const searchableText = `${p.name || ''} ${normalizedBrand} ${p.category || ''} ${p.tag || ''} ${p.description || ''} ${p.ram || ''} ${p.storage || ''} ${p.os || ''} ${p.condition || ''}`.toLowerCase();
        const matchSearch = searchTerms.length === 0 || searchTerms.every(term => searchableText.includes(term));
        
        return matchCat && matchBrand && matchSearch;
    });

    // Sort filtered items based on sortBy selection
    const sorted = [...filtered].sort((a, b) => {
        switch(sortBy) {
            case 'Price: Low to High':
                return (Number(a.price) || 0) - (Number(b.price) || 0);
            case 'Price: High to Low':
                return (Number(b.price) || 0) - (Number(a.price) || 0);
            case 'Newest Arrivals':
                return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
            case 'Popularity':
            default:
                return 0; // Keeping it as is if no real popularity score exists
        }
    });

    const itemsPerPage = 100;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sorted.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sorted.length / itemsPerPage);

    return (
        <div className="bg-gray-50 flex-grow min-h-screen flex flex-col">
            {/* Page Header */}
            <div className="bg-brandBlack border-b border-gray-800 shadow-xl py-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1000&q=80')] mix-blend-overlay bg-cover bg-center"></div>
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="w-full md:w-auto">
                            <div className="inline-flex items-center space-x-2 bg-brandLime/10 border border-brandLime/30 text-brandLime px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3">
                                <i className="fa-solid fa-bolt"></i> <span>Premium Catalog</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
                                {search ? `Search: ${search}` : activeCategories.length === 0 ? 'ALL PRODUCTS' : activeCategories.join(', ')}
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

            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 flex-grow">
                {/* Sidebar Filters */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white border border-gray-100 overflow-y-auto sticky top-28 shadow-xl rounded-2xl mb-6" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
                        
                        {/* Categories */}
                        <div className="bg-brandBlack text-brandLime px-5 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-between border-b border-gray-800 rounded-t-2xl">
                            <span>Categories</span>
                            <i className="fas fa-layer-group text-gray-400 text-sm"></i>
                        </div>
                        <div className="p-3 space-y-1 bg-gray-50/30">
                            <label className="flex items-center cursor-pointer group p-2 hover:bg-white rounded-xl transition-colors w-full">
                                <input 
                                    type="checkbox"
                                    className="hidden"
                                    checked={activeCategories.length === categories.filter(c => c.name !== 'All').length && activeCategories.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setActiveCategories(categories.filter(c => c.name !== 'All').map(c => c.name));
                                        } else {
                                            setActiveCategories([]);
                                        }
                                        setCurrentPage(1);
                                    }}
                                />
                                <CustomCheckbox checked={activeCategories.length === categories.filter(c => c.name !== 'All').length && activeCategories.length > 0} />
                                <span className={`ml-3 text-sm font-medium transition-colors ${activeCategories.length === categories.filter(c => c.name !== 'All').length && activeCategories.length > 0 ? 'text-brandDark font-bold' : 'text-gray-600 group-hover:text-brandDark'}`}>
                                    All
                                </span>
                            </label>
                            {categories.filter(c => c.name !== 'All').map(cat => {
                                const isActive = activeCategories.includes(cat.name);
                                return (
                                    <label key={cat.id || cat.name} className="flex items-center cursor-pointer group p-2 hover:bg-white rounded-xl transition-colors w-full">
                                        <input 
                                            type="checkbox"
                                            className="hidden"
                                            checked={isActive}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setActiveCategories(prev => [...prev, cat.name]);
                                                } else {
                                                    setActiveCategories(prev => prev.filter(c => c !== cat.name));
                                                }
                                                setCurrentPage(1);
                                            }}
                                        />
                                        <CustomCheckbox checked={isActive} />
                                        <span className={`ml-3 text-sm font-medium transition-colors ${isActive ? 'text-brandDark font-bold' : 'text-gray-600 group-hover:text-brandDark'}`}>
                                            {cat.name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Brands */}
                        <div className="bg-brandBlack text-brandLime px-5 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-between border-t border-gray-800">
                            <span>Brands</span>
                            <i className="fas fa-tag text-gray-400 text-sm"></i>
                        </div>
                        <div className="p-3 space-y-1 bg-gray-50/30 max-h-56 overflow-y-auto">
                            <label className="flex items-center cursor-pointer group p-2 hover:bg-white rounded-xl transition-colors w-full">
                                <input 
                                    type="checkbox"
                                    className="hidden"
                                    checked={activeBrands.length === brands.length && activeBrands.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setActiveBrands(brands.map(b => b.name));
                                        } else {
                                            setActiveBrands([]);
                                        }
                                        setCurrentPage(1);
                                    }}
                                />
                                <CustomCheckbox checked={activeBrands.length === brands.length && activeBrands.length > 0} />
                                <span className={`ml-3 text-sm font-medium transition-colors ${activeBrands.length === brands.length && activeBrands.length > 0 ? 'text-brandDark font-bold' : 'text-gray-600 group-hover:text-brandDark'}`}>
                                    All
                                </span>
                            </label>
                            {brands.map(brand => {
                                const isActive = activeBrands.includes(brand.name);
                                return (
                                    <label key={brand.id || brand.name} className="flex items-center cursor-pointer group p-2 hover:bg-white rounded-xl transition-colors w-full">
                                        <input 
                                            type="checkbox"
                                            className="hidden"
                                            checked={isActive}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setActiveBrands(prev => [...prev, brand.name]);
                                                } else {
                                                    setActiveBrands(prev => prev.filter(b => b !== brand.name));
                                                }
                                                setCurrentPage(1);
                                            }}
                                        />
                                        <CustomCheckbox checked={isActive} />
                                        <span className={`ml-3 text-sm font-medium transition-colors ${isActive ? 'text-brandDark font-bold' : 'text-gray-600 group-hover:text-brandDark'}`}>
                                            {brand.name}
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
                            Showing <span className="font-black text-brandDark">{sorted.length > 0 ? indexOfFirstItem + 1 : 0}–{Math.min(indexOfLastItem, sorted.length)}</span> of <span className="font-black text-brandDark">{sorted.length}</span> assets
                        </p>
                        <div className="flex items-center space-x-3">
                            <div className="relative bg-gray-50 rounded-xl p-1 border border-gray-100 flex items-center w-full sm:w-auto">
                                <span className="pl-3 pr-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Sort:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                    className="appearance-none bg-transparent text-brandDark py-1.5 pl-2 pr-8 text-sm font-bold focus:outline-none cursor-pointer w-full sm:w-auto"
                                >
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
                        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
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
                                onClick={() => { 
                                    setSearch(''); 
                                    setActiveCategories([]);
                                    setActiveBrands([]);
                                }}
                                className="bg-brandDark hover:bg-brandBlack text-brandLime font-black py-3 px-8 rounded-xl uppercase tracking-widest text-xs transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
                            {currentItems.map((p, idx) => {
                                const inStock = isProductInStock(p);
                                return (
                                <div key={p.id} onClick={() => navigate(`/products/${p.id}`)} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 flex flex-col group relative overflow-hidden cursor-pointer animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 items-start">
                                        <span className="bg-slate-900/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                                            {p.category ? p.category.split(' ')[0] : 'SOLAR'}
                                        </span>
                                        {p.featured && (
                                            <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                                                <i className="fas fa-star text-[8px]"></i> Featured
                                            </span>
                                        )}
                                        {p.tag && (
                                            <span className="bg-brandLime text-brandDark text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                                                {p.tag}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                                        <button onClick={e => e.stopPropagation()} className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all"><i className="fa-regular fa-heart"></i></button>
                                        <button onClick={e => e.stopPropagation()} className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all"><i className="fa-solid fa-code-compare"></i></button>
                                    </div>
                                    
                                    <div className="relative h-32 sm:h-56 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-2 sm:p-6 group-hover:bg-gray-50 transition-colors duration-500">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brandLime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <img src={p.img || p.images?.[0] || 'https://via.placeholder.com/150'} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-sm" />
                                    </div>
                                    
                                    <div className="p-2 sm:p-6 flex flex-col flex-grow bg-white relative z-20">
                                        <p className="hidden sm:block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            {normalizeBrand(p.brand) || 'Official Partner'}
                                        </p>
                                        <h3 className="text-[11px] sm:text-base font-black text-brandDark mb-1 sm:mb-2 leading-tight group-hover:text-brandLime transition-colors duration-300 line-clamp-2 min-h-[28px] sm:min-h-[44px]">
                                            {p.name}
                                        </h3>
                                        
                                        {/* Star Rating - hidden on mobile */}
                                        <div className="hidden sm:block mb-3">
                                            <StarRating
                                                rating={p.averageRating || p.rating || 0}
                                                count={p.reviewCount || p.numReviews || 0}
                                            />
                                        </div>
                                        
                                        <div className="mt-auto pt-2 sm:pt-4 border-t border-gray-100">
                                            {/* Inventory Status - hidden on mobile */}
                                            <div className="hidden sm:block mb-2">
                                                {inStock ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 text-[10px] font-black uppercase tracking-widest">
                                                        <i className="fas fa-check-circle"></i> {getStockDisplayText(p)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                                        <i className="fas fa-exclamation-circle"></i> {getStockDisplayText(p)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-end space-x-1 sm:space-x-2 mb-2 sm:mb-4">
                                                <span className="text-sm sm:text-2xl font-black text-brandDark tracking-tight">
                                                    ₦{Number(p.pss && p.pss > 0 ? p.pss : p.price).toLocaleString()}
                                                </span>
                                                {p.pss && p.pss > 0 && Number(p.pss) < Number(p.price) && (
                                                    <span className="hidden sm:inline text-sm text-gray-400 line-through font-bold mb-1">
                                                        ₦{Number(p.price).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/products/${p.id}`); }}
                                                disabled={!inStock}
                                                className={`w-full ${inStock ? 'bg-brandDark text-white hover:bg-brandLime hover:text-brandBlack shadow-md hover:shadow-brandLime/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'} font-bold text-[10px] sm:text-sm py-2 sm:py-3.5 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 overflow-hidden relative group/btn`}
                                            >
                                                <span className="relative z-10 flex items-center space-x-1 sm:space-x-2">
                                                    <i className={`fa-solid fa-cart-shopping ${inStock ? 'transition-transform group-hover/btn:-translate-y-1' : ''}`}></i>
                                                    <span className="hidden sm:inline">{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                                                    <span className="sm:hidden">{inStock ? 'Buy' : 'N/A'}</span>
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {!loading && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-10 mb-4">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="px-5 py-3 bg-white border-2 border-gray-200 hover:border-brandLime hover:bg-brandLime hover:text-brandDark text-gray-600 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 shadow-sm"
                            >
                                <i className="fas fa-chevron-left mr-2"></i> Prev
                            </button>
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-widest px-4">
                                Page <span className="text-brandDark font-black">{currentPage}</span> of {totalPages}
                            </span>
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="px-5 py-3 bg-white border-2 border-gray-200 hover:border-brandLime hover:bg-brandLime hover:text-brandDark text-gray-600 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 shadow-sm"
                            >
                                Next <i className="fas fa-chevron-right ml-2"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
