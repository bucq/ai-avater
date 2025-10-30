import './App.css'
import AvatarCanvas from './components/Avatar/AvatarCanvas'

function App() {
  return (
    <div className="app">
      <div className="header">
        <h1>AIアバターシステム</h1>
        <p>Phase 1 - VRM Avatar Display</p>
      </div>
      <AvatarCanvas />
    </div>
  )
}

export default App
