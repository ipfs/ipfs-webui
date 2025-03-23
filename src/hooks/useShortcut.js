import { useState, useEffect, useRef } from 'react';

const useShortcut = (props) => {
  const dropdownMenuRef = useRef();
  const [dropdown, setDropdown] = useState(false);

  const wrap = (name, cliOptions) => () => {
    if (name === 'onCliTutorMode' && cliOptions) {
      props.doSetCliOptions(cliOptions);
    }
    props.handleClick();
    props[name]();
  };

  useEffect(() => {
    if (props.autofocus && props.isOpen) {
      if (!dropdownMenuRef.current) return;

      const firstButton = dropdownMenuRef.current.querySelector('button');
      if (!firstButton) return;

      firstButton.focus();
    }
  }, [props.autofocus, props.isOpen]);

  return {
    dropdownMenuRef,
    dropdown,
    setDropdown,
    wrap
  };
};

export default useShortcut;
