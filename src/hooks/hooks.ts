export async function userAsk(question: string) {
  return fetch('https://wskun.club/wangcai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: '1',
      chatId: '1',
      message: question,
    }),
  }).then(res => res.json());
}

export async function emotionAsk(question: string, emotion: string) {
  return fetch('https://wskun.club/emotionask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: '1',
      chatId: '1',
      message: question,
      emotion: emotion,
    }),
  }).then(res => res.json());
}

export async function directionAsk(question: string) {
  return fetch('https://wskun.club/directionask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: '1',
      chatId: '1',
      message: question,
    }),
  }).then(res => res.json());
}

export async function communicateAsk(question: string) {
  return fetch('https://wskun.club/normalask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: '1',
      chatId: '1',
      message: question,
    }),
  })
    .then(res => {
      console.info('normalask res:', res);
      return res.json();
    })
    .catch(err => console.log(err));
}

export async function commandAsk(question: string) {
  return fetch('https://wskun.club/commandask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: '1',
      chatId: '1',
      message: question,
    }),
  })
    .then(res => {
      console.info('commandAsk res:', res);
      return res.json();
    })
    .catch(err => console.log(err));
}