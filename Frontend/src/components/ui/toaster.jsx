import React from 'react';

// Minimal placeholder Toaster component used by App.jsx
export const Toaster = () => {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', top: 8, right: 8 }}>
      {/* placeholder for Toaster notifications */}
    </div>
  );
};

export default Toaster;
