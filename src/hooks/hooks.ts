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

export async function directionAsk(question: string){
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

export async function communicateAsk(question: string){
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
  }).then(res => res.json()).catch(err => console.log(err));
}