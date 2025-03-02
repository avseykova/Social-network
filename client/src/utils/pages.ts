export const Pages = {
    Registration: { path: '/registration', name: 'registration' },
    Login: { path: '/login', name: 'login' },
    UserPage: {path: '/userPage', name: 'userPage'},
    Messages: {path: '/messages/:id', name: 'messages'},
    AllUsersPage: {path: '/allUsers', name: 'allUsers'},
    Chats: {path: '/chats', name: 'chats'},

  } as const;