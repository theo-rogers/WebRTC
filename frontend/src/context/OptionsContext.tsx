// eslint-disable-next-line no-unused-vars
import React, {createContext, useEffect, useState, useContext} from 'react';
// import {useSnackbar} from 'notistack';

import {ChildrenProps} from '../shared/types';

const OptionsContext = createContext<IOptionsContext>(undefined!);


interface Props extends ChildrenProps {}

const OptionsContextProvider : React.FC<Props> = ({children}) => {
  // const {enqueueSnackbar} = useSnackbar();
  const [tutorialEnabled, setTutorialEnabled] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <OptionsContext.Provider
      value={{
        tutorialEnabled,
        setTutorialEnabled,
        helpOpen,
        setHelpOpen,
      }}
    >
      {children}
    </OptionsContext.Provider>
  );
};

export interface IOptionsContext {
  tutorialEnabled: boolean
  setTutorialEnabled: (boolean:boolean)=>void
  helpOpen: boolean
  setHelpOpen: (boolean:boolean)=>void
}


OptionsContext.displayName = 'Options Context';

export {OptionsContextProvider, OptionsContext};