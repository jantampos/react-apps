import React from 'react';

import { LastSearchesProps } from './TypesAndInterfaces';

const LastSearches = ({lastSearches, onLastSearch} : LastSearchesProps) => {
  return (
    <div>
      { lastSearches.map((searchTerm, index) => (
        <button
            key={searchTerm + index}
            type="button"
            onClick={() => onLastSearch(searchTerm)}>
          {searchTerm}
        </button>
      ))}
    </div>
  );
};

export default LastSearches;


