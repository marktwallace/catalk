const handleExampleMessage = (message, ws) => {
  console.log('Handling example message:', message);

  // Example response logic
  const response = { type: 'example', payload: 'This is an example response' };
  ws.send(JSON.stringify(response));
};

module.exports = { handleExampleMessage };
