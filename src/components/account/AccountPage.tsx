import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Package, Heart, MapPin, Star, Bell, Settings, LifeBuoy, LogOut, CheckCircle2 } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, orders, logout, setActiveView, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'notifications' | 'support'>('orders');

  if (!user.isLoggedIn) {
    return (
      <div className="bg-[#F7EBD7] min-h-[70vh] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#FFF8EA] max-w-md w-full rounded-3xl p-8 border border-[#07545A]/15 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-[#07545A] font-display mb-2">
            Sign in to view your account
          </h2>
          <p className="text-xs text-[#687778] mb-6">
            Access your handmade order history, saved addresses, and craft workshop bookings.
          </p>
          <button
            onClick={() => setActiveView('signin')}
            className="w-full py-3 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold hover:bg-[#063F45] transition-colors cursor-pointer"
          >
            Go to Sign In Page
          </button>
        </div>
      </div>
    );
  }

  const handleSupport = (topic: string) => {
    showToast(`Support ticket opened for ${topic}`, 'Our team usually replies in under 2 hours.');
  };

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-[#FFF8EA] rounded-3xl p-6 sm:p-8 border border-[#07545A]/10 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#07545A]/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#07545A] text-[#FFF8EA] font-bold text-xl flex items-center justify-center font-display">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#173B3D] font-display">
                {user.name || 'Creative Patron'}
              </h1>
              <p className="text-xs text-[#687778]">{user.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-[#3F704B]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {user.provider === 'google'
                    ? 'Google Verified Curowit Member'
                    : 'Verified Curowit Member'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#E97868] hover:bg-[#E97868]/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#07545A]/10">
          {[
            { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'support', label: 'Care & Support', icon: LifeBuoy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#07545A] text-[#FFF8EA]'
                    : 'bg-[#FFF8EA] text-[#173B3D]/70 hover:text-[#07545A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                    isActive ? 'bg-[#F2A900] text-[#07545A]' : 'bg-[#07545A]/10 text-[#07545A]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders Content */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#07545A]/10">
                    <div>
                      <span className="font-bold text-sm text-[#07545A]">Order #{order.id}</span>
                      <span className="text-xs text-[#687778] ml-2">Placed on {order.date}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#3F704B]/15 text-[#3F704B]">
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover bg-[#F7EBD7] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#173B3D] truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] text-[#687778]">
                            Qty: {item.quantity} · By {item.product.creatorName}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#07545A] tabular-nums">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#07545A]/10 flex flex-wrap items-center justify-between text-xs text-[#687778] gap-2">
                    <div>
                      Delivery to: <strong className="text-[#173B3D]">{order.shippingAddress.city}</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#07545A] tabular-nums">
                        Total: ₹{order.total}
                      </span>
                      <button
                        onClick={() => showToast(`Tracking Order #${order.id}`, 'Package dispatched via BlueDart Express')}
                        className="px-3 py-1.5 rounded-lg bg-[#F7EBD7] text-[#07545A] font-semibold hover:bg-[#07545A]/10 cursor-pointer"
                      >
                        Track Package
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10">
                <p className="text-xs text-[#687778] mb-3">You haven't placed any craft orders yet.</p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-4 py-2 bg-[#07545A] text-[#FFF8EA] text-xs font-semibold rounded-xl"
                >
                  Start Browsing
                </button>
              </div>
            )}
          </div>
        )}

        {/* Addresses Content */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FFF8EA] rounded-2xl border-2 border-[#07545A] p-5 shadow-2xs relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#07545A] bg-[#07545A]/10 px-2 py-0.5 rounded">
                  Default Delivery Address
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#173B3D] mb-1">{user.name}</h3>
              <p className="text-xs text-[#173B3D]/70 leading-relaxed mb-2">
                42 Lotus Bloom Lane, Indiranagar<br />
                Bengaluru, Karnataka - 560038<br />
                Phone: +91 98765 43210
              </p>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-5 space-y-3">
            <div className="p-3 rounded-xl bg-[#F7EBD7] text-xs">
              <span className="font-bold text-[#07545A] block mb-0.5">Welcome to Curowit!</span>
              <p className="text-[#173B3D]/70">
                Use code "CUROWIT10" on your first order for 10% off directly funded by our craft promotion fund.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F7EBD7] text-xs">
              <span className="font-bold text-[#07545A] block mb-0.5">Siya's Creations added a new item</span>
              <p className="text-[#173B3D]/70">
                Check out the Eternal Crochet Sunflower now in stock.
              </p>
            </div>
          </div>
        )}

        {/* Care & Support */}
        {activeTab === 'support' && (
          <div className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-6 space-y-4">
            <h3 className="font-bold text-base text-[#07545A] font-display">
              Curowit Customer Concierge
            </h3>
            <p className="text-xs text-[#173B3D]/75 leading-relaxed">
              Have a question about a creator’s materials, shipping transit time, or custom personalization? We are here to help you.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Order Status Inquiry', 'Custom Personalization Help', 'Artist Collaboration', 'Damaged Parcel Report'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleSupport(topic)}
                  className="px-3.5 py-2 rounded-xl bg-[#F7EBD7] text-[#07545A] text-xs font-semibold hover:bg-[#07545A] hover:text-white transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
