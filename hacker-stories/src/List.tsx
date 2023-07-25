import { memo } from 'react';
import React from 'react';

import './App.css';
import styles from './App.module.css';

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

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
};

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
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
          Dismiss
        </button>
      </span>
    </div>
  );
}

export default List;
export { Item }