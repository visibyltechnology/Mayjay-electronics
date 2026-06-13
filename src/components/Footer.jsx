import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const year = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const WHATSAPP_LINK = 'https://wa.me/2347066514355?text=Hi%20Mayjay%20Concepts%2C%20I%20want%20to%20enquire%20about%20a%20product.';

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setIsSubscribed(true);
            setTimeout(() => { setIsSubscribed(false); setEmail(''); }, 4000);
        }
    };

    return (
        <footer className="bg-brandBlack text-gray-400 mt-auto border-t-4 border-brandLime font-sans antialiased">

            {/* ── Newsletter Strip ── */}
            <div className="bg-gradient-to-r from-brandDark via-brandBlack to-brandDark py-12 relative overflow-hidden shadow-inner border-b border-gray-800">
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#c8f542_20%,transparent_20%)] [background-size:16px_16px]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="text-center lg:text-left">
                        <span className="bg-brandLime/20 text-brandLime text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3">
                            ⚡ Flash Sales & New Arrivals
                        </span>
                        <h3 className="text-white font-black text-2xl sm:text-3xl uppercase tracking-tight leading-none">
                            Stay Ahead. Shop Smart.
                        </h3>
                        <p className="text-gray-400 text-sm mt-2 font-medium max-w-xl">
                            Get notified about exclusive deals, price drops, and the latest electronics & solar products in your inbox.
                        </p>
                    </div>
                    <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto rounded-2xl overflow-hidden shadow-2xl min-w-full sm:min-w-[420px] transition-all duration-300 focus-within:ring-4 focus-within:ring-brandLime/20">
                        <input
                            type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address..."
                            className="w-full lg:w-80 py-4 px-5 outline-none text-sm text-gray-900 bg-white placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            className={`px-8 font-black text-xs uppercase tracking-widest transition-all duration-300 flex-shrink-0 flex items-center justify-center min-w-[130px] ${isSubscribed ? 'bg-green-600 text-white' : 'bg-brandLime hover:bg-white text-brandBlack'}`}
                        >
                            {isSubscribed ? <span className="flex items-center gap-2"><i className="fas fa-check-circle text-sm"></i>Done!</span> : 'Subscribe'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Main Footer Layout ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                    {/* Brand Meta Column */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="inline-block group mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-brandDark p-2.5 rounded-full border border-brandLime/50 group-hover:border-brandLime transition-all">
                                    <i className="fa-solid fa-microchip text-brandLime text-lg"></i>
                                </div>
                                <div className="font-black tracking-tight leading-none">
                                    <span className="text-white text-2xl">MAYJAY</span>
                                    <span className="text-brandLime text-2xl ml-1">CONCEPTS</span>
                                </div>
                            </div>
                            <div className="text-[9px] text-gray-500 uppercase tracking-[0.25em] font-bold pl-0.5">
                                Electronics • Solar • Power Solutions
                            </div>
                        </Link>
                        <p className="text-sm mb-6 leading-relaxed text-gray-400 font-medium max-w-sm">
                            Nigeria's trusted destination for authentic electronics, smart gadgets, and sustainable solar power solutions. Nationwide delivery guaranteed.
                        </p>

                        {/* Social Bar */}
                        <div className="flex items-center gap-3">
                            {[
                                { icon: 'fa-whatsapp', href: WHATSAPP_LINK, fab: true },
                                { icon: 'fa-facebook-f', href: '#', fab: true },
                                { icon: 'fa-instagram', href: '#', fab: true },
                                { icon: 'fa-tiktok', href: '#', fab: true }
                            ].map((s, idx) => (
                                <a key={idx} href={s.href} target="_blank" rel="noreferrer"
                                    className="w-10 h-10 bg-[#161f32] hover:bg-brandLime flex items-center justify-center rounded-xl text-white hover:text-brandBlack text-sm transition-all duration-300 transform hover:-translate-y-1.5">
                                    <i className={`${s.fab ? 'fab' : 'fas'} ${s.icon}`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 md:pl-4">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 pb-3 border-b border-gray-800/60 flex items-center gap-2">
                            <span className="w-1.5 h-3.5 bg-brandLime rounded-full"></span>
                            Quick Links
                        </h4>
                        <ul className="space-y-3.5">
                            {[
                                { label: 'Shop All Products', to: '/products' },
                                { label: 'Solar & Power Systems', to: '/products?cat=Solar' },
                                { label: 'Air Conditioners', to: '/products?cat=Air+Conditioners' },
                                { label: 'My Account', to: '/profile' },
                                { label: 'Delivery Info', to: '/delivery' },
                            ].map((l, idx) => (
                                <li key={idx}>
                                    <Link to={l.to} className="text-sm text-gray-400 hover:text-white transition-all duration-200 flex items-center gap-2 font-medium group">
                                        <i className="fas fa-angle-right text-brandLime text-xs transition-transform duration-200 group-hover:translate-x-1"></i>
                                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">{l.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 pb-3 border-b border-gray-800/60 flex items-center gap-2">
                            <span className="w-1.5 h-3.5 bg-brandLime rounded-full"></span>
                            Support
                        </h4>
                        <ul className="space-y-3.5">
                            {[
                                { label: 'Terms & Services', to: '/terms' },
                                { label: 'Privacy Policy', to: '/privacy' },
                                { label: 'Returns & Exchanges', href: 'https://wa.me/2347066514355?text=Returns' },
                                { label: 'Secure Ordering', to: '/products' },
                            ].map((l, idx) => (
                                <li key={idx}>
                                    {l.href ? (
                                        <a href={l.href} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white transition-all duration-200 flex items-center gap-2 font-medium group">
                                            <i className="fas fa-angle-right text-brandLime text-xs group-hover:translate-x-1 transition-transform"></i>
                                            <span className="group-hover:translate-x-0.5 transition-transform">{l.label}</span>
                                        </a>
                                    ) : (
                                        <Link to={l.to} className="text-sm text-gray-400 hover:text-white transition-all duration-200 flex items-center gap-2 font-medium group">
                                            <i className="fas fa-angle-right text-brandLime text-xs group-hover:translate-x-1 transition-transform"></i>
                                            <span className="group-hover:translate-x-0.5 transition-transform">{l.label}</span>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Location Card */}
                    <div className="lg:col-span-4 bg-[#111724]/60 p-6 rounded-2xl border border-gray-800/70 backdrop-blur-sm self-start">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-3.5 bg-brandLime rounded-full"></span>
                                Our Store
                            </span>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </h4>

                        <div className="space-y-4 flex flex-col justify-between">
                            <div className="space-y-3.5">
                                <div className="flex items-start gap-3 group">
                                    <div className="w-8 h-8 bg-[#182032] group-hover:bg-brandLime/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                                        <i className="fas fa-map-marker-alt text-brandLime text-xs"></i>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed font-semibold">Shop 3, Aboderin Shopping Complex, beside California Luxury Hotel and Suites, Agbaje-Orita Challenge, Ibadan.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-[#182032] rounded-xl flex items-center justify-center flex-shrink-0">
                                        <i className="fab fa-whatsapp text-green-400 text-sm"></i>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <a href="https://wa.me/2347066514355" target="_blank" rel="noreferrer" className="text-xs text-green-400 font-bold tracking-wide hover:text-green-300 transition-colors">
                                            07066514355
                                        </a>
                                        <span className="text-xs text-gray-400 font-medium tracking-wide">09116763595</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#182032] rounded-xl flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-clock text-brandLime text-xs"></i>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">Mon–Sat: 8am – 7pm</span>
                                </div>
                            </div>
                            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 mt-4">
                                <i className="fab fa-whatsapp text-base"></i>
                                Chat Us on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Category Cloud ── */}
                <div className="border-t border-gray-800/80 pt-10 pb-8">
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.15em] mb-4">Popular Categories</div>
                    <div className="flex flex-wrap gap-2.5">
                        {[
                            'Air Conditioners', 'Televisions', 'Refrigerators', 'Generators',
                            'Washing Machines', 'Phones', 'Laptops', 'Solar', 'Inverters', 'Audio'
                        ].map((cat, idx) => (
                            <Link key={idx} to={`/products?cat=${encodeURIComponent(cat)}`}
                                className="text-[11px] font-bold text-gray-400 hover:text-brandBlack bg-[#121826] hover:bg-brandLime px-4 py-2.5 rounded-xl border border-gray-800/40 hover:border-transparent transition-all duration-200">
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div className="border-t border-gray-800/80 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="text-xs text-gray-500 font-semibold text-center lg:text-left">
                        © {year} <span className="text-gray-300 font-bold">Mayjay Concepts Limited</span>. All Rights Reserved.
                        <span className="mx-2.5 text-gray-700">|</span>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <span className="mx-2.5 text-gray-700">|</span>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-1.5 bg-brandDark px-3 py-1.5 rounded-md text-white border border-gray-800">
                            <i className="fa-solid fa-shield-halved text-brandLime text-xs"></i>
                            <span className="text-[10px] font-bold tracking-wider uppercase">Secured Payment</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-brandDark px-3 py-1.5 rounded-md border border-gray-800">
                            <div className="flex space-x-0.5 h-3.5 w-5 rounded overflow-hidden">
                                <div className="bg-emerald-700 w-1/3 h-full"></div>
                                <div className="bg-white w-1/3 h-full"></div>
                                <div className="bg-emerald-700 w-1/3 h-full"></div>
                            </div>
                            <span className="text-white text-[10px] font-extrabold tracking-widest uppercase">Nigerian Business</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8 text-[9px] font-black uppercase tracking-[0.4em] text-gray-700">
                    ESTABLISHED IN NIGERIA <span className="text-brandLime font-light">|</span> NATIONWIDE DELIVERY ASSURED
                </div>
            </div>
        </footer>
    );
}
