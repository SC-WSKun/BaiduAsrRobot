export async function userAsk(question: string) {
  return fetch('https://wskun.club/userask', {
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
