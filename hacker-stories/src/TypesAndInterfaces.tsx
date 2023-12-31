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

type Stories = {
  list: Story[];
  page: number;
};

type StoriesState = {
  data: Story[];
  page: number;
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
  list: Story[];
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

type LastSearchesProps = {
  lastSearches: string[];
  onLastSearch: (searchTerm: string) => void
}


export type {
    StoriesFetchInitAction,
    StoriesFetchSuccessAction,
    StoriesFetchFailureAction,
    StoriesRemoveAction,
    Story,
    Stories,
    StoriesState,
    StoriesAction,
    ItemProps,
    ListProps,
    SearchFormProps,
    InputWithLabelProps,
    LastSearchesProps
};
