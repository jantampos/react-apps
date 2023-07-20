import { React, useState, useEffect, useRef, useReducer } from 'react';
import './App.css';

/* Dummy data
const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];
*/
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

/* Dummpy promise
// const getAsyncStories = () =>
//   new Promise((resolve, reject) => setTimeout(reject, 2000));

const getAsyncStories = () => {
  return new Promise(resolve => setTimeout(() => resolve({ data : {stories : initialStories }}), 2000));
};
*/

/* Initial reducer implementation
const storiesReducer = (state, action) => {
  switch(action.type) {
    case 'SET_STORIES':
      return action.payload;
    case 'REMOVE_STORY':
      return state.filter(story => action.payload.objectID !== story.objectID);
    default:
      throw new Error();
  }
}
*/

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
  /* Replacing useState with useReducer
  const [stories, setStories] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  */
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  );

  useEffect(() => {
    if (!searchTerm) return;

    /* setIsLoading(true); */
    dispatchStories({
      type: 'STORIES_FETCH_INIT',
    });

    /* replace dummy promise
    getAsyncStories()
    */

    fetch(`${API_ENDPOINT}${searchTerm}`)
      .then(response => response.json())
      .then(result => {
        /*
        setStories(result.data.stories); 
        setIsLoading(false);
        */
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.hits,
        })
      })
      .catch(() =>
       /* setIsError(true) */
        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
  }, [searchTerm])
  
  const handleRemoveStory = item => {
    /* 
    const newStories = stories.filter(story => item.objectID !== story.objectID);
    setStories(newStories); 
    */
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    })
  };


  // (A) callback function gets introduced
  const handleSearch = event => {
    // (C) It “calls back” to the place it was introduced
    setSearchTerm(event.target.value);
  };

  /* No longer needed; client-side filtering is implemented
  const searchedStories = stories.data.filter(story => {
    const term = searchTerm.toLowerCase();
    return story.title
      .toLowerCase()
      .includes(term);
  });
  */


  return (
    <div className="App">
      <h1> My Hacker Stories</h1>
      {/* <Search search={searchTerm} onSearch={handleSearch}/> */}
      <InputWithLabel 
        id="search" 
        value={searchTerm}
        onInputChange={handleSearch}
        isFocused
      >
        <strong>Search:</strong>&nbsp;
      </InputWithLabel>
      <hr/>
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

/* Refactored to be InputWithLabel
const Search = ({ search, onSearch }) => {
  return (
    <>
      <label htmlFor="search">Search: </label>
      <input id="search" type="text" value={search} onChange={onSearch}/>
    </>
  );

};
*/

const InputWithLabel = ({ id, value, type='text', onInputChange, children, isFocused }) => {
  const inputRef = useRef(); // ref object is a persistent value which stays intact over the lifetime of a React component

  useEffect(() => {
    inputRef.current.focus();
  }, [isFocused])

  return (
    <>
      <label htmlFor={id}>{children}</label>&nbsp;
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} autoFocus={isFocused} />
    </>
  );

};


/* Using spread and rest operator
const List = ({ list }) => {
  return (
    list.map(({ objectID, ...item }) => { // rest operator
      return (<Item key={objectID} item={item} />) // spread operator
    }));
};

const Item = ({ title, url, author, num_comments, points }) => ( ... );
*/

const List = ({ list, onRemoveItem }) => {
  return (
    list.map(item => { // rest operator
      return (<Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />) // spread operator
    }));
}; 

const Item = ({ item, onRemoveItem }) => {
  return (
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </div>
  );
}

export default App;
