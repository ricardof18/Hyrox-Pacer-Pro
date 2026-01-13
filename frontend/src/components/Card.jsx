import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-[#1E1E1E] p-6 rounded-xl border border-[#333] ${className}`}>
            {children}
        </div>
    );
};

export default Card;
