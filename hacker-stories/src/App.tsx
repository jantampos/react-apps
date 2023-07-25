import React, { useState, useEffect, useRef, useReducer, useCallback, useMemo } from 'react';
// import { ReactComponent as Check } from './check.svg';
import axios from 'axios';

import './App.css';
import styles from './App.module.css';

import List from './List';
import SearchForm from './SearchForm';

import { Story, StoriesState, StoriesAction } from './TypesAndInterfaces';

/** Constants */
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

/** Functions */
const useSemiPersistentState = (
  key: string,
  initialState: string
): [string, (newValue: string) => void] => {
  const isMounted = useRef(false);

  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]); // should add 'key' to avoid the side-effect may run with an outdated key (also called stale) if the key changed between renders
  return [value, setValue]; 
};


const storiesReducer = (state: StoriesState, action: StoriesAction) => {
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

const getSumComments = (stories : StoriesState) => {
  return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

/** Components */

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [url , setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = useCallback(async () => {
    console.log('handle fetch stories...');
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
      dispatchStories({ 
        type: 'STORIES_FETCH_FAILURE' 
      })
    }

  }, [url]);


  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories])
  
  const handleRemoveStory = useCallback((item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    })
  }, []);

  // (A) callback function gets introduced
  const handleSearchInput = useCallback((event : React.ChangeEvent<HTMLInputElement>) => {
    // (C) It “calls back” to the place it was introduced
    console.log('handleSearchInput')
    setSearchTerm(event.target.value);
  }, [searchTerm]);

  const handleSearchSubmit = useCallback((event : React.FormEvent<HTMLFormElement>) => {
    console.log('handleSearchSubmit')
    setUrl(`${API_ENDPOINT}${searchTerm}`)
    event.preventDefault();
  }, [searchTerm]);

  const sumComments = useMemo(() => getSumComments(stories), [stories]);

  console.log('App');
  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}> My Hacker Stories with {sumComments} comments</h1>
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

export default App;