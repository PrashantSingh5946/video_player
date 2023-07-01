import { useState } from 'react';
import './App.css';
import Player from './components/player';
import Modal from './components/modal';

function App() {

  const [isModalVisible, setIsModalVisible] = useState(true);

  return (
    <div className="App">
      {isModalVisible && <Modal close={setIsModalVisible}/>}
     { !isModalVisible && <Player url="/videos/video.mp4"/>}
    </div>
  );
}

export default App;
