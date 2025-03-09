export const Pages = {
    Registration: { path: '/registration', name: 'registration' },
    Login: { path: '/login', name: 'login' },
    UserPage: {path: '/userPage/:id', name: 'userPage'},
    Messages: {path: '/messages/:id', name: 'messages'},
    AllUsersPage: {path: '/allUsers', name: 'allUsers'},
    Chats: {path: '/chats', name: 'chats'},
    Home: {path: '/home', name: 'home'},

  } as const;