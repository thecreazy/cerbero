// cerbero main web worker

self.addEventListener('message', (e) => {
  const message = e.data || e;

  switch (message.type) {
    case 'init':
      break;

    default:
      break;
  }
});
