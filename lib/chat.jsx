import Pusher from "pusher-js";
import { useState, useEffect, useRef } from "react";

export default function Chat() {

  // define a variable with a given state and a function that set that state to a new state
  // in this case set false and allow false to be set true when something happens
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketId, setSocketId] = useState();
  const [messageLog, setMessageLog] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const chatField = useRef(null);
  const chatLogElement = useRef(null);

  // setup one time only pusher connection regardless of how many times function is run on state checks
  useEffect(() => {
    //connect to pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHERKEY, {
      cluster: "us2"
    });


    // hold user socket id
    pusher.connection.bind("connected", () => {
      setSocketId(pusher.connection.socket_id);
    });


    const channel = pusher.subscribe("private-petchat");
    channel.bind("message", (data) => {

      setMessageLog(prev => {
        return [...prev, data];
      })

    });

  }, []);


  //check for any change in chat box and scroll to bottom 
  useEffect(() => {
    if (messageLog.length) {
      chatLogElement.current.scrollTop = chatLogElement.current.scrollHeight;

      // if chat box is not open increase unread message count each time chat state changes
      if (!isChatOpen) {
        setUnreadCount((prev) => {
          return prev + 1;
        });
      }

    }

  }, [messageLog]);


  function handleChatSubmit(event) {

    event.preventDefault();

    fetch("/admin/send-chat", {
      method: "POST",
      headers: { "Content_Type": "application/json" },
      body: JSON.stringify({ message: userMessage, socket_id: socketId })
    });

    setMessageLog((prev) => {
      return [...prev, { selfMessage: true, message: userMessage }];
    });

    setUserMessage("")

  }



  function handleInputChange(event) {
    setUserMessage(event.target.value.trim());

  }

  function openChatClick() {
    // make chat open true. open chat box
    setIsChatOpen(true);
    setUnreadCount(0);
    setTimeout(() => {
      chatField.current.focus();
    }, 350);
  }


  function closeChatClick() {
    // make chat open false. close chat box
    setIsChatOpen(false);
  }

  return (

    <>

      <div className="open-chat" onClick={openChatClick}>

        {/* if unread messages greater than 0 display unread number badge*/}

        {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount}</span>}

        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-chat-text-fill" viewBox="0 0 16 16">
          <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z" />
        </svg>

      </div>

      {/* check if chat open click function has fired, make chat box visible else leave chat box hidden */}
      <div className={isChatOpen ? "chat-container chat-container--visible" : "chat-container"}>

        <div className="chat-title-bar">
          <h4> Staff Team Chat</h4>
          <svg onClick={closeChatClick} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square-fill" viewBox="0 0 16 16">
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708" />
          </svg>
        </div> {/* chat title bar end */}

        <div ref={chatLogElement} className="chat-log">

          {/* dispplay dynamic chat messages */}

          {
            messageLog.map((item, index) => {
              return (

                // if message is self message use self styles else use regular chat style
                <div key={index} className={item.selfMessage ? "chat-message chat-message--self" : "chat-message"}>
                  <div className="chat-message-inner">
                    {item.message}
                  </div>
                </div>

              );
            })
          }


        </div> {/* chat log end */}

        <form onSubmit={handleChatSubmit}>
          <input value={userMessage} ref={chatField}
            onChange={handleInputChange} type="text" autoComplete="off" placeholder="Your Message Here" />
        </form> {/* chat input end */}

      </div> {/* chat container end */}

      {/* chat feature end */}


    </>
  )
}