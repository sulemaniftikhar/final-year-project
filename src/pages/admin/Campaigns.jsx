import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Search, Filter } from 'lucide-react';
import { isDateInRange, useAdminFilters } from '../../features/admin/AdminFiltersContext';

const CampaignsPage = () => {
    const { searchQuery, setSearchQuery, dateRange } = useAdminFilters();
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [campaigns, setCampaigns] = useState([
        { id: 1, name: 'Winter Warmers', type: 'Discount', status: 'Active', channel: 'Email', budget: '$4,000', createdAt: '2026-02-20T10:20:00Z' },
        { id: 2, name: 'Weekend BOGO', type: 'BOGO', status: 'Scheduled', channel: 'Push', budget: '$2,500', createdAt: '2026-02-25T12:15:00Z' },
        { id: 3, name: 'New User Welcome', type: 'Credit', status: 'Active', channel: 'SMS', budget: '$1,200', createdAt: '2026-02-10T09:00:00Z' },
        { id: 4, name: 'Delivery Freebie', type: 'Free Delivery', status: 'Paused', channel: 'In-app', budget: '$900', createdAt: '2026-01-28T08:30:00Z' },
    ]);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        type: 'Discount',
        status: 'Scheduled',
        channel: 'Email',
        budget: '',
    });

    const filteredCampaigns = useMemo(() => {
        const search = searchQuery.trim().toLowerCase();
        return campaigns.filter(campaign => {
            const matchesSearch = !search
                || campaign.name.toLowerCase().includes(search)
                || campaign.type.toLowerCase().includes(search)
                || campaign.channel.toLowerCase().includes(search);
            const matchesStatus = statusFilter === 'All' || campaign.status === statusFilter;
            const matchesDate = isDateInRange(campaign.createdAt, dateRange);
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [campaigns, searchQuery, statusFilter, dateRange]);

    const handleCreateCampaign = (event) => {
        event.preventDefault();
        if (!newCampaign.name.trim()) return;

        const nextId = campaigns.length ? Math.max(...campaigns.map(c => c.id)) + 1 : 1;
        const created = {
            id: nextId,
            name: newCampaign.name.trim(),
            type: newCampaign.type,
            status: newCampaign.status,
            channel: newCampaign.channel,
            budget: newCampaign.budget ? `$${newCampaign.budget}` : '$0',
            createdAt: new Date().toISOString(),
        };

        setCampaigns(prev => [created, ...prev]);
        setShowCreateForm(false);
        setNewCampaign({ name: '', type: 'Discount', status: 'Scheduled', channel: 'Email', budget: '' });
    };

    const statusStyle = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-700';
            case 'Scheduled':
                return 'bg-blue-100 text-blue-700';
            case 'Paused':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="relative">
                        <Button variant="outline" icon={Filter} onClick={() => setShowFilters(prev => !prev)}>
                            Filters
                        </Button>
                        {showFilters && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</div>
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'Active', 'Scheduled', 'Paused'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-2.5 py-1 rounded text-xs ${statusFilter === status ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <Button icon={Plus} onClick={() => setShowCreateForm(true)}>Create Campaign</Button>
                </div>
            </div>

            {showCreateForm && (
                <Card className="p-4 border border-gray-200">
                    <form onSubmit={handleCreateCampaign} className="grid md:grid-cols-5 gap-4">
                        <input
                            type="text"
                            placeholder="Campaign name"
                            value={newCampaign.name}
                            onChange={(event) => setNewCampaign(prev => ({ ...prev, name: event.target.value }))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            required
                        />
                        <select
                            value={newCampaign.type}
                            onChange={(event) => setNewCampaign(prev => ({ ...prev, type: event.target.value }))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                            <option>Discount</option>
                            <option>BOGO</option>
                            <option>Credit</option>
                            <option>Free Delivery</option>
                        </select>
                        <select
                            value={newCampaign.channel}
                            onChange={(event) => setNewCampaign(prev => ({ ...prev, channel: event.target.value }))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                            <option>Email</option>
                            <option>Push</option>
                            <option>SMS</option>
                            <option>In-app</option>
                        </select>
                        <select
                            value={newCampaign.status}
                            onChange={(event) => setNewCampaign(prev => ({ ...prev, status: event.target.value }))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                            <option>Scheduled</option>
                            <option>Active</option>
                            <option>Paused</option>
                        </select>
                        <input
                            type="number"
                            min="0"
                            placeholder="Budget"
                            value={newCampaign.budget}
                            onChange={(event) => setNewCampaign(prev => ({ ...prev, budget: event.target.value }))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <div className="md:col-span-5 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                            <Button type="submit">Create</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="overflow-hidden shadow-sm border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Campaign</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Channel</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Budget</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCampaigns.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
                                    No campaigns match the current filters.
                                </td>
                            </tr>
                        ) : (
                            filteredCampaigns.map(campaign => (
                                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{campaign.name}</p>
                                            <p className="text-xs text-gray-500">Created {new Date(campaign.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-700">{campaign.type}</td>
                                    <td className="p-4 text-sm text-gray-700">{campaign.channel}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle(campaign.status)}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-900">{campaign.budget}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
export default CampaignsPage;
