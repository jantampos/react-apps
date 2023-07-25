import React, { memo, useState, useEffect } from 'react';

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

const sortFunction = SORTS[sort.sortKey];
const sortedList = sort.isReverse
  ? sortFunction(list).reverse()
  : sortFunction(list);
*/

const List = memo(({ list, onRemoveItem } : ListProps) => {
  const [sort, setSort] = React.useState({
    sortKey: 'NONE',
    isReverse: false,
  });

  const [sortedList, setSortedList] = useState(list);

  const handleSort = (sortKey: string) => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    /** shorthand object initializer notation. When the property name in your object is the same 
     * as your variable name, you can omit the key/value pair and just write the name: */
    // setSort({ sortKey: sortKey, isReverse: isReverse });
    setSort({ sortKey, isReverse });
  }

  const sortList = (sortKey: string) => {
    return sort.isReverse ? sortBy(list, sortKey).reverse() : sortBy(list, sortKey);
  }

  const handleSortList = () => {
    console.log('handleSortList');
    switch(sort.sortKey) {
      case 'TITLE':
        setSortedList(sortList('title'));
        break;
      case 'AUTHOR':
        setSortedList(sortList('author'));
        break;
      case 'COMMENTS':
        setSortedList(sortList('num_comments'));
        break;
      case 'POINTS':
          setSortedList(sortList('points'));
          break;
      case 'NONE':
      default: 
        setSortedList(list);
    }
  };
  useEffect(() => {
    handleSortList();
  }, [sort])


  console.log('List')
  return (
    <div>
      <div style={{ display: 'flex', fontWeight: 'bold' }}>
        <span style={{ width: '40%' }}>
          <button className={styles.buttonSort} type="button" onClick={() => handleSort('TITLE')}>TITLE</button>
        </span>
        <span style={{ width: '30%' }}>
          <button className={styles.buttonSort} type="button" onClick={() => handleSort('AUTHOR')}>AUTHOR</button>
        </span>
        <span style={{ width: '10%' }}>
          <button className={styles.buttonSort} type="button" onClick={() => handleSort('COMMENTS')}>COMMENTS</button>
        </span>
        <span style={{ width: '10%' }}>
          <button className={styles.buttonSort} type="button" onClick={() => handleSort('POINTS')}>POINTS</button>
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