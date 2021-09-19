/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, {useState, useRef} from 'react';
import clsx from 'clsx';
import {makeStyles,
  Theme,
  createStyles,
  useTheme,
} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Chip from '@material-ui/core/Chip';
import ChatBubbleTwoToneIcon from '@material-ui/icons/ChatBubbleTwoTone';

import {User, Meeting} from '../../types';
import ChatBox from './ChatBox';

interface Props {
  //  users: User[]| undefined,
   meeting: Meeting | undefined| null,
}
type StyleRef = React.MutableRefObject<HTMLDivElement | undefined>

const drawerWidth = 340;

const offset = 90;
const useStyles = makeStyles<Theme, StyleRef>((theme: Theme) =>
  createStyles({
    root: {

    },
    appBar: {
      float: 'right',
      // right: 0,
      // position: 'absolute',
      // padding: theme.spacing(1),
      margin: theme.spacing(1),
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: (props) => ({
      //
      display: 'none',
      width: `calc(50% - ${props.current?.offsetWidth}px)`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: props.current?.offsetWidth,
    }),
    openIcon: {
      padding: theme.spacing(1),
    },
    hide: {
      display: 'none',
    },
    drawer: (props) => ({
      width: props.current?.offsetWidth,
      flexShrink: 0,
    }),
    drawerPaper: (props) =>({
      top: offset,
      width: props.current?.offsetWidth,
      backgroundColor: 'rgba(255,255,255,0)',
      outline: 0,
      borderWidth: 0,
    }),
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      justifyContent: 'flex-start',
    },
    iconButton: {
      backgroundColor: theme.palette.secondary.light,
      margin: theme.spacing(1),
    },
    content: (props) => ({
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: props.current?.offsetWidth? -props.current?.offsetWidth : drawerWidth,
    }),
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    },
  }),
);


const ChatDrawer = ({meeting}: Props) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>();
  const classes = useStyles(chatBoxRef);

  const handleDrawerOpen = () => setOpen(true);

  const handleDrawerClose = () => setOpen(false);

  const hideWhenOpen = {
    // display: open? 'none': 'flex'
  };
  if (!meeting) return <></>;
  return (
    <div className={classes.root}>
      <div
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Chip
          className={classes.openIcon}
          // variant='outlined'
          aria-label="open drawer"
          color='secondary'
          size='medium'
          label='Chat'
          clickable
          onClick={handleDrawerOpen}
          icon={<ChatBubbleTwoToneIcon/>}
        />
      </div>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
      </main>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton
            className={classes.iconButton}
            onClick={handleDrawerClose}
            size='small'
          >
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <ChatBox ref={chatBoxRef}/>
      </Drawer>
    </div>
  );
};

export default ChatDrawer
;
