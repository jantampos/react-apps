import React, { useState, useEffect, useRef, useReducer, useCallback, useMemo } from 'react';
// import { ReactComponent as Check } from './check.svg';
import axios from 'axios';

import './App.css';
import styles from './App.module.css';

import List from './List';
import SearchForm from './SearchForm';
import LastSearches from './LastSearches';

import { Story, StoriesState, StoriesAction } from './TypesAndInterfaces';

/** Constants */
//const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';
const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

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
        data: 
          action.payload.page == 0 
            ? action.payload.list
            : state.data.concat(action.payload.list),
        page: action.payload.page
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

const getUrl = (searchTerm : string, page: number) => `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

const extractSearchTerm = (url : string) => {
  return url
  .substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&'))
  .replace(PARAM_SEARCH, '');
};

const getLastSearches = (urls : string[]) => {
  return urls
    .reduce((result, url, index) => {
      const searchTerm = extractSearchTerm(url);
      console.log('getLastSearches...', searchTerm);
      if (index === 0) {
        return result.concat(searchTerm);
      }
      const previousSearchTerm = result[result.length - 1];
      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, [] as string[]) // https://stackoverflow.com/questions/54117100/why-does-typescript-infer-the-never-type-when-reducing-an-array-with-concat
    .slice(-6)
    .slice(0, -1); //.map(url => extractSearchTerm(url))
};

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [urls , setUrls] = useState([getUrl(searchTerm, 0)]);//useState(`${API_ENDPOINT}${searchTerm}`);
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], page: 0, isLoading: false, isError: false }
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
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page
        }
      })
    } catch {
      dispatchStories({ 
        type: 'STORIES_FETCH_FAILURE' 
      })
    }

  }, [urls]);


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
    handleSearch(searchTerm, 0);
    event.preventDefault();
  }, [searchTerm]);

  const sumComments = useMemo(() => getSumComments(stories), [stories]);

  const handleSearch = (searchTerm : string, page: number) => {
    const url = getUrl(searchTerm, page);
    setUrls(urls.concat(url));
  }

  const handleLastSearch = (searchTerm : string) => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm, 0);
  };
  const lastSearches = useMemo(() => getLastSearches(urls), [urls]);//getLastSearches(urls);

  const handleMore = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  };

  console.log('App');
  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}> My Hacker Stories with {sumComments} comments</h1>
      <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit}/>
      <LastSearches lastSearches={lastSearches} onLastSearch={handleLastSearch} />
      <hr/>
      { stories.isError && <p>Something went wrong...</p> }
      { stories.isLoading ? 
        ( <p>Loading...</p> ) : 
        ( <div className="List"> 
            <List list={stories.data} onRemoveItem={handleRemoveStory}/>
            <button type="button" onClick={handleMore}>
              More
            </button>
          </div>
        )
      }
     
    </div>
  );
}

export default App;