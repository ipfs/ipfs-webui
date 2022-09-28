declare module 'redux-bundler-react' {
  interface Connect {
  }

  interface Provider extends React.Provider {
  }
  
  declare export const Provider: Provider;

  declare export const connect: Connect
}
