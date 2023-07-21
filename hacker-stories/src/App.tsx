import { useState, useEffect, useRef, useReducer, useCallback, memo, useMemo } from 'react';
import { ReactComponent as Check } from './check.svg';

import React from 'react';
import axios from 'axios';
import './App.css';
import styles from './App.module.css';

/** Constants */
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

/** Interfaces */
interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
}
interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
}

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
  type: 'REMOVE_STORY';
  payload: Story;
}

/** Types */
type Story = {
  objectID: string;
  url: string; 
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Stories = Array<Story>;

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
}

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
};

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
};

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children : React.ReactNode; 
  isFocused?: boolean;
};


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

const InputWithLabel = ({ id, value, type='text', onInputChange, children, isFocused } : InputWithLabelProps) => {
  const inputRef = useRef<HTMLInputElement>(null!); // ref object is a persistent value which stays intact over the lifetime of a React component

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

const List = memo(({ list, onRemoveItem } : ListProps) => {
  console.log('List')
  return (
    list.map(item => { 
      return (<Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />) 
    }));
}); 

const Item = ({ item, onRemoveItem } : ItemProps) => {
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
          <Check height="18px" width="18px" />
        </button>
      </span>
    </div>
  );
}

export default App;
