import React, { useState } from 'react';

const SearchBar = () => {
  const [query, setQuery] = useState('');

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    console.log('Search query:', query);
    // Add your search logic here
  };

  return (
    <div style={{ margin: '20px' }}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleInputChange}
        style={{
          padding: '10px',
          width: '300px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: '10px 20px',
          marginLeft: '10px',
          backgroundColor: '#007BFF',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;