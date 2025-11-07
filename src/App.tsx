import AvatarCanvas from './components/Avatar/AvatarCanvas'

function App() {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 z-10 p-8 text-center text-white"
        style={{ background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent)' }}
      >
        <h1 className="m-0 text-3xl font-bold">AIアバターシステム</h1>
        <p className="mt-2 mb-0 text-base opacity-90">Phase 1 - VRM Avatar Display</p>
      </div>
      <AvatarCanvas />
    </div>
  )
}

export default App
