import React, { memo, useState } from 'react';

import './App.css';
import styles from './App.module.css';
import { ListProps, ItemProps } from './TypesAndInterfaces';

import { sortBy } from 'lodash';

/** Constants */
/* Non working sort Function; have to revisit
const SORTS: Record<string, Function> = {
  NONE: (list: Stories) => list, 
  TITLE: (list: Stories) => sortBy(list, 'title'),
  AUTHOR: (list: Stories) => sortBy(list, 'author'),
  COMMENT: (list: Stories) => sortBy(list, 'num_comments').reverse(),
  POINT: (list: Stories) => sortBy(list, 'points').reverse(),
}

// https://www.totaltypescript.com/concepts/type-string-cannot-be-used-to-index-type
const sortFunction = (sort: string, list: Stories) => {
  return SORTS[sort];
};
*/

const List = memo(({ list, onRemoveItem } : ListProps) => {
  const [sortedList, setSortedList] = useState(list);

  const handleSort = (sort: string) => {
    console.log('handleSort');
    let sorted;
    switch(sort) {
      case 'TITLE':
        sorted = sortBy(list, 'title');
        setSortedList(sorted);
        break;
      case 'AUTHOR':
        sorted = sortBy(list, 'author');
        setSortedList(sorted);
        break;
      case 'COMMENTS':
        sorted = sortBy(list, 'num_comments');
        setSortedList(sorted);
        break;
      case 'POINTS':
          sorted = sortBy(list, 'points');
          setSortedList(sorted);
          break;
      default: 
        setSortedList(list);
    }
  };

  console.log('List')
  return (
    <div>
      <div style={{ display: 'flex', fontWeight: 'bold' }}>
        <span style={{ width: '40%' }}>
          <button type="button" onClick={() => handleSort('TITLE')}>Title</button>
        </span>
        <span style={{ width: '30%' }}>
          <button type="button" onClick={() => handleSort('AUTHOR')}>Author</button>
        </span>
        <span style={{ width: '10%' }}>
          <button type="button" onClick={() => handleSort('COMMENTS')}>Comments</button>
        </span>
        <span style={{ width: '10%' }}>
          <button type="button" onClick={() => handleSort('POINTS')}>Points</button>
        </span>
        <span style={{ width: '10%' }}>
          <button type="button" onClick={() => handleSort('ACTIONS')}>Actions</button>
        </span>
      </div>
      { sortedList.map(item => (
          <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>
      ))}
    </div>
  );
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
          Dismiss
        </button>
      </span>
    </div>
  );
}

export default List;
export { Item }