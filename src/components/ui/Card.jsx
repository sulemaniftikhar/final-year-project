import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <div
            className={`bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden ${hover ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
