import React, { createContext, useContext, useState, useEffect } from 'react';

const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
    // Determine initial state from localStorage or default to personal context
    const [activeOrganizationId, setActiveOrganizationId] = useState(() => {
        const saved = localStorage.getItem('activeOrganizationId');
        return saved || 'PERSONAL';
    });

    const switchOrganization = (orgId) => {
        setActiveOrganizationId(orgId);
        if (orgId === 'PERSONAL') {
            localStorage.removeItem('activeOrganizationId');
        } else {
            localStorage.setItem('activeOrganizationId', orgId);
        }
        // In a real app, you might want to refresh data or redirect here
    };

    return (
        <OrganizationContext.Provider value={{ activeOrganizationId, switchOrganization }}>
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
};
