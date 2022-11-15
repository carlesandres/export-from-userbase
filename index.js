import { execaCommand } from 'execa';
import { writeFile } from 'fs/promises';

const APP_ID = 'your app id goes here';
const ACCESS_TOKEN = 'your access token goes here';

const curlCommand = (nextPageToken) => {
  const tokenBit = nextPageToken ? `?nextPageToken=$${nextPageToken}` : '';
  const command = `curl -v\ https://v1.userbase.com/v1/admin/apps/${APP_ID}/users${tokenBit}\ -H\ Authorization:\\ Bearer\\ ${ACCESS_TOKEN}`;
  return command;
};

let users = [];

const getPage = async (nextPageToken) => {
  try {
    const aa = await execaCommand(curlCommand(nextPageToken));
    const json = JSON.parse(aa.stdout);
    users = [...users, ...json.users];
    if (json.nextPageToken) {
      await getPage(json.nextPageToken);
    }
  } catch (error) {
    console.log('error', error);
  }
};

await getPage();
let csvContent = '';

users.forEach(function (user) {
  const { username, creationDate } = user;
  let row = `${username}, ${creationDate}`;
  csvContent += row + '\r\n';
});

try {
  const data = new Uint8Array(Buffer.from(csvContent));
  await writeFile('userbase.csv', data);
} catch(err) {
  console.error(err);
}
console.log('csvContent', csvContent);
