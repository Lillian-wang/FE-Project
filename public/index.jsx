import React from 'react';
import ReactDOM from 'react-dom';
// import styles from './styles.css'

require("babel-core/register");
require("babel-polyfill");

class ChatRoomApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      currentUser: null,
      loggedTime: null,
      roomInfo: []
    }
  }

  addUser(val) {
    fetch('http://localhost:8080/api/rooms').then(result => {
      return result.json();
    }).then(res => {
      const currrentTime = new Date().getTime();
      this.setState({ isLoggedIn: true, currentUser: val, loggedTime: currrentTime, roomInfo: res })
    })
      .catch(err => console.log(err));
  }

  render() {
    const state = this.state;
    console.log('chat room app state', state)
    return (
      <div className="chat-room-wrapper">
        <LoginForm addUser={this.addUser.bind(this)} isLoggedIn={state.isLoggedIn} />
        <ChatPage currentUser={state.currentUser} isLoggedIn={state.isLoggedIn} loggedTime={state.loggedTime} roomInfo={state.roomInfo} />
      </div>
    );
  }
}

const LoginForm = (props) => {
  let input;
  if (!props.isLoggedIn) {
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        props.addUser(input.value);
        input.value = '';
      }}>
        <input placeholder="Type your user name..." className="login-input" ref={node => {
          input = node;
        }} />
        <button type="submit" className="submit-btn">Join the DoorDash Chat!</button>
      </form>
    );
  } else return null;
};

class ChatPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: this.props.currentUser,
      roomName: '',
      roomId: null,
      users: [],
      msgs: [],
      roomSelected: false
    }
  }

  getRoomInfo(roomId) {
    console.log('roomid', roomId)
    this.setState({ roomSelected: true })
    fetch(`http://localhost:8080/api/rooms/${roomId}/messages`).then(result => {
      return result.json();
    }).then(res => {
      this.setState({ msgs: res })
    })
      .catch(err => console.log(err));
    fetch(`http://localhost:8080/api/rooms/${roomId}`).then(result => {
      return result.json();
    }).then(res => {
      this.setState({ roomName: res.name, users: res.users, roomId: res.id })
    })
      .catch(err => console.log(err));
  }

  postMsgs(msg) {
    fetch(`http://localhost:8080/api/rooms/${this.state.roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        name: this.props.currentUser,
        message: msg
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(res => {
      this.getRoomInfo(this.state.roomId);
    })
  }


  render() {
    if (this.props.isLoggedIn) {
      const onLineTime = Math.round((new Date().getTime() - this.props.loggedTime) / 60000);
      return (
        <div className="chat-page">
          <div className="rooms-wrapper">
            <p className="current-user">{this.props.currentUser}</p>
            <p className="online-time">On line for {onLineTime} minutes</p>
            <RoomInfo roomInfo={this.props.roomInfo} getRoomInfo={this.getRoomInfo.bind(this)} />
          </div>
          {this.state.roomSelected &&
            <MsgsInfo userNames={this.state.users} currentUser={this.props.currentUser} roomName={this.state.roomName} msgs={this.state.msgs} postMsgs={this.postMsgs.bind(this)} />
          }
        </div>
      );
    } else return null;
  }
};

class MsgsInfo extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidUpdate() {
    this.messagesEnd.scrollIntoView();
  }
  render() {
    let input;
    return (
      <div className="msgsInfo-section">
        {this.props.msgs.length > 0 &&
          <div className="msgs-wrapper">
            <div className="room-info-wrapper">
              <p className="room-name">{this.props.roomName}</p>
              <ul className="room-list-wrapper">
                {this.props.userNames.map((name, index) => <li key={index} className="users-name-wrapper"><span className="name-comma">{index ? ',' : ''}</span><span>{name}</span></li>)}
              </ul>
            </div>
            <ul className="msg-info-wrapper">
              {this.props.msgs.map(msg => <li key={msg.id} className={"msg-info " + (msg.name === this.props.currentUser ? 'currentUser' : '')}><p className="msg-content">{msg.message}</p><p className="msg-user">{msg.name}</p></li>)}
            </ul>
            <div style={{ float: "left", clear: "both" }}
              ref={(el) => { this.messagesEnd = el; }}>
            </div>
          </div>
        }
        <div className="user-input-wrapper">
          <form className="user-input-form" onSubmit={(e) => {
            e.preventDefault();
            this.props.postMsgs(input.value);
            input.value = '';
            this.messagesEnd.scrollTop = this.messagesEnd.scrollHeight;
          }}>
            <input className="user-input" placeholder="Type a message..." ref={node => {
              input = node
            }} />
            <button className="submit-input" type="submit">Send</button>
          </form>
        </div>
      </div>
    )
  }
}



class RoomInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedId: 0 };
  }

  click(selectedId) {
    this.setState({ selectedId: selectedId });
  }

  componentDidMount() {
    this.props.getRoomInfo(this.state.selectedId);
  }

  render() {
    return <ul className="rooms-info-wrapper">
      {this.props.roomInfo.map((room, index) => <li className={"rooms-name " + (this.state.selectedId === index ? 'active' : '')} key={room.id} onClick={() => {
        this.props.getRoomInfo(this.state.selectedId);
        this.click(room.id);
      }}><span className="nav-room-name">{room.name}</span></li>)}
    </ul>
  }
}

ReactDOM.render(<ChatRoomApp />, document.getElementById('chatRoomApp'));


