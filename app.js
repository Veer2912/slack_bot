const { App } = require('@slack/bolt');
require('dotenv').config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


// Listen for the global shortcut
app.shortcut('send_message', async ({ shortcut, ack, client }) => {
  
  await ack();

  try {
    // Open a dialog box
    await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'send_message_view',
        title: {
          type: 'plain_text',
          text: 'Send a Message'
        },
        blocks: [
          {
            type: 'input',
            block_id: 'user_block',
            element: {
              type: 'users_select',
              action_id: 'user'
            },
            label: {
              type: 'plain_text',
              text: 'Select a user'
            }
          },
          {
            type: 'input',
            block_id: 'message_block',
            element: {
              type: 'rich_text_input',
              action_id: 'message'
            },
            label: {
              type: 'plain_text',
              text: 'Message'
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Send'
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
});


app.view('send_message_view', async ({ ack, view, client }) => {
  await ack();

  const user = view.state.values.user_block.user.selected_user;
  const message = view.state.values.message_block.message.rich_text_value;
  if (!message) {
    console.error('Message is empty');
    return;
  }
  try {
    await client.chat.postMessage({
      channel: user,
      text: message
    });
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  
  await app.start(process.env.PORT);
  console.log(' app is running!');
})();
