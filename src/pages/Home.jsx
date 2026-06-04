import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';

const DEFAULT_SLIDES = [
    {
        id: 1,
        title: "PREMIUM ELECTRONICS.",
        subtitle: "The MAYJAY Concept fuses high-efficiency power infrastructure with cutting-edge home electronics.",
        buttonText: "EXPLORE CATALOG",
        link: "/products",
        image: "https://images.unsplash.com/photo-1550009158-9ffb6e9f82d1?auto=format&fit=crop&w=1000&q=80"
    }
];

const DEFAULT_FEATURED = [
    { id: '1', name: '65-Inch 4K UHD Smart Display', price: 450000, category: 'Televisions', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80' },
    { id: '2', name: 'Premium Solar Inverter 5kVA', price: 599000, category: 'Solar', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80' },
    { id: '3', name: 'Pro Series Gaming Laptop', price: 850000, category: 'Laptops', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80' },
    { id: '4', name: 'Smart Inverter Air Conditioner', price: 320000, category: 'Air Conditioners', brand: 'MAYJAY', img: 'https://images.unsplash.com/photo-1628107094038-16e7884dcc64?w=500&q=80' }
];

export default function Home() {
    const [featured, setFeatured] = useState(DEFAULT_FEATURED);
    const [featLoading, setFeatLoading] = useState(false);
    const [slides, setSlides] = useState(DEFAULT_SLIDES);
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setFeatLoading(true);
                const settingsSnap = await getDoc(doc(db, 'settings', 'site_settings'));
                if (settingsSnap.exists() && settingsSnap.data().heroSlides && settingsSnap.data().heroSlides.length > 0) {
                    setSlides(settingsSnap.data().heroSlides);
                }

                const q = query(collection(db, "products"), where("featured", "==", true), limit(4));
                const snap = await getDocs(q);
                let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                
                if (items.length > 0) {
                    setFeatured(items);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setFeatLoading(false);
            }
        };
        fetchData();
    }, []);

    const activeHero = slides[currentSlide] || DEFAULT_SLIDES[0];

    return (
        <div className="bg-gray-50 flex-grow flex flex-col min-h-screen">
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                {/* HERO & QUICK-VIEW GRID SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Side: Immersive Hero */}
                    <div className="lg:col-span-7 bg-brandBlack rounded-2xl relative overflow-hidden group shadow-2xl flex flex-col justify-between min-h-[420px] p-8 sm:p-12 border border-gray-800">
                        <div 
                            className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url('${activeHero.image}')` }}
                        ></div>

                        <div className="absolute top-4 right-4 bg-brandLime/20 border border-brandLime/40 text-brandLime text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Smart Living
                        </div>

                        <div className="relative z-10 max-w-xl my-auto">
                            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                                {activeHero.title}
                            </h1>
                            <p className="text-gray-400 mt-4 text-sm sm:text-base font-light max-w-md">
                                {activeHero.subtitle || "High-efficiency power infrastructure with cutting-edge home electronics."}
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-wrap gap-4 pt-6">
                            <Link to={activeHero.link || "/products"} className="bg-brandLime text-brandBlack font-bold px-6 py-3 rounded-lg hover:bg-white shadow-lg transition-all duration-300 flex items-center space-x-2 group/btn text-sm">
                                <span>{activeHero.buttonText || "EXPLORE"}</span>
                                <i className="fa-solid fa-arrow-right transition-transform duration-300 group-hover/btn:translate-x-1"></i>
                            </Link>
                            <Link to="/products" className="border border-gray-700 text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-all text-sm">
                                View Catalog
                            </Link>
                        </div>

                        {/* Slider Indicators */}
                        <div className="flex space-x-2 mt-6 z-10">
                            {slides.map((_, idx) => (
                                <span 
                                    key={idx} 
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentSlide ? 'w-8 bg-brandLime' : 'w-2 bg-gray-700 hover:bg-gray-500'}`}
                                ></span>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: NEW ARRIVALS — Premium Cards */}
                    <div className="lg:col-span-5 flex flex-col">

                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-5 mt-8 lg:mt-0">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-1">
                                    <span className="w-6 h-1 bg-brandLime rounded-full"></span>
                                    <span className="w-3 h-1 bg-brandGreen rounded-full"></span>
                                </div>
                                <h3 className="text-sm font-black tracking-[0.2em] text-brandDark uppercase">New Arrivals</h3>
                            </div>
                            <Link to="/products" className="group/sa flex items-center gap-1.5 text-[11px] font-bold text-brandGreen hover:text-brandLime border border-brandGreen/30 hover:border-brandLime/60 hover:bg-brandLime/5 px-3 py-1.5 rounded-lg transition-all duration-200">
                                <span>See All</span>
                                <i className="fa-solid fa-arrow-right text-[9px] group-hover/sa:translate-x-0.5 transition-transform"></i>
                            </Link>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-2 gap-3 flex-1">
                            {featLoading ? (
                                [1,2,3,4].map(i => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse flex flex-col">
                                        <div className="h-32 bg-gradient-to-b from-gray-100 to-gray-50"></div>
                                        <div className="p-3 space-y-2">
                                            <div className="h-3 bg-gray-100 rounded w-4/5"></div>
                                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                            <div className="h-7 bg-gray-100 rounded-lg w-full mt-3"></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                featured.slice(0, 4).map((product, idx) => {
                                    const badges = [
                                        { label: 'SOLAR', color: 'bg-brandDark/90 text-white' },
                                        { label: 'INVERTER', color: 'bg-brandDark/90 text-white' },
                                        { label: 'BATTERY', color: 'bg-brandDark/90 text-white' },
                                        { label: 'HARDWARE', color: 'bg-brandDark/90 text-white' },
                                    ];
                                    const tags = [
                                        { label: 'New', color: 'bg-brandLime text-brandBlack' },
                                        { label: 'Hot', color: 'bg-brandYellow text-brandBlack' },
                                        null,
                                        null,
                                    ];
                                    const installment = Math.round(product.price / 4).toLocaleString();
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => navigate(`/products/${product.id}`)}
                                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-400 border border-gray-100 flex flex-col group relative overflow-hidden cursor-pointer"
                                        >
                                            {/* Category Badge — top-left */}
                                            <div className="absolute top-2.5 left-2.5 z-30">
                                                <span className="bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded-md tracking-widest uppercase whitespace-nowrap">
                                                    {product.category
                                                        ? product.category.split(' ')[0].toUpperCase()
                                                        : ['SOLAR','INVERTER','BATTERY','HARDWARE'][idx] ?? 'NEW'}
                                                </span>
                                            </div>

                                            {/* Sale / New tag — bottom-left of image */}
                                            {[
                                                { label: 'New', cls: 'bg-lime-400 text-slate-900' },
                                                { label: 'Hot', cls: 'bg-yellow-400 text-slate-900' },
                                                null, null
                                            ][idx] && (
                                                <div className="absolute top-10 left-2.5 z-30">
                                                    <span className={`${{ 0:'bg-lime-400 text-slate-900', 1:'bg-yellow-400 text-slate-900' }[idx]} text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap`}>
                                                        {[{ label: 'New' }, { label: 'Hot' }][idx]?.label}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Hover Actions */}
                                            <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-7 h-7 bg-white/90 backdrop-blur rounded-lg text-brandDark hover:text-red-500 shadow-md flex items-center justify-center transition-all text-xs"
                                                >
                                                    <i className="fa-regular fa-heart"></i>
                                                </button>
                                                <button
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-7 h-7 bg-white/90 backdrop-blur rounded-lg text-brandDark hover:text-brandGreen shadow-md flex items-center justify-center transition-all text-xs"
                                                >
                                                    <i className="fa-solid fa-code-compare"></i>
                                                </button>
                                            </div>

                                            {/* Image Area */}
                                            <div className="relative h-32 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-hidden group-hover:bg-gray-50 transition-colors duration-500">
                                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brandLime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                <img
                                                    src={product.img || product.images?.[0] || 'https://via.placeholder.com/150'}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-sm"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="p-3 flex flex-col flex-grow">
                                                <h4 className="text-[11px] font-black text-brandDark leading-tight line-clamp-2 group-hover:text-brandGreen transition-colors duration-300 mb-2">
                                                    {product.name}
                                                </h4>

                                                <div className="mt-auto">
                                                    {/* Price */}
                                                    <div className="flex items-baseline gap-1.5 mb-1.5">
                                                        <span className="text-base font-black text-brandDark tracking-tight">
                                                            ₦{Number(product.price).toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Installment Button */}
                                                    <button
                                                        type="button"
                                                        onClick={e => e.stopPropagation()}
                                                        className="w-full flex items-center justify-center gap-1 text-[9px] font-bold text-gray-600 bg-white border-2 border-gray-200 hover:border-brandLime hover:bg-brandLime/5 hover:text-brandDark px-2 py-2 rounded-lg transition-all duration-300 mb-2.5 group/inst active:scale-[0.98]"
                                                    >
                                                        <i className="fa-solid fa-layer-group text-brandGreen group-hover/inst:text-brandDark transition-colors text-[8px]"></i>
                                                        <span>Install payment</span>
                                                    </button>

                                                    {/* CTA */}
                                                    <button
                                                        onClick={e => { e.stopPropagation(); navigate(`/products/${product.id}`); }}
                                                        className="w-full bg-brandDark text-white hover:bg-brandLime hover:text-brandBlack font-bold text-[10px] py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm group/btn"
                                                    >
                                                        <i className="fa-solid fa-cart-shopping group-hover/btn:scale-110 transition-transform text-[9px]"></i>
                                                        <span>Add to Cart</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* TWO-COLUMN CORE BUSINESS DIVISIONS */}
                <section className="py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-brandDark to-brandBlack rounded-2xl p-8 text-white relative overflow-hidden group shadow-xl border border-gray-800">
                            <div className="absolute -right-10 -bottom-10 opacity-10 text-[180px] text-brandLime group-hover:rotate-12 transition-transform duration-500">
                                <i className="fa-solid fa-solar-panel"></i>
                            </div>
                            <span className="text-brandLime font-bold text-xs uppercase tracking-widest block mb-2">Sustainable Energy</span>
                            <h3 className="text-2xl font-black mb-3">SOLAR POWER SYSTEMS</h3>
                            <p className="text-gray-400 text-sm max-w-sm mb-6">High-performance solar panels, smart inverters, and reliable battery backups for uninterrupted power supply.</p>
                            <Link to="/products?cat=Solar" className="inline-flex items-center space-x-2 text-sm font-bold text-white hover:text-brandLime transition-colors group/link">
                                <span>Configure System</span>
                                <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover/link:translate-x-1"></i>
                            </Link>
                        </div>

                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 text-brandDark relative overflow-hidden group shadow-xl border border-gray-200">
                            <div className="absolute -right-10 -bottom-10 opacity-5 text-[180px] text-brandDark group-hover:-rotate-12 transition-transform duration-500">
                                <i className="fa-solid fa-microchip"></i>
                            </div>
                            <span className="text-brandGreen font-bold text-xs uppercase tracking-widest block mb-2">Smart Living & Trade</span>
                            <h3 className="text-2xl font-black mb-3">E-COMMERCE ELECTRONICS</h3>
                            <p className="text-gray-600 text-sm max-w-sm mb-6">Explore premium home appliances, smart devices, and the latest consumer electronics for a modern lifestyle.</p>
                            <Link to="/products?cat=Electronics" className="inline-flex items-center space-x-2 text-sm font-bold text-brandDark hover:text-brandGreen transition-colors group/link">
                                <span>Browse Store</span>
                                <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover/link:translate-x-1"></i>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FEATURED PRODUCTS SHOWCASE */}
                <section id="featured-products" className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-gray-100 my-4">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-brandLime/10 border border-brandLime/30 text-brandGreen px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
                            <i className="fa-solid fa-bolt"></i> <span>Premium Selection</span>
                        </div>
                        <h2 className="text-3xl font-black text-brandDark">MAYJAY TOP PICKS</h2>
                        <p className="text-gray-500 text-sm mt-2">Handpicked electronics, solar systems &amp; smart devices — built for performance, priced for value.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

                        {/* Card 1 — Solar Panel */}
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 flex flex-col group relative overflow-hidden">
                            <div className="absolute top-4 left-4 z-30 flex gap-2">
                                <span className="bg-brandDark/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider">SOLAR</span>
                                <span className="bg-brandYellow text-brandBlack text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">Sale</span>
                            </div>
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                <button className="w-9 h-9 bg-white/90 rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all">
                                    <i className="fa-regular fa-heart"></i>
                                </button>
                                <button className="w-9 h-9 bg-white/90 rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all">
                                    <i className="fa-solid fa-code-compare"></i>
                                </button>
                            </div>
                            <div className="relative h-56 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6 group-hover:bg-gray-50 transition-colors duration-500">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brandLime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80" alt="Solar Panel" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-sm" />
                            </div>
                            <div className="p-6 flex flex-col flex-grow bg-white relative z-20">
                                <h3 className="text-base font-black text-brandDark mb-3 leading-tight group-hover:text-brandLime transition-colors duration-300">Monocrystalline Solar Panel 500W Premium</h3>
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex items-end space-x-2 mb-1">
                                        <span className="text-2xl font-black text-brandDark tracking-tight">₦85,000</span>
                                        <span className="text-xs font-medium text-gray-400 line-through pb-1.5">₦105,000</span>
                                    </div>
                                    <button type="button" className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 hover:border-brandLime hover:bg-brandLime/5 hover:text-brandDark px-3 py-2.5 rounded-xl transition-all duration-300 mb-4 group/inst active:scale-[0.98]">
                                        <i className="fa-solid fa-layer-group text-brandGreen group-hover/inst:text-brandDark transition-colors"></i>
                                        <span>Install payment</span>
                                    </button>
                                    <Link to="/products" className="w-full bg-brandDark text-white hover:bg-brandLime hover:text-brandBlack font-bold text-sm py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-brandLime/20 group/btn">
                                        <i className="fa-solid fa-cart-shopping transition-transform group-hover/btn:-translate-y-1"></i>
                                        <span>Add to Cart</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 — Smartphone */}
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 flex flex-col group relative overflow-hidden">
                            <div className="absolute top-4 left-4 z-30 flex gap-2">
                                <span className="bg-brandDark/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider">PHONES</span>
                                <span className="bg-brandLime text-brandBlack text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">New</span>
                            </div>
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                <button className="w-9 h-9 bg-white/90 rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all">
                                    <i className="fa-regular fa-heart"></i>
                                </button>
                                <button className="w-9 h-9 bg-white/90 rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all">
                                    <i className="fa-solid fa-code-compare"></i>
                                </button>
                            </div>
                            <div className="relative h-56 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6 group-hover:bg-gray-50 transition-colors duration-500">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img src="https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=500&q=80" alt="Smartphone" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-sm" />
                            </div>
                            <div className="p-6 flex flex-col flex-grow bg-white relative z-20">
                                <h3 className="text-base font-black text-brandDark mb-3 leading-tight group-hover:text-brandLime transition-colors duration-300">Premium Pro Series Smartphone</h3>
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex items-end space-x-2 mb-1">
                                        <span className="text-2xl font-black text-brandDark tracking-tight">₦650,000</span>
                                    </div>
                                    <button type="button" className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 hover:border-brandLime hover:bg-brandLime/5 hover:text-brandDark px-3 py-2.5 rounded-xl transition-all duration-300 mb-4 group/inst active:scale-[0.98]">
                                        <i className="fa-solid fa-layer-group text-brandGreen group-hover/inst:text-brandDark transition-colors"></i>
                                        <span>Install payment</span>
                                    </button>
                                    <Link to="/products" className="w-full bg-brandDark text-white hover:bg-brandLime hover:text-brandBlack font-bold text-sm py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-brandLime/20 group/btn">
                                        <i className="fa-solid fa-cart-shopping transition-transform group-hover/btn:-translate-y-1"></i>
                                        <span>Add to Cart</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 — Smart TV */}
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 flex flex-col group relative overflow-hidden">
                            <div className="absolute top-4 left-4 z-30 flex gap-2">
                                <span className="bg-brandDark/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider">ELECTRONICS</span>
                            </div>
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                <button className="w-9 h-9 bg-white/90 rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all">
                                    <i className="fa-regular fa-heart"></i>
                                </button>
                                <button className="w-9 h-9 bg-white/90 rounded-xl text-brandDark hover:text-brandLime hover:bg-brandDark shadow-lg flex items-center justify-center transition-all">
                                    <i className="fa-solid fa-code-compare"></i>
                                </button>
                            </div>
                            <div className="relative h-56 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6 group-hover:bg-gray-50 transition-colors duration-500">
                                <img src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80" alt="Smart TV" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-sm" />
                            </div>
                            <div className="p-6 flex flex-col flex-grow bg-white relative z-20">
                                <h3 className="text-base font-black text-brandDark mb-3 leading-tight group-hover:text-brandLime transition-colors duration-300">65-Inch 4K UHD Smart Display</h3>
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex items-end space-x-2 mb-1">
                                        <span className="text-2xl font-black text-brandDark tracking-tight">₦450,000</span>
                                    </div>
                                    <button type="button" className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 hover:border-brandLime hover:bg-brandLime/5 hover:text-brandDark px-3 py-2.5 rounded-xl transition-all duration-300 mb-4 group/inst active:scale-[0.98]">
                                        <i className="fa-solid fa-layer-group text-brandGreen group-hover/inst:text-brandDark transition-colors"></i>
                                        <span>Install payment</span>
                                    </button>
                                    <Link to="/products" className="w-full bg-brandDark text-white hover:bg-brandLime hover:text-brandBlack font-bold text-sm py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-brandLime/20 group/btn">
                                        <i className="fa-solid fa-cart-shopping transition-transform group-hover/btn:-translate-y-1"></i>
                                        <span>Add to Cart</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* CTA Banner */}
                    <div className="mt-12 bg-brandBlack rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-800">
                        <div className="flex items-center space-x-4">
                            <div className="text-brandLime text-3xl hidden sm:block"><i className="fa-solid fa-bolt-lightning animate-pulse"></i></div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Explore the full MAYJAY catalogue</h4>
                                <p className="text-gray-400 text-xs">Solar, smart electronics, industrial hardware &amp; more — all with flexible instalment payment options.</p>
                            </div>
                        </div>
                        <Link to="/products" className="bg-brandLime text-brandBlack font-black text-xs px-6 py-3 rounded-lg hover:bg-white transition-all tracking-wider uppercase whitespace-nowrap flex items-center space-x-2">
                            <span>Shop All Products</span>
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
