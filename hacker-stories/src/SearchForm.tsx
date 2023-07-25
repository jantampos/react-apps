import React, { memo } from 'react';
import InputWithLabel from './InputWithLabel';
import styles from './App.module.css';

import { SearchFormProps } from './TypesAndInterfaces';

const SearchForm = memo(({ searchTerm, onSearchInput, onSearchSubmit } : SearchFormProps) => {
  console.log('SearchForm');
  return (
    <form  className={styles.searchForm} onSubmit={onSearchSubmit}>
      <InputWithLabel 
        id="search" 
        value={searchTerm}
        onInputChange={onSearchInput}
        isFocused
      >
        <strong>Search:</strong>&nbsp;
      </InputWithLabel>
      <button className={`button ${styles.buttonLarge}`} type="submit" disabled={!searchTerm}>Submit</button>
    </form>    
  );
});

export default SearchForm;