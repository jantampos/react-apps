import React, { useRef, useEffect } from 'react';

type InputWithLabelProps = {
    id: string;
    value: string;
    type?: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    children : React.ReactNode; 
    isFocused?: boolean;
  };

const InputWithLabel = ({ id, value, type='text', onInputChange, children, isFocused } : InputWithLabelProps) => {
  const inputRef = useRef<HTMLInputElement>(null!); // ref object is a persistent value which stays intact over the lifetime of a React component

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused])

  return (
    <>
      <label className="label" htmlFor={id}>{children}</label>&nbsp;
      <input className="input" ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} autoFocus={isFocused} />
    </>
  );

};

export default InputWithLabel;
