import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Info, Search, ChevronLeft, Minus, Plus } from 'lucide-react';
import cartBG from "../../assets/cartBG.png";
import DishCard from '../../components/customer/DishCard';
import { restaurantService } from '../../services/restaurant.service';
import { menuService } from '../../services/menu.service';
import { useCart } from '../../features/customer/CartContext';

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('');
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState({ categories: [], items: [] });
    const [loading, setLoading] = useState(true);
    const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const [restRes, menuRes] = await Promise.all([
                    restaurantService.getRestaurantById(id),
                    menuService.getMenuByRestaurantId(id)
                ]);

                const rData = restRes.data;
                // Add default banner if none
                if (!rData.imageUrl) {
                    rData.imageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop';
                }
                setRestaurant(rData);

                const cData = menuRes.data || [];
                const parsedCats = cData.map(c => c.name);
                const parsedItems = cData.flatMap(c => (c.menuItems || []).map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    price: `PKR ${item.price}`,
                    rawPrice: item.price,
                    image: item.image || item.imageUrl || null,
                    category: c.name,
                    badge: null
                })));

                setMenu({ categories: parsedCats, items: parsedItems });
                if (parsedCats.length > 0) setActiveCategory(parsedCats[0]);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const scrollToCategory = (category) => {
        setActiveCategory(category);
        const element = document.getElementById(category);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!restaurant) return <div className="min-h-screen flex items-center justify-center">Restaurant not found.</div>;

    return (
        <div className="bg-white min-h-screen">
            {/* Banner Image */}
            <div className="relative h-64 md:h-80 w-full">
                <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
                    >
                        <ChevronLeft className="w-6 h-6 text-neutral-900" />
                    </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                    <h1 className="text-3xl md:text-5xl font-bold mb-2">{restaurant.name}</h1>
                    <p className="text-lg opacity-90">{restaurant.cuisine}</p>
                </div>
            </div>

            <div className="max-w-content mx-auto px-4 py-8">
                {/* Info Strip */}
                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base border-b border-neutral-100 pb-6 mb-8">
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-green-600 fill-current" />
                        <span className="font-bold text-neutral-900">{restaurant.averageRating || 4.5}</span>
                        <span className="text-neutral-500">({restaurant.reviewCount || 100}+ ratings)</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                        <Clock className="w-5 h-5" />
                        <span>{restaurant.deliveryTime} delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                        <Info className="w-5 h-5" />
                        <span>{restaurant.address}</span>
                    </div>
                </div>

                {/* Menu Navigation (Sticky) */}
                <div className="sticky top-20 z-20 bg-white py-4 border-b border-neutral-100 mb-8 overflow-x-auto no-scrollbar">
                    <div className="flex gap-4">
                        {menu.categories.map((cat, idx) => (
                            <button
                                key={`nav-${cat}-${idx}`}
                                onClick={() => scrollToCategory(cat)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all ${activeCategory === cat
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Sections */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left: Menu */}
                    <div className="flex-1 space-y-12">
                        {menu.categories.map((category, catIdx) => {
                            const items = menu.items.filter(m => m.category === category);
                            if (items.length === 0) return null;

                            return (

                                <div key={`sec-${category}-${catIdx}`} id={category} className="scroll-mt-40">
                                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">{category}</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {items.map((dish, dishIdx) => (
                                            <DishCard
                                                key={`dish-${dish.id}`}
                                                dish={{ ...dish, inCart: 0 }}
                                                restaurantId={restaurant.id}
                                                restaurantName={restaurant.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                            );
                        })}
                    </div>

                    {/* Right: Cart Summary (Deskop) */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-40 bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                            {cartItems.length === 0 ? (
                                <>
                                    <h3 className="font-bold text-lg mb-4">Cart Empty</h3>
                                    <div className="text-center py-8">
                                        <img src={cartBG} alt="Empty" className="w-32 h-32 mx-auto object-contain opacity-50" />
                                        <p className="text-neutral-500 mt-2">Good food is always cooking! Go ahead, order some yummy items from the menu.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="font-bold text-lg mb-4">Your Order</h3>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{item.name}</h4>
                                                    <p className="text-neutral-500 text-xs mt-1">PKR {item.rawPrice || parseFloat(String(item.price)?.replace(/[^0-9.]/g, ''))}</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1 ml-4 border border-neutral-200">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded">
                                                        <Minus className="w-3 h-3 text-neutral-600" />
                                                    </button>
                                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded">
                                                        <Plus className="w-3 h-3 text-neutral-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-dashed border-neutral-300 mt-4 pt-4">
                                        <div className="flex justify-between items-center font-bold text-lg text-neutral-900">
                                            <span>Total</span>
                                            <span>PKR {cartTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/customer/checkout')}
                                        className="w-full mt-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition"
                                    >
                                        Checkout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>

    );
};

export default RestaurantDetails;

