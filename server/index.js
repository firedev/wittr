import Server from './Server';
import Settings from './Settings';

const server = new Server(8888);
const settings = new Settings(8889);

settings.listen();
server.setConnectionType('perfect');

settings.on('connectionChange', ({type}) => {
  server.setConnectionType(type);
});