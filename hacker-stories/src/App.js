import { React, useState, useEffect, useRef, useReducer, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import styles from './App.module.css';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query='; 

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, initialState]); // should add 'key' to avoid the side-effect may run with an outdated key (also called stale) if the key changed between renders
  return [value, setValue]; 
};

const storiesReducer = (state, action) => {
  switch(action.type) {
    case 'STORIES_FETCH_INIT': 
      return {
        ...state, 
        isLoading: true, 
        isError: false,
      }
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state, 
        isLoading: false, 
        isError: false,
        data: action.payload,
      }
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state, 
        isLoading: false, 
        isError: true,
      }
    case 'REMOVE_STORY':
      return {
        ...state, 
        data:  state.data.filter(story => action.payload.objectID !== story.objectID)
      }
    default:
      throw new Error();
  }
}


const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [url , setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = useCallback(async () => {
    dispatchStories({
      type: 'STORIES_FETCH_INIT',
    });

    /*
    axios
      .get(url)
      .then(result => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.data.hits
        })
      })
      .catch(() => dispatchStories({ type: 'STORIES_FETCH_FAILURE' }));
    */
    try {
      const result = await axios.get(url);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits
      })
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
    }

  }, [url]);


  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories])
  
  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    })
  };


  // (A) callback function gets introduced
  const handleSearchInput = event => {
    // (C) It “calls back” to the place it was introduced
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)
    // event.preventDefault();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}> My Hacker Stories</h1>
      <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit}/>
      {/* <hr/> */}
      { stories.isError && <p>Something went wrong...</p> }
      { stories.isLoading ? 
        ( <p>Loading...</p> ) : 
        ( <div className="List"> 
            <List list={stories.data} onRemoveItem={handleRemoveStory}/>
          </div>
        )
      }
    </div>
  );
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => {
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
};

const InputWithLabel = ({ id, value, type='text', onInputChange, children, isFocused }) => {
  const inputRef = useRef(); // ref object is a persistent value which stays intact over the lifetime of a React component

  useEffect(() => {
    inputRef.current.focus();
  }, [isFocused])

  return (
    <>
      <label className="label" htmlFor={id}>{children}</label>&nbsp;
      <input className="input" ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} autoFocus={isFocused} />
    </>
  );

};

const List = ({ list, onRemoveItem }) => {
  return (
    list.map(item => { // rest operator
      return (<Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />) // spread operator
    }));
}; 

const Item = ({ item, onRemoveItem }) => {
  return (
    <div className="Item">
      <span style={{ width: '40%' }}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={{ width: '30%' }}>{item.author}</span>
      <span style={{ width: '10%' }}>{item.num_comments}</span>
      <span style={{ width: '10%' }}>{item.points}</span>
      <span style={{ width: '10%' }}>
        <button className={`button ${styles.buttonSmall}`} type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </div>
  );
}

export default App;
