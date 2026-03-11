import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SettingsPage = () => {
    const [general, setGeneral] = useState({
        platformName: 'OrderIQ',
        supportEmail: 'support@orderiq.com',
        timezone: 'UTC',
        currency: 'USD',
    });
    const [security, setSecurity] = useState({
        twoFactorRequired: true,
        sessionTimeout: '30',
        passwordMinLength: '8',
    });
    const [billing, setBilling] = useState({
        payoutSchedule: 'Weekly',
        commissionRate: '12',
        taxMode: 'Exclusive',
    });
    const [notifications, setNotifications] = useState({
        systemAlerts: true,
        campaignUpdates: true,
        weeklyDigest: false,
    });
    const [statusMessage, setStatusMessage] = useState('');

    const handleSave = (section) => {
        setStatusMessage(`${section} settings saved`);
        window.setTimeout(() => setStatusMessage(''), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>
                {statusMessage ? (
                    <span className="text-sm text-green-600 font-medium">{statusMessage}</span>
                ) : null}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">General</h2>
                        <Button size="sm" onClick={() => handleSave('General')}>Save</Button>
                    </div>
                    <div className="grid gap-4">
                        <label className="text-sm text-gray-600">
                            Platform Name
                            <input
                                type="text"
                                value={general.platformName}
                                onChange={(event) => setGeneral(prev => ({ ...prev, platformName: event.target.value }))}
                                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </label>
                        <label className="text-sm text-gray-600">
                            Support Email
                            <input
                                type="email"
                                value={general.supportEmail}
                                onChange={(event) => setGeneral(prev => ({ ...prev, supportEmail: event.target.value }))}
                                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="text-sm text-gray-600">
                                Timezone
                                <select
                                    value={general.timezone}
                                    onChange={(event) => setGeneral(prev => ({ ...prev, timezone: event.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">America/New_York</option>
                                    <option value="Europe/London">Europe/London</option>
                                    <option value="Asia/Karachi">Asia/Karachi</option>
                                </select>
                            </label>
                            <label className="text-sm text-gray-600">
                                Currency
                                <select
                                    value={general.currency}
                                    onChange={(event) => setGeneral(prev => ({ ...prev, currency: event.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="PKR">PKR</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Security</h2>
                        <Button size="sm" onClick={() => handleSave('Security')}>Save</Button>
                    </div>
                    <div className="grid gap-4">
                        <label className="flex items-center justify-between text-sm text-gray-600">
                            Require 2FA for admins
                            <input
                                type="checkbox"
                                checked={security.twoFactorRequired}
                                onChange={(event) => setSecurity(prev => ({ ...prev, twoFactorRequired: event.target.checked }))}
                                className="h-4 w-4"
                            />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="text-sm text-gray-600">
                                Session timeout (mins)
                                <input
                                    type="number"
                                    min="5"
                                    value={security.sessionTimeout}
                                    onChange={(event) => setSecurity(prev => ({ ...prev, sessionTimeout: event.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                            </label>
                            <label className="text-sm text-gray-600">
                                Password min length
                                <input
                                    type="number"
                                    min="6"
                                    value={security.passwordMinLength}
                                    onChange={(event) => setSecurity(prev => ({ ...prev, passwordMinLength: event.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                            </label>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Billing</h2>
                        <Button size="sm" onClick={() => handleSave('Billing')}>Save</Button>
                    </div>
                    <div className="grid gap-4">
                        <label className="text-sm text-gray-600">
                            Payout Schedule
                            <select
                                value={billing.payoutSchedule}
                                onChange={(event) => setBilling(prev => ({ ...prev, payoutSchedule: event.target.value }))}
                                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option>Weekly</option>
                                <option>Bi-weekly</option>
                                <option>Monthly</option>
                            </select>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="text-sm text-gray-600">
                                Commission Rate (%)
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={billing.commissionRate}
                                    onChange={(event) => setBilling(prev => ({ ...prev, commissionRate: event.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                            </label>
                            <label className="text-sm text-gray-600">
                                Tax Mode
                                <select
                                    value={billing.taxMode}
                                    onChange={(event) => setBilling(prev => ({ ...prev, taxMode: event.target.value }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                >
                                    <option>Exclusive</option>
                                    <option>Inclusive</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                        <Button size="sm" onClick={() => handleSave('Notifications')}>Save</Button>
                    </div>
                    <div className="grid gap-4">
                        <label className="flex items-center justify-between text-sm text-gray-600">
                            System alerts
                            <input
                                type="checkbox"
                                checked={notifications.systemAlerts}
                                onChange={(event) => setNotifications(prev => ({ ...prev, systemAlerts: event.target.checked }))}
                                className="h-4 w-4"
                            />
                        </label>
                        <label className="flex items-center justify-between text-sm text-gray-600">
                            Campaign updates
                            <input
                                type="checkbox"
                                checked={notifications.campaignUpdates}
                                onChange={(event) => setNotifications(prev => ({ ...prev, campaignUpdates: event.target.checked }))}
                                className="h-4 w-4"
                            />
                        </label>
                        <label className="flex items-center justify-between text-sm text-gray-600">
                            Weekly digest
                            <input
                                type="checkbox"
                                checked={notifications.weeklyDigest}
                                onChange={(event) => setNotifications(prev => ({ ...prev, weeklyDigest: event.target.checked }))}
                                className="h-4 w-4"
                            />
                        </label>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;