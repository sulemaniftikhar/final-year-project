import { useState, useEffect } from 'react';
import { AlertTriangle, Copy, Clock, Save } from 'lucide-react';
import { useRestaurant } from '../../features/restaurant/RestaurantContext';
import { restaurantService } from '../../services/restaurant.service';
import toast from 'react-hot-toast';

const Availability = () => {
  const { restaurant, refetch } = useRestaurant();
  const [saving, setSaving] = useState(false);

  const [isOpen, setIsOpen] = useState(true);
  const [pausedReason, setPausedReason] = useState('');
  const [enabledModes, setEnabledModes] = useState({
    delivery: true,
    pickup: true,
    dinein: true,
  });
  const [prepTime, setPrepTime] = useState(15);
  const [showCustomPrep, setShowCustomPrep] = useState(false);
  const [customPrep, setCustomPrep] = useState('');

  const [days, setDays] = useState([
    { name: 'Monday', open: '11:00', close: '22:00', closed: false },
    { name: 'Tuesday', open: '11:00', close: '22:00', closed: false },
    { name: 'Wednesday', open: '11:00', close: '22:00', closed: false },
    { name: 'Thursday', open: '11:00', close: '23:00', closed: false },
    { name: 'Friday', open: '11:00', close: '23:00', closed: false },
    { name: 'Saturday', open: '10:00', close: '23:00', closed: false },
    { name: 'Sunday', open: '10:00', close: '21:00', closed: false },
  ]);
  const [closures, setClosures] = useState([]);

  useEffect(() => {
    if (restaurant) {
      setIsOpen(restaurant.status === 'OPEN');
      setEnabledModes({
        delivery: restaurant.delivery ?? true,
        pickup: restaurant.takeaway ?? true,
        dinein: restaurant.dineIn ?? true,
      });
      if (restaurant.openingTime || restaurant.closingTime) {
        setDays(prev => prev.map(d => ({
          ...d,
          open: restaurant.openingTime || d.open,
          close: restaurant.closingTime || d.close
        })));
      }
    }
  }, [restaurant]);



  const toggleMode = (mode) => {
    setEnabledModes(prev => ({ ...prev, [mode]: !prev[mode] }));
  };

  const handleCopyToAll = () => {
    setDays((prev) => {
      if (prev.length === 0) return prev;
      const source = prev[0];
      return prev.map((day) => ({
        ...day,
        open: source.open,
        close: source.close,
        closed: source.closed,
      }));
    });
  };

  const handleDayTimeChange = (name, field, value) => {
    setDays((prev) => prev.map((day) => (
      day.name === name ? { ...day, [field]: value } : day
    )));
  };

  const handleClosedToggle = (name) => {
    setDays((prev) => prev.map((day) => (
      day.name === name ? { ...day, closed: !day.closed } : day
    )));
  };

  const handleAddClosure = () => {
    const date = window.prompt('Closure date (YYYY-MM-DD)');
    if (!date) return;
    const trimmed = date.trim();
    if (!trimmed) return;
    setClosures((prev) => [...prev, { date: trimmed }]);
  };

  const handleSetCustomPrep = () => {
    const minutes = Number(customPrep);
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    setPrepTime(minutes);
    setShowCustomPrep(false);
  };

  const handleSave = async () => {
    if (!restaurant?.id) return;
    try {
      setSaving(true);
      await restaurantService.updateRestaurant(restaurant.id, {
        status: isOpen ? 'OPEN' : 'PAUSED',
        openingTime: days[0].open, // Save the first day's config as global format for Prisma
        closingTime: days[0].close,
        delivery: enabledModes.delivery,
        takeaway: enabledModes.pickup,
        dineIn: enabledModes.dinein
      });
      toast.success('Availability settings saved!');
      if (refetch) refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-800">Availability & Hours</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Conflict Warning 
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="text-warning" size={20} />
        <div className="flex-1">
          <p className="font-medium">Pickup disabled but 12 items are Pickup-only.</p>
          <p className="text-sm text-neutral-600">These items won't be visible to customers.</p>
        </div>
        <button className="text-primary hover:text-primary/80 font-medium">
          Review items →
        </button>
      </div>*/}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Main */}
        <div className="col-span-2 space-y-6">
          {/* Restaurant Status Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Restaurant Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Restaurant Status</p>
                  <p className="text-sm text-neutral-600">Currently visible to customers</p>
                </div>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`w-16 h-8 rounded-full transition-colors ${isOpen ? 'bg-success' : 'bg-neutral-300'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${isOpen ? 'translate-x-9' : 'translate-x-1'
                    }`} />
                </button>
              </div>

              {!isOpen && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Pause Reason
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={pausedReason}
                    onChange={(e) => setPausedReason(e.target.value)}
                  >
                    <option value="">Select a reason</option>
                    <option value="holiday">Holiday</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="weather">Weather</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-sm text-neutral-500 mt-2">
                    This message will be shown to customers.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Hours Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">Weekly Hours</h2>
              <button
                onClick={handleCopyToAll}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <Copy size={16} />
                Copy to all days
              </button>
            </div>

            <div className="space-y-3">
              {days.map((day) => (
                <div key={day.name} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-24 font-medium">{day.name}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="time"
                      className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={day.open}
                      onChange={(e) => handleDayTimeChange(day.name, 'open', e.target.value)}
                      disabled={day.closed}
                    />
                    <span className="text-neutral-500">to</span>
                    <input
                      type="time"
                      className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={day.close}
                      onChange={(e) => handleDayTimeChange(day.name, 'close', e.target.value)}
                      disabled={day.closed}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`closed-${day.name}`}
                      checked={day.closed}
                      onChange={() => handleClosedToggle(day.name)}
                      className="rounded border-neutral-300"
                    />
                    <label htmlFor={`closed-${day.name}`} className="text-sm">
                      Closed
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Closures Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">Special Closures</h2>
              <button
                onClick={handleAddClosure}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Add closure date
              </button>
            </div>
            {closures.length === 0 ? (
              <p className="text-neutral-600">No special closures scheduled.</p>
            ) : (
              <div className="space-y-2">
                {closures.map((c, i) => (
                  <div key={`${c.date}-${i}`} className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700">{c.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Side */}
        <div className="space-y-6">
          {/* Mode Enablement */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Mode Enablement</h2>
            <div className="space-y-4">
              {[
                { key: 'delivery', label: 'Delivery' },
                { key: 'pickup', label: 'Pickup' },
                { key: 'dinein', label: 'Dine-in' },
              ].map((mode) => (
                <div key={mode.key} className="flex items-center justify-between">
                  <span className="font-medium">{mode.label}</span>
                  <button
                    onClick={() => toggleMode(mode.key)}
                    className={`w-12 h-6 rounded-full transition-colors ${enabledModes[mode.key] ? 'bg-primary' : 'bg-neutral-300'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${enabledModes[mode.key] ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                  </button>
                </div>
              ))}
              <p className="text-sm text-neutral-500">
                Disabling hides the mode from customers.
              </p>
            </div>
          </div>

          {/* Prep Time Defaults */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-neutral-600" />
              <h2 className="text-xl font-semibold text-neutral-800">Prep Time Defaults</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[10, 15, 20, 30].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setPrepTime(minutes)}
                    className={`px-4 py-2 rounded-lg ${prepTime === minutes
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                  >
                    {minutes} min
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomPrep(true)}
                  className="px-4 py-2 border border-dashed border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Custom
                </button>
              </div>
              {showCustomPrep && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={customPrep}
                    onChange={(e) => setCustomPrep(e.target.value)}
                    className="w-24 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Minutes"
                  />
                  <button
                    onClick={handleSetCustomPrep}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Set
                  </button>
                  <button
                    onClick={() => setShowCustomPrep(false)}
                    className="px-3 py-2 text-neutral-600 hover:text-neutral-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg">
                <input type="checkbox" id="busy-mode" className="rounded border-neutral-300" />
                <label htmlFor="busy-mode" className="text-sm">
                  Busy mode (+5 min during peak hours)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
