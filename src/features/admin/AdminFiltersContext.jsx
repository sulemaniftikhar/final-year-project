import React, { createContext, useContext, useMemo, useState } from 'react';

const AdminFiltersContext = createContext(null);

export const DATE_RANGE_OPTIONS = [
    { id: 'last_7_days', label: 'Last 7 Days', type: 'days', value: 7 },
    { id: 'last_30_days', label: 'Last 30 Days', type: 'days', value: 30 },
    { id: 'this_month', label: 'This Month', type: 'month', value: 'this' },
    { id: 'last_month', label: 'Last Month', type: 'month', value: 'last' },
    { id: 'all_time', label: 'All Time', type: 'all', value: null },
];

export const getDateRangeLabel = (rangeId) => {
    const found = DATE_RANGE_OPTIONS.find(option => option.id === rangeId);
    return found?.label || 'Last 7 Days';
};

export const isDateInRange = (dateValue, rangeId) => {
    if (!dateValue) return true;
    const range = DATE_RANGE_OPTIONS.find(option => option.id === rangeId);
    if (!range || range.type === 'all') return true;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return true;

    const now = new Date();

    if (range.type === 'days') {
        const start = new Date(now);
        start.setDate(now.getDate() - range.value);
        start.setHours(0, 0, 0, 0);
        return date >= start && date <= now;
    }

    if (range.type === 'month') {
        if (range.value === 'this') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            return date >= start && date <= end;
        }

        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const start = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const end = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);
        return date >= start && date <= end;
    }

    return true;
};

export const AdminFiltersProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState('last_7_days');

    const value = useMemo(() => ({
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
    }), [searchQuery, dateRange]);

    return (
        <AdminFiltersContext.Provider value={value}>
            {children}
        </AdminFiltersContext.Provider>
    );
};

export const useAdminFilters = () => {
    const context = useContext(AdminFiltersContext);
    if (!context) {
        throw new Error('useAdminFilters must be used within an AdminFiltersProvider');
    }
    return context;
};

export default AdminFiltersContext;
