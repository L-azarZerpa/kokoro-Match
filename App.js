import { registerRootComponent } from 'expo';
import './global.css';

import RootApp from './index';

function App() {
  return <RootApp />;
}

registerRootComponent(App);